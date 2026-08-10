import { useState, useRef, useCallback } from 'react';
import { daybookApi, notaryApi } from '../../api';
import type { TrustType, TrustCategory, ServiceType, ReceiptDelivery } from '../../types';
import type { DaybookEntry } from '../../types';
import type { NotaryResponse } from '../../types';

interface NewEntryFormProps {
  onSuccess: (entry: DaybookEntry) => void;
}

function SectionCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="w-7 h-7 rounded-md bg-maroon-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-maroon-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SelectionCard<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; sublabel?: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 text-center transition-all duration-150 ${
              selected
                ? 'border-maroon-800 bg-maroon-50/50 shadow-md shadow-maroon-800/10'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {selected && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-maroon-800 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <span className={`text-base font-bold ${selected ? 'text-maroon-900' : 'text-gray-700'}`}>
              {opt.label}
            </span>
            {opt.sublabel && (
              <span className="text-[11px] text-gray-400 leading-tight">{opt.sublabel}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/20 focus:border-maroon-600 transition-all bg-white";

export default function NewEntryForm({ onSuccess }: NewEntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trustType, setTrustType] = useState<TrustType | null>(null);
  const [trustCategory, setTrustCategory] = useState<TrustCategory | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [registrationFee, setRegistrationFee] = useState('');
  const [receiptDelivery, setReceiptDelivery] = useState<ReceiptDelivery | null>(null);
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

    if (required(trustType) || required(trustCategory) || required(serviceType) || required(receiptDelivery) || required(clientName) || !selectedNotary) {
      setError('Please fill in all required fields');
      return;
    }

    if (receiptDelivery === 'EMAIL' && !clientEmail.trim()) {
      setError('Client email is required when receipt delivery is set to email');
      return;
    }

    if (receiptDelivery === 'SMS' && !clientTelephone.trim()) {
      setError('Client telephone is required when receipt delivery is set to SMS');
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
        receiptDelivery: receiptDelivery!,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Trust Type */}
      <SectionCard icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" title="Trust Type">
        <SelectionCard
          options={[
            { value: 'EXPRESS' as TrustType, label: 'E — Express Trust', sublabel: 'Expedited processing for urgent registrations' },
            { value: 'NORMAL' as TrustType, label: 'N — Normal Trust', sublabel: 'Standard processing for regular deeds' },
          ]}
          value={trustType}
          onChange={setTrustType}
        />
      </SectionCard>

      {/* Trust Category */}
      <SectionCard icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" title="Trust Category">
        <SelectionCard
          options={[
            { value: 'LOCAL' as TrustCategory, label: 'Local', sublabel: 'Sri Lankan jurisdiction' },
            { value: 'FOREIGN' as TrustCategory, label: 'Foreign', sublabel: 'International jurisdiction' },
          ]}
          value={trustCategory}
          onChange={setTrustCategory}
        />
      </SectionCard>

      {/* Client Details */}
      <SectionCard icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" title="Client & Notary Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              placeholder="Full name of client"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Notary Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                className={`${inputClass} ${notarySearching ? 'pr-10' : ''}`}
                value={notaryQuery}
                onChange={(e) => handleNotarySearch(e.target.value)}
                placeholder="Search notary by name or NIC..."
              />
              {notarySearching && (
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              )}
              {showNotaryDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {notarySearchResults.map((n) => (
                    <button key={n.id} type="button" onClick={() => selectNotary(n)}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer">
                      <span className="font-medium text-gray-800">{n.fullName}</span>
                      <span className="text-xs text-gray-400 ml-2">{n.nic} &middot; {n.district}</span>
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
              <p className="mt-1 text-xs text-gray-400">Reg: {selectedNotary.notaryRegistrationNumber} &middot; {selectedNotary.district}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Email Address {receiptDelivery === 'EMAIL' && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/20 focus:border-maroon-600 transition-all bg-white"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Telephone</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <input
                className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/20 focus:border-maroon-600 transition-all bg-white"
                value={clientTelephone}
                onChange={(e) => setClientTelephone(e.target.value)}
                placeholder="077 123 4567"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Deed Number</label>
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
                  <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
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
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Client Address</label>
            <textarea
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/20 focus:border-maroon-600 transition-all bg-white resize-none"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              rows={2}
              placeholder="Full address of client"
            />
          </div>
        </div>
      </SectionCard>

      {/* Service Details */}
      <SectionCard icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" title="Service Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Service Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['ONE_DAY', 'GENERAL'] as ServiceType[]).map((s) => {
                const selected = serviceType === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setServiceType(s)}
                    className={`flex flex-col items-center gap-1 py-3 px-3 rounded-xl border-2 text-center transition-all duration-150 ${
                      selected
                        ? 'border-maroon-800 bg-maroon-50/50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-xs font-bold ${selected ? 'text-maroon-900' : 'text-gray-700'}`}>
                      {s === 'ONE_DAY' ? 'One Day' : 'General'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {s === 'ONE_DAY' ? '24hr processing' : 'Standard turnaround'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Registration Fee (Rs) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-medium text-sm">Rs</span>
              <input
                type="number"
                className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon-600/20 focus:border-maroon-600 transition-all bg-white"
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
      </SectionCard>

      {/* Receipt Delivery */}
      <SectionCard icon="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" title="Receipt Delivery">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['EMAIL', 'SMS', 'PRINT'] as ReceiptDelivery[]).map((d) => {
            const selected = receiptDelivery === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setReceiptDelivery(d)}
                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  selected
                    ? 'border-maroon-800 bg-maroon-50/50 shadow-md shadow-maroon-800/10'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {selected && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-maroon-800 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  selected ? 'bg-maroon-800 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {d === 'EMAIL' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : d === 'SMS' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${selected ? 'text-maroon-900' : 'text-gray-700'}`}>
                    {d === 'EMAIL' ? 'Send via Email' : d === 'SMS' ? 'Send via SMS' : 'Print Receipt'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {d === 'EMAIL' ? 'Receipt will be emailed to the client address' : d === 'SMS' ? 'Receipt will be sent as a text message' : 'Receipt will be printed at the counter desk'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Submit */}
      <div className="flex items-center justify-between gap-4 p-5 bg-gradient-to-r from-maroon-800/5 to-maroon-600/5 rounded-xl border border-maroon-200/50">
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">Ready to submit?</p>
          <p className="text-xs text-gray-400 mt-0.5">This will create a new daybook entry in the system</p>
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-maroon-800 to-maroon-700 text-white text-sm font-semibold rounded-xl hover:from-maroon-900 hover:to-maroon-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-maroon-800/20 active:scale-[0.98]"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2.5">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating Entry...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Daybook Entry
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
