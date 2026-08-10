import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { folioApi } from '../../api';
import { LoadingSpinner, EmptyState, StatusBadge } from '../../components/shared';

export default function FolioAdminListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [trustType, setTrustType] = useState<'All' | 'EXPRESS' | 'NORMAL'>('All');
  const [search, setSearch] = useState('');
  const [yearsList] = useState<number[]>(() => {
    const ys: number[] = [];
    for (let y = currentYear; y >= currentYear - 20; y--) ys.push(y);
    return ys;
  });

  const { data: folios, isLoading } = useQuery({
    queryKey: ['folio', 'by-year', year, trustType],
    queryFn: () => folioApi.getByYear(year, trustType !== 'All' ? trustType : undefined),
    placeholderData: (prev) => prev,
  });

  const filtered = (folios || []).filter((f) => {
    if (statusFilter && f.approvalStatus !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (f.folioNumber && f.folioNumber.toLowerCase().includes(q)) ||
      (f.trustName && f.trustName.toLowerCase().includes(q)) ||
      (f.daybookNumber && f.daybookNumber.toLowerCase().includes(q)) ||
      (f.volumeNumber && f.volumeNumber.toLowerCase().includes(q)) ||
      (f.remarks && f.remarks.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Folio Volumes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Search and view folio records by year and trust type</p>
        </div>
      </div>

      {/* Trust type toggle */}
      <div className="flex items-center gap-1 mb-4">
        {(['All', 'EXPRESS', 'NORMAL'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTrustType(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              trustType === t
                ? 'bg-maroon-700 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t === 'All' ? 'All Trusts' : t === 'EXPRESS' ? 'Express Trust' : 'Normal Trust'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Year:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
          >
            {yearsList.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <input
          placeholder="Search by folio #, trust name, daybook..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
        />
        <span className="text-sm text-gray-400">{filtered.length} folios</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : !filtered.length ? (
          <EmptyState message={`No folios found for ${year}`} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-24 px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Folio #</th>
                <th className="w-40 px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trust Name</th>
                <th className="w-20 px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="w-20 px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="w-16 px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Volume</th>
                <th className="w-28 px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Daybook</th>
                <th className="w-28 px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((folio) => (
                <tr
                  key={folio.id}
                  onClick={() => navigate(`/folio/admin/${folio.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{folio.folioNumber ?? '-'}</td>
                  <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{folio.trustName ?? '-'}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{folio.trustType}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{folio.trustCategory}</td>
                  <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{folio.volumeNumber ?? '-'}</td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{folio.daybookNumber}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><StatusBadge status={folio.approvalStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
