import { useState } from 'react';
import { daybookApi } from '../../api';
import { StatusBadge } from '../../components/shared';
import type { DaybookEntry } from '../../types';

interface SixMonthUpdateFormProps {
  onSuccess: (entry: DaybookEntry) => void;
}

export default function SixMonthUpdateForm({ onSuccess }: SixMonthUpdateFormProps) {
  const [searchNumber, setSearchNumber] = useState('');
  const [original, setOriginal] = useState<DaybookEntry | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');

  const handleSearch = async () => {
    if (!searchNumber.trim()) return;
    setSearching(true);
    setSearchError('');
    setOriginal(null);
    try {
      const entry = await daybookApi.getByDaybookNumber(searchNumber.trim().toUpperCase());
      if (entry.status !== 'REGISTERED') {
        setSearchError(
          `This deed exists but is not eligible for a six-month update (current status: ${entry.status}). Only REGISTERED deeds can have six-month updates.`,
        );
        return;
      }
      setOriginal(entry);
      setClientName(entry.clientName ?? '');
      setClientEmail(entry.clientEmail ?? '');
      setClientTelephone(entry.clientTelephone ?? '');
    } catch {
      setSearchError('Daybook number not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!original) return;
    setLoading(true);
    setError('');
    try {
      const response = await daybookApi.createUpdate({
        originalDaybookNumber: original.daybookNumber,
        clientName: clientName.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        clientTelephone: clientTelephone.trim() || undefined,
      });
      onSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create six-month update');
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {original && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>Original Deed — {original.daybookNumber}</h3>
          </div>
          <div className="card-body">
            <div className="detail-grid">
              <div><strong>Trust Type:</strong> {original.trustType}</div>
              <div><strong>Category:</strong> {original.trustCategory}</div>
              <div><strong>Client:</strong> {original.clientName ?? '-'}</div>
              <div><strong>Service:</strong> {original.serviceType ?? '-'}</div>
              <div><strong>Status:</strong> <StatusBadge status={original.status} /></div>
              {original.quarterlyUpdateNumber && (
                <div><strong>Update #:</strong> {original.quarterlyUpdateNumber}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {original && (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <p className="text-sm text-gray-500 mb-4">
            This will create six-month update #{(original.quarterlyUpdateNumber ?? 0) + 1} for this deed.
            Update client details below if they have changed.
          </p>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Client Name</label>
              <input
                className="form-input"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
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
          <div className="form-field">
            <label className="form-label">Telephone</label>
            <input
              className="form-input"
              value={clientTelephone}
              onChange={(e) => setClientTelephone(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Creating...' : 'Create Six-Month Update'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
