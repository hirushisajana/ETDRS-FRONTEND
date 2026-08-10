import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { folioApi } from '../../api';
import { useAuth } from '../../contexts';
import { LoadingSpinner, StatusBadge } from '../../components/shared';
import type { Folio } from '../../types';

export default function MyFoliosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isSearch = searchParams.get('tab') === 'search';

  const [year, setYear] = useState(new Date().getFullYear());
  const [trustType, setTrustType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);

  const { data: folios, isLoading } = useQuery({
    queryKey: ['folio', 'my', year, trustType],
    queryFn: () => folioApi.getByYear(year, trustType || undefined),
    enabled: !isSearch,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['folio', 'search', searchQuery],
    queryFn: () => folioApi.search(user?.registryId || 0, searchQuery),
    enabled: isSearch && searchQuery.length > 0,
  });

  const displayFolios: Folio[] = isSearch ? (searchResults || []) : (folios || []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isSearch ? 'Search Folios' : 'My Entries'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isSearch
              ? 'Search folios within your land registry'
              : `Folios for ${user?.registryName || 'your registry'} — Year ${year}`}
          </p>
        </div>
      </div>

      {/* Filters / Search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 mb-6 shadow-sm">
        {isSearch ? (
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by folio number, trust name, daybook number, volume..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-500 hover:to-blue-400 shadow-md shadow-blue-600/25 transition-colors"
            >
              Search
            </button>
          </form>
        ) : (
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Trust Type</label>
              <select
                value={trustType}
                onChange={(e) => setTrustType(e.target.value)}
                className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none"
              >
                <option value="">All Types</option>
                <option value="EXPRESS">Express Trust (E)</option>
                <option value="NORMAL">Normal Trust (N)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading || searchLoading ? (
        <LoadingSpinner />
      ) : displayFolios.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-500">No folios found</p>
          <p className="text-xs text-slate-400 mt-1">
            {isSearch ? 'Try a different search term' : 'No folios for this year and trust type'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  {['Folio #', 'Daybook #', 'Trust Name', 'Type', 'Volume', 'Status', 'Created'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayFolios.map((folio, idx) => (
                  <tr
                    key={folio.id}
                    onClick={() => navigate(`/folio/${folio.id}`)}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">
                      {folio.volumeNumber ? `${folio.volumeNumber}/${folio.folioNumber || '-'}` : folio.folioNumber || '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{folio.daybookNumber}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{folio.trustName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        folio.trustType === 'EXPRESS' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {folio.trustType === 'EXPRESS' ? 'E' : 'N'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{folio.volumeNumber || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={folio.approvalStatus} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {folio.createdAt ? new Date(folio.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {displayFolios.length} folio{displayFolios.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
