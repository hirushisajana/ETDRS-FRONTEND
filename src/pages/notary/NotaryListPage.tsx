import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notaryApi } from '../../api';
import { PageHeader, Card, DataTable, StatusBadge, Pagination } from '../../components/shared';
import { formatDate } from '../../lib/format';
import type { NotaryResponse } from '../../types';
import NotaryFormModal from './NotaryFormModal';

const districts = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya',
];

const statusFilters = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DEREGISTERED', label: 'Deregistered' },
];

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export default function NotaryListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('');
  const [editNotary, setEditNotary] = useState<NotaryResponse | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['notaries', search, district, status, page],
    queryFn: () => notaryApi.getAll({ search: search || undefined, district: district || undefined, status: status || undefined, page, size: 20 }),
  });

  const { data: stats } = useQuery({
    queryKey: ['notary-stats'],
    queryFn: () => notaryApi.getStats(),
  });

  const notaries = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 0;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrict(e.target.value);
    setPage(0);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(0);
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Full name',
      render: (item: NotaryResponse) => (
        <span className="text-sm font-medium text-slate-900">{item.fullName}</span>
      ),
    },
    {
      key: 'nic',
      header: 'NIC',
      render: (item: NotaryResponse) => (
        <span className="font-mono text-sm text-slate-600">{item.nic}</span>
      ),
    },
    {
      key: 'notaryRegistrationNumber',
      header: 'Registration no.',
      render: (item: NotaryResponse) => (
        <span className="font-mono text-sm text-slate-600">{item.notaryRegistrationNumber}</span>
      ),
    },
    { key: 'district', header: 'District' },
    {
      key: 'registeredDate',
      header: 'Registered date',
      render: (item: NotaryResponse) => (
        <span className="text-sm text-slate-600">{item.registeredDate ? formatDate(item.registeredDate) : '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: NotaryResponse) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (item: NotaryResponse) => (
        <button
          onClick={() => setEditNotary(item)}
          className="text-xs font-medium text-blue-700 transition-colors hover:text-blue-900"
        >
          Edit
        </button>
      ),
    },
  ];

  const statCards = [
    {
      label: 'Total notaries',
      value: stats ? stats.total.toLocaleString() : '—',
      icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
      accent: 'from-blue-600 to-blue-500',
    },
    {
      label: 'Active',
      value: stats ? stats.active.toLocaleString() : '—',
      icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      accent: 'from-emerald-500 to-lime-400',
    },
    {
      label: 'Suspended / Deregistered',
      value: stats ? (stats.suspended + stats.deregistered).toLocaleString() : '—',
      icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
      accent: 'from-rose-500 to-red-400',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Notary registry"
        description="National list · All daybook and folio entries verified against this registry."
        actions={
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add notary
          </button>
        }
      />

      {/* Stat cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {statCards.map(({ label, value, icon, accent }) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <div className="flex gap-2.5">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <p className="font-medium">How this list is used</p>
            <p className="mt-1 leading-relaxed text-blue-700">
              Notary verification happens by name or NIC lookup during daybook entry and folio creation. Only{' '}
              <span className="font-semibold">Active</span> notaries are accepted —{' '}
              <span className="font-semibold">Suspended</span> or{' '}
              <span className="font-semibold">Deregistered</span> notaries will block the entry outright.{' '}
              <span className="text-blue-600/70">Planned upgrade: real-time verification against the JSC API instead of relying solely on this internally maintained list.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, NIC or reg. no..."
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={district}
            onChange={handleDistrictChange}
            className={`${inputClass} cursor-pointer appearance-none`}
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={handleStatusChange}
            className={`${inputClass} cursor-pointer appearance-none`}
          >
            {statusFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={notaries}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No notaries found"
        />

        {/* Footer */}
        {!isLoading && totalElements > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">
              Showing {Math.min(20, notaries.length)} of {totalElements.toLocaleString()} notaries
            </p>
            <Pagination
              page={page + 1}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit modal */}
      {(showAdd || editNotary) && (
        <NotaryFormModal
          notary={editNotary}
          onClose={() => { setShowAdd(false); setEditNotary(null); }}
          onSaved={() => {
            setShowAdd(false);
            setEditNotary(null);
            queryClient.invalidateQueries({ queryKey: ['notaries'] });
            queryClient.invalidateQueries({ queryKey: ['notary-stats'] });
          }}
        />
      )}
    </div>
  );
}