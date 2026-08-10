import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts';
import { daybookApi, folioApi } from '../../api';
import { LoadingSpinner, EmptyState, StatusBadge } from '../../components/shared';

type SearchTab = 'folios' | 'daybooks';

export default function GlobalSearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const registryId = user?.registryId;
  const currentYear = new Date().getFullYear();

  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [year, setYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState<SearchTab>('folios');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: folioResults, isLoading: folioLoading } = useQuery({
    queryKey: ['global-search', 'folios', registryId, searchQuery],
    queryFn: () => folioApi.search(registryId!, searchQuery),
    enabled: !!registryId && searchQuery.length > 0,
    placeholderData: (prev) => prev,
  });

  const { data: daybookResults, isLoading: daybookLoading } = useQuery({
    queryKey: ['global-search', 'daybooks', year, searchQuery],
    queryFn: () => daybookApi.search(year, searchQuery),
    enabled: searchQuery.length > 0,
    placeholderData: (prev) => prev,
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchQuery(query.trim());
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!query.trim()) return;
      setSearchQuery(query.trim());
    }
  };

  const hasSearched = searchQuery.length > 0;
  const totalFolios = folioResults?.length ?? 0;
  const totalDaybooks = daybookResults?.length ?? 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Global Search</h1>
        <p className="text-sm text-gray-500 mt-0.5">Search across folios and daybook entries by any field</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by trustee name, folio number, daybook number, trust name..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-maroon-600"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim()}
          className="px-5 py-2.5 text-sm font-medium text-white bg-maroon-700 rounded-lg hover:bg-maroon-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {hasSearched && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('folios')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'folios'
                  ? 'border-maroon-700 text-maroon-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Folios
              {folioLoading ? (
                <span className="ml-2 inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="ml-2 text-xs text-gray-400">({totalFolios})</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('daybooks')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'daybooks'
                  ? 'border-maroon-700 text-maroon-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Daybook Entries
              {daybookLoading ? (
                <span className="ml-2 inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="ml-2 text-xs text-gray-400">({totalDaybooks})</span>
              )}
            </button>
            {activeTab === 'daybooks' && (
              <div className="ml-auto flex items-center gap-2 pb-2">
                <label className="text-xs text-gray-500">Year:</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || currentYear)}
                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-maroon-600"
                />
              </div>
            )}
          </div>

          {/* Folio results */}
          {activeTab === 'folios' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {folioLoading ? (
                <LoadingSpinner />
              ) : !folioResults?.length ? (
                <EmptyState message="No folios match your search" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Folio #</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Trust Name</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Daybook #</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {folioResults!.map((folio) => (
                        <tr
                          key={folio.id}
                          onClick={() => navigate(`/folio/admin/${folio.id}`)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-3 py-2.5 text-gray-900 font-medium whitespace-nowrap">
                            {folio.volumeNumber || '-'}/{folio.folioNumber || '-'}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{folio.trustName || '-'}</td>
                          <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{folio.trustType}</td>
                          <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{folio.daybookNumber || '-'}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <StatusBadge status={folio.approvalStatus} />
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{folio.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Daybook results */}
          {activeTab === 'daybooks' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {daybookLoading ? (
                <LoadingSpinner />
              ) : !daybookResults?.length ? (
                <EmptyState message="No daybook entries match your search" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Daybook #</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Deed #</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Notary</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {daybookResults!.map((entry) => (
                        <tr
                          key={entry.id}
                          onClick={() => navigate(`/daybook/${entry.id}`)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-3 py-2.5 text-gray-900 font-medium whitespace-nowrap">{entry.daybookNumber || '-'}</td>
                          <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{entry.clientName || '-'}</td>
                          <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{entry.deedNumber || '-'}</td>
                          <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{entry.notaryName || '-'}</td>
                          <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{entry.trustType || '-'}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <StatusBadge status={entry.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!hasSearched && (
        <div className="text-center py-16">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-sm text-gray-400">Enter a search term above to find folios and daybook entries</p>
          <p className="text-xs text-gray-300 mt-1">Search by trustee name, folio number, daybook number, trust name, and more</p>
        </div>
      )}
    </div>
  );
}
