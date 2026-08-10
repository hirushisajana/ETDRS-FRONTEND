import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registryApi } from '../../api';
import type { RegistryStatus } from '../../types';

const provinces = [
  'Central', 'Eastern', 'North Central', 'Northern',
  'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western',
];

const statusOptions: { label: string; value: RegistryStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

const ITEMS_PER_PAGE = 5;

const inviteLabels: Record<string, { label: string; color: string; dot: string }> = {
  PENDING: { label: 'Invite sent', color: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  EXPIRED: { label: 'Invite expired', color: 'bg-orange-50 text-orange-700 ring-orange-600/20', dot: 'bg-orange-500' },
  ACTIVATED: { label: 'Activated', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  NONE: { label: 'No invite', color: 'bg-slate-100 text-slate-500 ring-slate-500/20', dot: 'bg-slate-400' },
};

function InviteStatusBadge({ status }: { status: string }) {
  const s = inviteLabels[status] || inviteLabels.NONE;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${s.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function StatusPill({ status }: { status: RegistryStatus }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
          : 'bg-red-50 text-red-700 ring-red-600/20'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export default function RegistryListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegistryStatus | ''>('');
  const [page, setPage] = useState(1);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: registries = [], isLoading } = useQuery({
    queryKey: ['registries'],
    queryFn: registryApi.getAll,
  });

  const resendMutation = useMutation({
    mutationFn: (registryId: number) => registryApi.resendInvite(registryId),
    onSuccess: () => {
      setToast({ type: 'success', message: 'Invite resent successfully.' });
      setResendingId(null);
      queryClient.invalidateQueries({ queryKey: ['registries'] });
    },
    onError: (err: Error) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || err.message || 'Failed to resend invite.';
      setToast({ type: 'error', message: msg });
      setResendingId(null);
    },
  });

  const filtered = useMemo(() => {
    let result = registries;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.registryCode.toLowerCase().includes(q),
      );
    }

    if (provinceFilter) {
      result = result.filter((r) => r.province === provinceFilter);
    }

    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }

    return result;
  }, [registries, search, provinceFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-[1400px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Land registries</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {registries.length} registries nationwide &middot; No cap on total
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/super-admin/registries/new')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Register new registry
        </button>
      </div>

      {toast && (
        <div className={`mb-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${
          toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {toast.type === 'success' ? (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100">&times;</button>
        </div>
      )}

      {registries.length > 0 && (
        <>
          {/* Filters */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className={`${inputClass} pl-9`}
              />
            </div>

            <select
              value={provinceFilter}
              onChange={(e) => { setProvinceFilter(e.target.value); setPage(1); }}
              className={`${inputClass} cursor-pointer appearance-none`}
            >
              <option value="">All provinces</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as RegistryStatus | ''); setPage(1); }}
              className={`${inputClass} cursor-pointer appearance-none`}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              </div>
            ) : paginated.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                  <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500">No registries match your filters</p>
                <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        {['Registry code', 'Name', 'Province', 'District', 'Registry Admin', 'Status', 'Invite status', 'Actions'].map((h) => (
                          <th key={h} className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginated.map((registry) => (
                        <tr key={registry.id} className="transition-colors hover:bg-slate-50/70">
                          <td className="px-5 py-3.5">
                            <span className="font-mono text-sm font-medium text-blue-700">{registry.registryCode}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium text-slate-900">{registry.name}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-slate-500">{registry.province || '—'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-slate-500">{registry.district || '—'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-slate-600">{registry.registryAdminName || '—'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusPill status={registry.status} />
                          </td>
                          <td className="px-5 py-3.5">
                            <InviteStatusBadge status={registry.inviteStatus} />
                          </td>
                          <td className="px-5 py-3.5">
                            {(registry.inviteStatus === 'PENDING' || registry.inviteStatus === 'EXPIRED') && (
                              <button
                                onClick={() => {
                                  setResendingId(registry.id);
                                  resendMutation.mutate(registry.id);
                                }}
                                disabled={resendMutation.isPending && resendingId === registry.id}
                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 transition-colors hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {resendMutation.isPending && resendingId === registry.id ? (
                                  <span className="h-3 w-3 animate-spin rounded-full border border-blue-700 border-t-transparent" />
                                ) : (
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                )}
                                {resendMutation.isPending && resendingId === registry.id ? 'Resending...' : 'Resend invite'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
                  <span className="text-sm text-slate-400">
                    Showing {paginated.length} of {filtered.length} registries
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      &larr; Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
                      const pageNum = start + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${
                            pageNum === safePage
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}