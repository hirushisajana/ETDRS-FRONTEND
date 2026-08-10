import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { daybookApi } from '../../api';
import { LoadingSpinner, EmptyState, StatusBadge } from '../../components/shared';
import type { DaybookEntry } from '../../types';

const columns: { key: keyof DaybookEntry; label: string; width?: string }[] = [
  { key: 'daybookNumber', label: 'Daybook #', width: 'w-28' },
  { key: 'deedType', label: 'Deed Type', width: 'w-24' },
  { key: 'submitterName', label: 'Submitter', width: 'w-36' },
  { key: 'deedNumber', label: 'Deed #', width: 'w-28' },
  { key: 'notaryName', label: 'Notary', width: 'w-36' },
  { key: 'valueOfAmount', label: 'Value (Rs)', width: 'w-28' },
  { key: 'division', label: 'Division', width: 'w-20' },
  { key: 'volume', label: 'Volume', width: 'w-16' },
  { key: 'folioRef', label: 'Folio Ref', width: 'w-20' },
  { key: 'status', label: 'Status', width: 'w-28' },
];

export default function DaybookListPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['daybook', 'by-year', year],
    queryFn: () => daybookApi.getByYear(year),
    placeholderData: (prev) => prev,
  });

  const filtered = (entries || []).filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || Object.values(e).some((v) =>
      v != null && String(v).toLowerCase().includes(q)
    );
    const matchesType = typeFilter === 'All' || e.trustType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Daybook Volumes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Search and view all daybook entries by year</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || currentYear)}
            className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
          />
        </div>
        <input
          placeholder="Search any field..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-36 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
        >
          <option value="All">All Types</option>
          <option value="EXPRESS">Express Trust</option>
          <option value="NORMAL">Normal Trust</option>
        </select>
        <span className="text-sm text-gray-400">{filtered.length} entries</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <LoadingSpinner />
          ) : !filtered.length ? (
            <EmptyState message={`No daybook entries found for ${year}`} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map((col) => (
                    <th key={col.key} className={`${col.width || ''} px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => navigate(`/daybook/${entry.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2.5 text-gray-900 whitespace-nowrap">
                        {col.key === 'status' ? (
                          <StatusBadge status={entry.status} />
                        ) : col.key === 'valueOfAmount' ? (
                          entry.valueOfAmount != null ? `Rs ${Number(entry.valueOfAmount).toLocaleString()}` : '-'
                        ) : (
                          entry[col.key] ?? '-'
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
