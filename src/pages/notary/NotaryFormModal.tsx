import { useState, useEffect } from 'react';
import { notaryApi } from '../../api';
import type { NotaryResponse } from '../../types';

interface Props {
  notary: NotaryResponse | null;
  onClose: () => void;
  onSaved: () => void;
}

const districts = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya',
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DEREGISTERED', label: 'Deregistered' },
];

export default function NotaryFormModal({ notary, onClose, onSaved }: Props) {
  const isEdit = !!notary;
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [notaryRegistrationNumber, setNotaryRegistrationNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [registeredDate, setRegisteredDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (notary) {
      setFullName(notary.fullName);
      setNic(notary.nic);
      setNotaryRegistrationNumber(notary.notaryRegistrationNumber);
      setDistrict(notary.district || '');
      setRegisteredDate(notary.registeredDate || '');
      setStatus(notary.status);
    }
  }, [notary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        fullName,
        nic,
        notaryRegistrationNumber,
        district: district || undefined,
        registeredDate: registeredDate || null,
        status: isEdit ? undefined : (status as 'ACTIVE' | 'SUSPENDED' | 'DEREGISTERED'),
      };

      if (isEdit) {
        await notaryApi.update(notary!.id, payload);
        if (status !== notary!.status) {
          await notaryApi.updateStatus(notary!.id, status);
        }
      } else {
        await notaryApi.create({ ...payload, status: status as 'ACTIVE' | 'SUSPENDED' | 'DEREGISTERED' });
      }
      onSaved();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Failed to save notary. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            {isEdit ? 'Edit notary' : 'Add new notary'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIC *</label>
            <input
              type="text"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
              readOnly={isEdit}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400 ${
                isEdit ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration number *</label>
            <input
              type="text"
              value={notaryRegistrationNumber}
              onChange={(e) => setNotaryRegistrationNumber(e.target.value)}
              required
              readOnly={isEdit}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400 ${
                isEdit ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 bg-white appearance-none cursor-pointer"
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registered date</label>
            <input
              type="date"
              value={registeredDate}
              onChange={(e) => setRegisteredDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 bg-white appearance-none cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? 'Save changes' : 'Add notary'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
