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
        <span className="text-sm font-medium text-gray-900">{item.fullName}</span>
      ),
    },
    {
      key: 'nic',
      header: 'NIC',
      render: (item: NotaryResponse) => (
        <span className="text-sm text-gray-600 font-mono">{item.nic}</span>
      ),
    },
    {
      key: 'notaryRegistrationNumber',
      header: 'Registration no.',
      render: (item: NotaryResponse) => (
        <span className="text-sm text-gray-600 font-mono">{item.notaryRegistrationNumber}</span>
      ),
    },
    { key: 'district', header: 'District' },
    {
      key: 'registeredDate',
      header: 'Registered date',
      render: (item: NotaryResponse) => (
        <span className="text-sm text-gray-600">{item.registeredDate ? formatDate(item.registeredDate) : '—'}</span>
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
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Notary registry"
        description="National list · All daybook and folio entries verified against this registry."
        actions={
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add notary
          </button>
        }
      />

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total notaries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Active</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Suspended / Deregistered</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.suspended + stats.deregistered}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Info banner */}
      <div className="mb-6 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <div className="flex gap-2.5">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <p className="font-medium">How this list is used</p>
            <p className="mt-1 text-blue-700 leading-relaxed">
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
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, NIC or reg. no..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400"
            />
          </div>
          <select
            value={district}
            onChange={handleDistrictChange}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 bg-white appearance-none cursor-pointer"
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={handleStatusChange}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 bg-white appearance-none cursor-pointer"
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
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
