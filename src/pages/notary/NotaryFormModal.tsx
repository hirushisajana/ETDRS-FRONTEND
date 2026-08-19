import { useState } from 'react';
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

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

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

  const [prevNotary, setPrevNotary] = useState<NotaryResponse | null>(null);
  if (notary && notary !== prevNotary) {
    setPrevNotary(notary);
    setFullName(notary.fullName);
    setNic(notary.nic);
    setNotaryRegistrationNumber(notary.notaryRegistrationNumber);
    setDistrict(notary.district || '');
    setRegisteredDate(notary.registeredDate || '');
    setStatus(notary.status);
  }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {isEdit ? 'Edit notary' : 'Add new notary'}
          </h3>
          <button onClick={onClose} className="cursor-pointer text-slate-400 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">NIC *</label>
            <input
              type="text"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
              readOnly={isEdit}
              className={`${inputClass} ${
                isEdit ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Registration number *</label>
            <input
              type="text"
              value={notaryRegistrationNumber}
              onChange={(e) => setNotaryRegistrationNumber(e.target.value)}
              required
              readOnly={isEdit}
              className={`${inputClass} ${
                isEdit ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className={`${inputClass} cursor-pointer appearance-none`}
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Registered date</label>
            <input
              type="date"
              value={registeredDate}
              onChange={(e) => setRegisteredDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${inputClass} cursor-pointer appearance-none`}
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
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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