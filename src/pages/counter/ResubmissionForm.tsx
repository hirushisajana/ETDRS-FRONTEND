import { useState, useEffect } from 'react';
import { daybookApi } from '../../api';
import { StatusBadge } from '../../components/shared';
import type { DaybookEntry, TrustType, TrustCategory, ServiceType } from '../../types';

interface ResubmissionFormProps {
  prefillEntry?: DaybookEntry | null;
  onSuccess: (entry: DaybookEntry) => void;
}

export default function ResubmissionForm({ prefillEntry, onSuccess }: ResubmissionFormProps) {
  const [searchNumber, setSearchNumber] = useState('');
  const [original, setOriginal] = useState<DaybookEntry | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trustType, setTrustType] = useState<TrustType | null>(null);
  const [trustCategory, setTrustCategory] = useState<TrustCategory | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [deedNumber, setDeedNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [registrationFee, setRegistrationFee] = useState('');

  useEffect(() => {
    if (prefillEntry && !original) {
      setOriginal(prefillEntry);
      setTrustType(prefillEntry.trustType);
      setTrustCategory(prefillEntry.trustCategory);
      setClientName(prefillEntry.clientName ?? '');
      setClientEmail(prefillEntry.clientEmail ?? '');
      setClientTelephone(prefillEntry.clientTelephone ?? '');
      setDeedNumber(prefillEntry.deedNumber ?? '');
      setServiceType(prefillEntry.serviceType);
      setRegistrationFee(prefillEntry.registrationFee?.toString() ?? '');
    }
  }, [prefillEntry]);

  const handleSearch = async () => {
    if (!searchNumber.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const entry = await daybookApi.getByDaybookNumber(searchNumber.trim());
      if (entry.status === 'REJECTED') {
        setSearchError('This deed has been rejected and cannot be re-submitted');
        return;
      }
      if (entry.status !== 'PENDING_CORRECTION') {
        setSearchError('Only deeds pending correction can be re-submitted');
        return;
      }
      setOriginal(entry);
      prefillFromEntry(entry);
    } catch {
      setSearchError('Daybook number not found');
    } finally {
      setSearching(false);
    }
  };

  function prefillFromEntry(entry: DaybookEntry) {
    setTrustType(entry.trustType);
    setTrustCategory(entry.trustCategory);
    setClientName(entry.clientName ?? '');
    setClientEmail(entry.clientEmail ?? '');
    setClientTelephone(entry.clientTelephone ?? '');
    setDeedNumber(entry.deedNumber ?? '');
    setServiceType(entry.serviceType);
    setRegistrationFee(entry.registrationFee?.toString() ?? '');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!original) return;
    if (!confirmed) {
      setError('Please confirm re-submission by checking the box');
      return;
    }
    if (!trustType || !trustCategory || !serviceType || !clientName.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await daybookApi.createResubmission({
        originalDaybookNumber: original.daybookNumber,
        trustType,
        trustCategory,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || undefined,
        clientTelephone: clientTelephone.trim() || undefined,
        deedNumber: deedNumber.trim() || undefined,
        serviceType,
        registrationFee: Number(registrationFee) || 0,
        receiptDelivery: 'PRINT' as const,
      });
      onSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create re-submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!prefillEntry && !original && (
        <div>
          <div className="form-inline">
            <div className="flex-1">
              <label className="form-label">Original Daybook Number</label>
              <input
                className="form-input"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                placeholder="e.g. KAN/E/000001/2026"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={searching || !searchNumber.trim()}
              style={{ marginBottom: 0 }}
            >
              {searching ? 'Searching...' : 'Lookup'}
            </button>
          </div>
          {searchError && <p className="text-red-600 text-sm mb-3">{searchError}</p>}
        </div>
      )}

      {original && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>Original Deed — {original.daybookNumber}</h3>
          </div>
          <div className="card-body">
            <div className="detail-grid mb-3">
              <div><strong>Trust Type:</strong> {original.trustType}</div>
              <div><strong>Category:</strong> {original.trustCategory}</div>
              <div><strong>Client:</strong> {original.clientName ?? '-'}</div>
              <div><strong>Service:</strong> {original.serviceType ?? '-'}</div>
              <div><strong>Status:</strong> <StatusBadge status={original.status} /></div>
              <div><strong>Fee:</strong> Rs {original.registrationFee?.toLocaleString() ?? '-'}</div>
            </div>
            {original.status === 'REJECTED' ? (
              <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <p className="font-semibold mb-1">This deed has been rejected.</p>
                <p className="text-xs text-red-600 mb-2">
                  Rejected deeds are permanent and cannot be edited or re-submitted.
                </p>
                {original.folioRejectionReason && (
                  <p className="text-xs text-red-700 mt-1">
                    <strong>Rejection reason:</strong> {original.folioRejectionReason}
                  </p>
                )}
              </div>
            ) : (
              !prefillEntry && (
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 accent-maroon-800"
                  />
                  <span>
                    I confirm this is a re-submission of <strong>{original.daybookNumber}</strong>.
                    The folio user will be notified.
                  </span>
                </label>
              )
            )}
          </div>
        </div>
      )}

      {original && original.status !== 'REJECTED' && (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <p className="text-sm text-gray-500 mb-4">
            A new daybook entry will be created linked to the original. Update the details below if needed.
          </p>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Trust Type *</label>
              <div className="flex gap-2">
                {(['EXPRESS', 'NORMAL'] as TrustType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrustType(t)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      trustType === t
                        ? 'bg-maroon-800 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {t === 'EXPRESS' ? 'Express' : 'Normal'}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Category *</label>
              <div className="flex gap-2">
                {(['LOCAL', 'FOREIGN'] as TrustCategory[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTrustCategory(c)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      trustCategory === c
                        ? 'bg-maroon-800 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {c === 'LOCAL' ? 'Local' : 'Foreign'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Client Name *</label>
              <input
                className="form-input"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Telephone</label>
              <input
                className="form-input"
                value={clientTelephone}
                onChange={(e) => setClientTelephone(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Deed Number</label>
              <input
                className="form-input"
                value={deedNumber}
                onChange={(e) => setDeedNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Service Type *</label>
              <div className="flex gap-2">
                {(['ONE_DAY', 'GENERAL'] as ServiceType[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setServiceType(s)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      serviceType === s
                        ? 'bg-maroon-800 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {s === 'ONE_DAY' ? 'One Day' : 'General'}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Fee (Rs) *</label>
              <input
                type="number"
                className="form-input"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Receipt Delivery</label>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-maroon-200 bg-maroon-50/50">
              <svg className="w-5 h-5 text-maroon-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-maroon-900">Print Receipt</p>
                <p className="text-xs text-gray-500">Receipt will be printed at the counter desk</p>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={loading || (!prefillEntry && !confirmed)}>
              {loading ? 'Creating...' : 'Submit Re-submission'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
