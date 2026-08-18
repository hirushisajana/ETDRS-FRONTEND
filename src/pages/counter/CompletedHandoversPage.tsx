import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { daybookApi } from '../../api';
import { PageHeader, LoadingSpinner, EmptyState, ErrorState, Pagination } from '../../components/shared';

const PAGE_SIZE = 10;

export default function CompletedHandoversPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: handovers, isLoading, isError, error } = useQuery({
    queryKey: ['handover', 'completed'],
    queryFn: daybookApi.getCompletedHandovers,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (handovers || []).filter((f) => {
      if (!q) return true;
      return (
        (f.daybookNumber ?? '').toLowerCase().includes(q) ||
        (f.deedNumber ?? '').toLowerCase().includes(q) ||
        (f.folioNumber ?? '').toLowerCase().includes(q) ||
        (f.trustName ?? '').toLowerCase().includes(q) ||
        (f.collectorFullName ?? '').toLowerCase().includes(q) ||
        (f.collectorIdNumber ?? '').toLowerCase().includes(q)
      );
    });
  }, [handovers, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatDateTime = (date: string | null | undefined, time: string | null | undefined) => {
    if (!date) return '-';
    const base = new Date(date).toLocaleDateString();
    return time ? `${base} ${time}` : base;
  };

  const errorMessage =
    error instanceof Error && error.message
      ? `Could not load completed handovers: ${error.message}`
      : 'Could not load completed handovers. Please try again.';

  return (
    <div className="p-6">
      <PageHeader
        title="Completed Handovers"
        description="History of deeds that have been handed over to collectors"
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by folio, daybook, deed, trust or collector..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          {filtered.length} completed handover{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <ErrorState message={errorMessage} />
        ) : !pageItems.length ? (
          <EmptyState message="No completed handovers yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['Folio #', 'Daybook #', 'Deed #', 'Trust Name', 'Collector', 'Delivery Method', 'Handover Date & Time'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((folio) => (
                  <tr key={folio.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-800">{folio.folioNumber ?? folio.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-800">{folio.daybookNumber}</td>
                    <td className="px-5 py-3 text-slate-700">{folio.deedNumber ?? '-'}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{folio.trustName ?? '-'}</td>
                    <td className="px-5 py-3">
                      <p className="text-slate-800">{folio.collectorFullName ?? '-'}</p>
                      <p className="text-[11px] text-slate-400">
                        {folio.collectorIdType ? `${folio.collectorIdType}: ` : ''}{folio.collectorIdNumber ?? ''}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800 ring-1 ring-inset ring-teal-600/20">
                        {(folio.deliveryMethod ?? 'IN_PERSON').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                      {formatDateTime(folio.handoverDate, folio.handoverTime)}
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

      {pageItems.length > 0 && (
        <p className="mt-3 text-xs text-slate-400">
          Each deed can be handed over only once. Deeds already handed over do not appear in the pending handover queue.
        </p>
      )}
    </div>
  );
}
