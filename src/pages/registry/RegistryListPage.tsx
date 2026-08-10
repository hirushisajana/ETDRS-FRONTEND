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
  PENDING: { label: 'Invite sent', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  EXPIRED: { label: 'Invite expired', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  ACTIVATED: { label: 'Activated', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  NONE: { label: 'No invite', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

function InviteStatusBadge({ status }: { status: string }) {
  const s = inviteLabels[status] || inviteLabels.NONE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function StatusPill({ status }: { status: RegistryStatus }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
        isActive
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

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
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Land registries</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {registries.length} registries nationwide · No cap on total
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/super-admin/registries/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Register new registry
        </button>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100">&times;</button>
        </div>
      )}

      {registries.length > 0 && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400"
              />
            </div>

            <select
              value={provinceFilter}
              onChange={(e) => { setProvinceFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 bg-white appearance-none cursor-pointer"
            >
              <option value="">All provinces</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as RegistryStatus | ''); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 bg-white appearance-none cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-maroon-700 rounded-full animate-spin" />
              </div>
            ) : paginated.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">No registries match your filters</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Registry code', 'Name', 'Province', 'District', 'Registry Admin', 'Status', 'Invite status', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((registry) => (
                      <tr key={registry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-mono font-medium text-maroon-700">{registry.registryCode}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-900 font-medium">{registry.name}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-500">{registry.province || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-500">{registry.district || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-600">{registry.registryAdminName || '—'}</span>
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
                              className="inline-flex items-center gap-1 text-xs font-medium text-maroon-700 hover:text-maroon-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              {resendMutation.isPending && resendingId === registry.id ? (
                                <span className="w-3 h-3 border border-maroon-700 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                  <span className="text-sm text-gray-400">
                    Showing {paginated.length} of {filtered.length} registries
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                          className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                            pageNum === safePage
                              ? 'bg-maroon-700 text-white'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
