import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { daybookApi, notaryApi } from '../../api';
import { useAuth } from '../../contexts';
import { StatusBadge, LoadingSpinner } from '../../components/shared';
import type { DaybookEntry, DaybookEntryRequest, NotaryResponse } from '../../types';

export default function DaybookPendingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEntry, setSelectedEntry] = useState<DaybookEntry | null>(null);

  const [form, setForm] = useState({
    deedType: '', submitterName: '', submitterAddress: '',
    deedNumber: '', attestedDate: '', language: '',
    valueOfAmount: '', numberOfLots: '', registrationFee: '',
    division: '', volume: '', folioRef: '',
    returnDate: '', acceptorSignature: '', acceptorDate: '',
    registrarInitials: '', remarks: '',
  });
  const [notaryQuery, setNotaryQuery] = useState('');
  const [notaryResults, setNotaryResults] = useState<NotaryResponse[]>([]);
  const [selectedNotary, setSelectedNotary] = useState<NotaryResponse | null>(null);
  const [showNotaryDropdown, setShowNotaryDropdown] = useState(false);
  const [notarySearching, setNotarySearching] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const { data: pendingEntries, isLoading: pendingLoading } = useQuery({
    queryKey: ['daybook', 'pending'],
    queryFn: daybookApi.getPendingQueue,
    refetchInterval: 30_000,
  });

  const { data: yearEntries } = useQuery({
    queryKey: ['daybook', 'by-year', currentYear],
    queryFn: () => daybookApi.getByYear(currentYear),
    placeholderData: (prev) => prev,
  });

  const submitMutation = useMutation({
    mutationFn: (data: { id: number; body: DaybookEntryRequest }) =>
      daybookApi.enterDaybookData(data.id, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
      setSelectedEntry(null);
      resetForm();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string }, status?: number }, message?: string };
      console.error('Submit daybook error:', axiosErr?.response?.status, axiosErr?.response?.data, axiosErr?.message);
      setError(axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to submit daybook data');
    },
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const yearEntriesList = yearEntries || [];
  const pendingList = pendingEntries || [];

  const completedToday = yearEntriesList.filter((e) => {
    const updated = e.updatedAt ? e.updatedAt.substring(0, 10) : '';
    return updated === todayStr && e.status === 'DAYBOOK_ENTERED';
  }).length;

  const totalThisMonth = yearEntriesList.filter((e) => {
    const month = e.createdAt ? parseInt(e.createdAt.substring(5, 7), 10) - 1 : -1;
    return month === currentMonth;
  }).length;

  const nextEntry = pendingList.length > 0 ? pendingList[0] : null;

  function resetForm() {
    setForm({
      deedType: '', submitterName: '', submitterAddress: '',
      deedNumber: '', attestedDate: '', language: '',
      valueOfAmount: '', numberOfLots: '', registrationFee: '',
      division: '', volume: '', folioRef: '',
      returnDate: '', acceptorSignature: '', acceptorDate: '',
      registrarInitials: '', remarks: '',
    });
    setNotaryQuery('');
    setNotaryResults([]);
    setSelectedNotary(null);
    setShowNotaryDropdown(false);
    setError('');
  }

  function handleSelectEntry(entry: DaybookEntry) {
    setSelectedEntry(entry);
    setForm({
      deedType: entry.deedType || '', submitterName: entry.submitterName || '',
      submitterAddress: entry.submitterAddress || '',
      deedNumber: entry.deedNumber || '',
      attestedDate: entry.attestedDate || '', language: entry.language || '',
      valueOfAmount: entry.valueOfAmount?.toString() || '',
      numberOfLots: entry.numberOfLots?.toString() || '',
      registrationFee: entry.registrationFee?.toString() || '',
      division: entry.division || '', volume: entry.volume || '',
      folioRef: entry.folioRef || '',
      returnDate: entry.returnDate || '',
      acceptorSignature: entry.acceptorSignature || '',
      acceptorDate: entry.acceptorDate || '',
      registrarInitials: entry.registrarInitials || '',
      remarks: entry.remarks || '',
    });
    if (entry.notaryName) {
      setNotaryQuery(entry.notaryName);
      if (entry.notaryId) {
        setSelectedNotary({ id: entry.notaryId, fullName: entry.notaryName, nic: '', notaryRegistrationNumber: '', district: '', status: 'ACTIVE', registeredDate: null, createdAt: null });
      }
    }
    setError('');
  }

  const handleNotarySearch = useCallback(async (q: string) => {
    setNotaryQuery(q);
    setSelectedNotary(null);
    if (q.length < 2) {
      setNotaryResults([]);
      setShowNotaryDropdown(false);
      return;
    }
    setNotarySearching(true);
    try {
      const results = await notaryApi.search(q);
      setNotaryResults(results);
      setShowNotaryDropdown(results.length > 0);
    } catch {
      setNotaryResults([]);
      setShowNotaryDropdown(false);
    } finally {
      setNotarySearching(false);
    }
  }, []);

  function selectNotary(n: NotaryResponse) {
    setSelectedNotary(n);
    setNotaryQuery(n.fullName);
    setShowNotaryDropdown(false);
  }

  function getNotaryStatus() {
    if (!selectedNotary) return null;
    if (selectedNotary.status === 'ACTIVE') {
      return { label: 'Verified — ACTIVE', style: 'text-green-700 bg-green-50 border-green-300' };
    }
    return { label: `BLOCKED — ${selectedNotary.status}`, style: 'text-red-700 bg-red-50 border-red-300' };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEntry) return;
    setError('');

    if (selectedNotary && selectedNotary.status !== 'ACTIVE') {
      setError('Notary is not ACTIVE. Entry is blocked.');
      return;
    }

    const body: DaybookEntryRequest = {
      deedType: form.deedType,
      submitterName: form.submitterName,
      attestedDate: form.attestedDate,
      language: form.language,
    };
    if (form.submitterAddress) body.submitterAddress = form.submitterAddress;
    if (selectedNotary) body.notaryId = selectedNotary.id;
    if (form.valueOfAmount) body.valueOfAmount = parseFloat(form.valueOfAmount);
    if (form.numberOfLots) body.numberOfLots = parseInt(form.numberOfLots, 10);
    if (form.division) body.division = form.division;
    if (form.volume) body.volume = form.volume;
    if (form.folioRef) body.folioRef = form.folioRef;
    if (form.returnDate) body.returnDate = form.returnDate;
    if (form.acceptorSignature) body.acceptorSignature = form.acceptorSignature;
    if (form.acceptorDate) body.acceptorDate = form.acceptorDate;
    if (form.registrarInitials) body.registrarInitials = form.registrarInitials;
    if (form.remarks) body.remarks = form.remarks;

    submitMutation.mutate({ id: selectedEntry.id, body });
  }

  if (pendingLoading) return <LoadingSpinner />;

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const statCards = [
    { label: 'Pending Entries', value: pendingList.length, accent: 'border-l-amber-600', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-amber-50 text-amber-700' },
    { label: 'Completed Today', value: completedToday, accent: 'border-l-green-600', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-green-50 text-green-700' },
    { label: 'Next to Process', value: nextEntry ? nextEntry.daybookNumber : '—', accent: 'border-l-blue-600', icon: 'M3 8.688c0-.864.933-1.406 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.954l-7.108 4.062A1.125 1.125 0 013 16.812V8.688zM12.75 8.688c0-.864.933-1.406 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.954l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z', iconBg: 'bg-blue-50 text-blue-700' },
    { label: 'Total This Month', value: totalThisMonth, accent: 'border-l-maroon-700', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', iconBg: 'bg-maroon-50 text-maroon-700' },
  ];

  if (selectedEntry) {
    const notaryStatus = getNotaryStatus();
    const isBlocked = selectedNotary && selectedNotary.status !== 'ACTIVE';

    return (
      <div className="p-6 lg:p-8 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Daybook Entry</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Daybook #{selectedEntry.daybookNumber} &bull; {selectedEntry.trustType} &bull; {selectedEntry.trustCategory}
            </p>
          </div>
          <button
            onClick={() => { setSelectedEntry(null); resetForm(); }}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            &larr; Back to queue
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Entry Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Entry Information</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Daybook Number</label>
                <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  {selectedEntry.daybookNumber}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date & Time of Receipt</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  {selectedEntry.createdAt
                    ? new Date(selectedEntry.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
                    : '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Deed Type</label>
                <input
                  required
                  value={form.deedType}
                  onChange={(e) => setForm({ ...form, deedType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="e.g. Trust Deed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Deed Number</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  {selectedEntry.deedNumber || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Submitter */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Submitter Details</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Name of Person Submitting <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.submitterName}
                  onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
                <input
                  value={form.submitterAddress}
                  onChange={(e) => setForm({ ...form, submitterAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="Address"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Attested Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.attestedDate}
                  onChange={(e) => setForm({ ...form, attestedDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Language <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="e.g. Sinhala, Tamil, English"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Notary Verification */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Notary Verification</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Search by name or NIC against the internal notary registry</p>
            </div>
            <div className="p-5">
              <div className="relative max-w-md">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      value={notaryQuery}
                      onChange={(e) => handleNotarySearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                      placeholder="Type notary name or NIC..."
                    />
                    {notarySearching && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    )}
                    {showNotaryDropdown && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {notaryResults.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => selectNotary(n)}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer"
                          >
                            <span className="font-medium text-gray-800">{n.fullName}</span>
                            <span className="text-xs text-gray-400 ml-2">{n.nic} &middot; {n.district}</span>
                            <span className={`text-[10px] font-medium ml-2 px-1.5 py-0.5 rounded ${
                              n.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {n.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {notaryStatus && (
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${notaryStatus.style}`}>
                    {selectedNotary?.status === 'ACTIVE' ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    )}
                    {notaryStatus.label}
                  </div>
                )}
                {selectedNotary && selectedNotary.status === 'ACTIVE' && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    Reg. No: {selectedNotary.notaryRegistrationNumber} &middot; District: {selectedNotary.district}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Financial */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Financial Details</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Value of Amount (Rs)</label>
                <input
                  type="number"
                  value={form.valueOfAmount}
                  onChange={(e) => setForm({ ...form, valueOfAmount: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="0.00"
                  min="0"
                  max="9999999999999.99"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Number of Lots</label>
                <input
                  type="number"
                  value={form.numberOfLots}
                  onChange={(e) => setForm({ ...form, numberOfLots: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Registration Fee (Rs)</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 tabular-nums">
                  {selectedEntry.registrationFee != null ? `Rs ${selectedEntry.registrationFee.toLocaleString()}` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Folio Reference */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Division, Volume & Folio Reference</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Division</label>
                <input
                  value={form.division}
                  onChange={(e) => setForm({ ...form, division: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="Division"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Volume</label>
                <input
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="Volume"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Folio Reference</label>
                <input
                  value={form.folioRef}
                  onChange={(e) => setForm({ ...form, folioRef: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="Folio #"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Completion */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Completion Details</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date of Returning Instrument</label>
                <input
                  type="date"
                  value={form.returnDate}
                  onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Signature of Acceptor</label>
                <input
                  value={form.acceptorSignature}
                  onChange={(e) => setForm({ ...form, acceptorSignature: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Acceptor Date</label>
                <input
                  type="date"
                  value={form.acceptorDate}
                  onChange={(e) => setForm({ ...form, acceptorDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Registrar / Clerk Initials</label>
                <input
                  value={form.registrarInitials}
                  onChange={(e) => setForm({ ...form, registrarInitials: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                  placeholder="Initials"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Remarks */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Remarks</h2>
            </div>
            <div className="p-5">
              <textarea
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all resize-none"
                placeholder="Any additional notes or remarks..."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitMutation.isPending || !!isBlocked}
              className="px-6 py-2.5 bg-maroon-700 hover:bg-maroon-800 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              {submitMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Daybook Entry'}
            </button>
            {isBlocked && (
              <span className="text-xs text-red-600 font-medium">Cannot submit — notary is blocked</span>
            )}
            <p className="text-[11px] text-gray-400 ml-auto">
              Submitting will auto-create a folio record for the Folio User
            </p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {greeting}, {user?.fullName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-300" />
            <span className="text-xs font-medium text-gray-500">{pendingList.length} pending</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, accent, icon, iconBg }) => (
          <div
            key={label}
            className={`bg-white rounded-xl border border-gray-200 border-l-[3px] ${accent} p-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">{label}</p>
              <div className={`p-2 rounded-lg ${iconBg} shrink-0 ml-2`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Pending List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Pending Queue</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Entries in daybook number order — click to enter data</p>
          </div>
        </div>
        {pendingList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No pending entries</p>
            <p className="text-xs text-gray-400 mt-1">All daybook entries have been processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  {['Daybook #', 'Type', 'Category', 'Client', 'Service', 'Fee', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingList.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    onClick={() => handleSelectEntry(entry)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800">{entry.daybookNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        entry.trustType === 'EXPRESS' ? 'bg-maroon-100 text-maroon-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {entry.trustType === 'EXPRESS' ? 'E' : 'N'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{entry.trustCategory}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{entry.clientName ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.serviceType ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700 tabular-nums">
                      {entry.registrationFee != null ? `Rs ${entry.registrationFee.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
