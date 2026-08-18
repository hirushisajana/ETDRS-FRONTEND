import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { daybookApi } from '../../api';
import { PageHeader, StatusBadge, LoadingSpinner, EmptyState, ErrorState, Pagination } from '../../components/shared';
import type { Folio } from '../../types';

const PAGE_SIZE = 10;

export default function RejectedDeedsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Folio | null>(null);

  const { data: rejected, isLoading, isError, error } = useQuery({
    queryKey: ['daybook', 'rejected'],
    queryFn: daybookApi.getRejected,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rejected || []).filter((f) => {
      if (!q) return true;
      return (
        (f.daybookNumber ?? '').toLowerCase().includes(q) ||
        (f.deedNumber ?? '').toLowerCase().includes(q) ||
        (f.trustName ?? '').toLowerCase().includes(q)
      );
    });
  }, [rejected, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatDate = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString() : '-';

  const errorMessage =
    error instanceof Error && error.message
      ? `Could not load rejected deeds: ${error.message}`
      : 'Could not load rejected deeds. Please try again.';

  return (
    <div className="p-6">
      <PageHeader
        title="Rejected Deeds"
        description="Deeds rejected after registrar verification. Rejected deeds are permanent and displayed for record purposes only."
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by daybook #, deed # or trust name..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          {filtered.length} rejected deed{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <ErrorState message={errorMessage} />
        ) : !pageItems.length ? (
          <EmptyState message="No rejected deeds found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['Daybook #', 'Deed #', 'Trust Name', 'Rejection Date', 'Rejection Reason', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((folio) => (
                  <tr key={folio.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-800">{folio.daybookNumber}</td>
                    <td className="px-5 py-3 text-slate-700">{folio.deedNumber ?? '-'}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{folio.trustName ?? '-'}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                      {formatDate(folio.registrarVerifiedAt || folio.updatedAt)}
                    </td>
                    <td className="max-w-[280px] px-5 py-3">
                      <p className="truncate text-xs text-red-700" title={folio.rejectionReason ?? ''}>
                        {folio.rejectionReason ?? '-'}
                      </p>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={folio.approvalStatus} /></td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelected(folio)}
                        className="text-xs font-medium text-blue-700 underline hover:text-blue-800"
                      >
                        View Details
                      </button>
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Rejected Deed Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase">Daybook #</p>
                <p className="font-mono text-slate-800">{selected.daybookNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Deed #</p>
                <p className="text-slate-800">{selected.deedNumber ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Folio #</p>
                <p className="text-slate-800">{selected.folioNumber ?? selected.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Registry</p>
                <p className="text-slate-800">{selected.registryName ?? '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 uppercase">Trust Name</p>
                <p className="font-medium text-slate-800">{selected.trustName ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Rejection Date</p>
                <p className="text-slate-800">{formatDate(selected.registrarVerifiedAt || selected.updatedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Status</p>
                <StatusBadge status={selected.approvalStatus} />
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 uppercase">Rejection Reason</p>
                <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                  {selected.rejectionReason ?? '-'}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
