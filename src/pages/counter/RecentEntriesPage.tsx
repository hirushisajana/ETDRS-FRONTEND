import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { daybookApi } from '../../api';
import { PageHeader, StatusBadge, LoadingSpinner, EmptyState, ErrorState, Pagination } from '../../components/shared';
import ReceiptModal from './ReceiptModal';
import type { DaybookEntry, ReceiptResponse } from '../../types';

const PAGE_SIZE = 10;

export default function RecentEntriesPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);

  const { data: entries, isLoading, isError, error } = useQuery({
    queryKey: ['daybook', 'recent'],
    queryFn: () => daybookApi.getRecent(200),
  });

  const handleViewReceipt = async (entryId: number) => {
    setReceiptLoading(true);
    try {
      const r = await daybookApi.getReceipt(entryId);
      setReceipt(r);
    } catch {
      alert('Could not load receipt');
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleResend = async (entry: DaybookEntry) => {
    setResendingId(entry.id);
    try {
      await daybookApi.resendReceipt(entry.id);
      alert(`Receipt email resent to ${entry.clientEmail}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr?.response?.data?.message || 'Failed to resend receipt email');
    } finally {
      setResendingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries || []).filter((e) => {
      if (statusFilter && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (e.daybookNumber ?? '').toLowerCase().includes(q) ||
        (e.clientName ?? '').toLowerCase().includes(q) ||
        (e.deedNumber ?? '').toLowerCase().includes(q)
      );
    });
  }, [entries, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusOptions = Array.from(new Set((entries || []).map((e) => e.status))).sort();

  const errorMessage =
    error instanceof Error && error.message
      ? `Could not load recent entries: ${error.message}`
      : 'Could not load recent entries. Please try again.';

  return (
    <div className="p-6">
      <PageHeader
        title="Recent Entries"
        description="Latest daybook entries created at this registry"
      />

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by daybook #, client or deed #..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <ErrorState message={errorMessage} />
        ) : !pageItems.length ? (
          <EmptyState message="No entries found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['Daybook #', 'Client', 'Type', 'Category', 'Service', 'Fee', 'Status', 'Receipt'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-800">{entry.daybookNumber}</td>
                    <td className="px-5 py-3 text-slate-700">{entry.clientName ?? '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.trustType === 'EXPRESS' ? 'bg-maroon-100 text-maroon-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {entry.trustType === 'EXPRESS' ? 'E' : 'N'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{entry.trustCategory}</td>
                    <td className="px-5 py-3 text-slate-600">{entry.serviceType ?? '-'}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {entry.registrationFee != null ? `Rs ${entry.registrationFee.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={entry.status} /></td>
                    <td className="px-5 py-3">
                      {entry.receiptDelivery === 'EMAIL' && entry.clientEmail ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewReceipt(entry.id)}
                            className="text-xs font-medium text-slate-600 underline hover:text-slate-800"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleResend(entry)}
                            disabled={resendingId === entry.id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resendingId === entry.id ? 'Sending...' : 'Resend'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">{entry.receiptDelivery === 'PRINT' ? 'Print' : '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 px-5 py-3.5">
          <Pagination page={page} totalPages={totalPages} totalElements={filtered.length} onPageChange={setPage} />
        </div>
      </div>

      {receiptLoading && <p className="mt-3 text-sm text-slate-400">Loading receipt...</p>}
      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
