import { useState, useRef, useCallback } from 'react';
import { daybookApi, notaryApi } from '../../api';
import type { TrustType, TrustCategory, ServiceType } from '../../types';
import type { DaybookEntry } from '../../types';
import type { NotaryResponse } from '../../types';

interface NewEntryFormProps {
  onSuccess: (entry: DaybookEntry) => void;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold text-slate-800 mb-4">{title}</h3>
  );
}

function OptionPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              selected
                ? 'border-maroon-800 bg-maroon-800 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/20 focus:border-maroon-600 transition-all bg-white";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export default function NewEntryForm({ onSuccess }: NewEntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trustType, setTrustType] = useState<TrustType | null>(null);
  const [trustCategory, setTrustCategory] = useState<TrustCategory | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [registrationFee, setRegistrationFee] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [notaryQuery, setNotaryQuery] = useState('');
  const [notarySearchResults, setNotarySearchResults] = useState<NotaryResponse[]>([]);
  const [selectedNotary, setSelectedNotary] = useState<NotaryResponse | null>(null);
  const [showNotaryDropdown, setShowNotaryDropdown] = useState(false);
  const [notarySearching, setNotarySearching] = useState(false);
  const [deedNumber, setDeedNumber] = useState('');
  const [deedNumberError, setDeedNumberError] = useState('');
  const [checkingDeed, setCheckingDeed] = useState(false);
  const deedCheckRef = useRef<number>(0);

  const [clientAddress, setClientAddress] = useState('');

  const required = (v: string | null | object) => !v || (typeof v === 'string' && !v.trim());

  const checkDeedNumber = (name: string | null, deed: string) => {
    if (!name || !deed.trim()) return;
    const callId = ++deedCheckRef.current;
    setCheckingDeed(true);
    setDeedNumberError('');
    daybookApi.checkDeedNumber(name, deed.trim())
      .then((taken) => {
        if (callId !== deedCheckRef.current) return;
        if (taken) {
          setDeedNumberError('This deed number already exists for the specified notary');
        }
      })
      .catch(() => {
        if (callId !== deedCheckRef.current) return;
      })
      .finally(() => {
        if (callId === deedCheckRef.current) setCheckingDeed(false);
      });
  };

  const handleNotarySearch = useCallback(async (q: string) => {
    setNotaryQuery(q);
    setSelectedNotary(null);
    if (q.length < 2) { setNotarySearchResults([]); setShowNotaryDropdown(false); return; }
    setNotarySearching(true);
    try {
      const results = await notaryApi.search(q);
      setNotarySearchResults(results);
      setShowNotaryDropdown(results.length > 0);
    } catch { setNotarySearchResults([]); setShowNotaryDropdown(false); }
    finally { setNotarySearching(false); }
  }, []);

  function selectNotary(n: NotaryResponse) {
    setSelectedNotary(n);
    setNotaryQuery(n.fullName);
    setShowNotaryDropdown(false);
  }

  function getNotaryStatus() {
    if (!selectedNotary) return null;
    if (selectedNotary.status === 'ACTIVE') return { label: 'Verified — ACTIVE', style: 'text-green-700 bg-green-50 border-green-300' };
    return { label: `BLOCKED — ${selectedNotary.status}`, style: 'text-red-700 bg-red-50 border-red-300' };
  }

  const notaryStatus = getNotaryStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (required(trustType) || required(trustCategory) || required(serviceType) || required(clientName) || !selectedNotary) {
      setError('Please fill in all required fields');
      return;
    }

    if (deedNumberError) {
      setError(deedNumberError);
      return;
    }

    setLoading(true);
    try {
      const response = await daybookApi.create({
        trustType: trustType!,
        trustCategory: trustCategory!,
        clientName: clientName.trim(),
        notaryName: selectedNotary!.fullName,
        clientEmail: clientEmail.trim() || undefined,
        clientTelephone: clientTelephone.trim() || undefined,
        deedNumber: deedNumber.trim() || undefined,
        serviceType: serviceType!,
        registrationFee: Number(registrationFee) || 0,
        receiptDelivery: 'PRINT' as const,
        submitterName: clientName.trim() || undefined,
        submitterAddress: clientAddress.trim() || undefined,
      });
      onSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Trust Details */}
      <div className="border-b border-slate-200 pb-6">
        <SectionTitle title="Trust Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Trust Type <span className="text-red-500">*</span></label>
            <OptionPills
              options={[
                { value: 'EXPRESS' as TrustType, label: 'Express' },
                { value: 'NORMAL' as TrustType, label: 'Normal' },
              ]}
              value={trustType}
              onChange={setTrustType}
            />
          </div>
          <div>
            <label className={labelClass}>Trust Category <span className="text-red-500">*</span></label>
            <OptionPills
              options={[
                { value: 'LOCAL' as TrustCategory, label: 'Local' },
                { value: 'FOREIGN' as TrustCategory, label: 'Foreign' },
              ]}
              value={trustCategory}
              onChange={setTrustCategory}
            />
          </div>
        </div>
      </div>

      {/* Client & Notary Details */}
      <div className="border-b border-slate-200 pb-6">
        <SectionTitle title="Client & Notary Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Client Name <span className="text-red-500">*</span></label>
            <input
              className={inputClass}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              placeholder="Full name of client"
            />
          </div>
          <div>
            <label className={labelClass}>Notary Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                className={`${inputClass} ${notarySearching ? 'pr-10' : ''}`}
                value={notaryQuery}
                onChange={(e) => handleNotarySearch(e.target.value)}
                placeholder="Search notary by name or NIC..."
              />
              {notarySearching && (
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              )}
              {showNotaryDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {notarySearchResults.map((n) => (
                    <button key={n.id} type="button" onClick={() => selectNotary(n)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer">
                      <span className="font-medium text-slate-800">{n.fullName}</span>
                      <span className="text-xs text-slate-400 ml-2">{n.nic} &middot; {n.district}</span>
                      <span className={`text-[10px] font-medium ml-1 px-1.5 py-0.5 rounded ${
                        n.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{n.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {notaryStatus && (
              <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${notaryStatus.style}`}>
                {selectedNotary?.status === 'ACTIVE' ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                )}
                {notaryStatus.label}
              </div>
            )}
            {selectedNotary && selectedNotary.status === 'ACTIVE' && (
              <p className="mt-1 text-xs text-slate-400">Reg: {selectedNotary.notaryRegistrationNumber} &middot; {selectedNotary.district}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              className={inputClass}
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>Telephone</label>
            <input
              className={inputClass}
              value={clientTelephone}
              onChange={(e) => setClientTelephone(e.target.value)}
              placeholder="077 123 4567"
            />
          </div>
          <div>
            <label className={labelClass}>Deed Number</label>
            <div className="relative">
              <input
                className={`${inputClass} ${deedNumberError ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : ''} ${checkingDeed ? 'pr-10' : ''}`}
                value={deedNumber}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '');
                  setDeedNumber(digitsOnly);
                  setDeedNumberError('');
                }}
                onBlur={() => checkDeedNumber(selectedNotary?.fullName || notaryQuery, deedNumber)}
                placeholder="Numeric deed number"
              />
              {checkingDeed && (
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              )}
            </div>
            {deedNumberError && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {deedNumberError}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Client Address</label>
            <textarea
              className={`${inputClass} resize-none`}
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              rows={2}
              placeholder="Full address of client"
            />
          </div>
        </div>
      </div>

      {/* Service & Payment */}
      <div className="border-b border-slate-200 pb-6">
        <SectionTitle title="Service & Payment" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Service Type <span className="text-red-500">*</span></label>
            <OptionPills
              options={[
                { value: 'ONE_DAY' as ServiceType, label: 'One Day' },
                { value: 'GENERAL' as ServiceType, label: 'General' },
              ]}
              value={serviceType}
              onChange={setServiceType}
            />
          </div>
          <div>
            <label className={labelClass}>Registration Fee (Rs) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">Rs</span>
              <input
                type="number"
                className={`${inputClass} pl-10`}
                value={registrationFee}
                onChange={(e) => setRegistrationFee(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Delivery */}
      <div>
        <SectionTitle title="Receipt Delivery" />
        <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50">
          <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-slate-800">Print Receipt</p>
            <p className="text-xs text-slate-500">Receipt will be printed at the counter desk</p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <button
          type="submit"
          className="px-8 py-2.5 bg-maroon-800 text-white text-sm font-semibold rounded-lg hover:bg-maroon-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={loading}
        >
          {loading ? 'Creating Entry...' : 'Create Daybook Entry'}
        </button>
      </div>
    </form>
  );
}
