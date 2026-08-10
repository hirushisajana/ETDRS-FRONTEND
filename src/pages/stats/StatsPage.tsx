import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsApi, registryApi } from '../../api';
import { PageHeader, Card, DataTable } from '../../components/shared';
import type { AnnualStats } from '../../types';

const statCards: { key: 'totalReceived' | 'totalRegistered' | 'totalRejected' | 'totalReported'; label: string; accent: string; icon: string }[] = [
  { key: 'totalReceived', label: 'Received', accent: 'from-blue-600 to-blue-500', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
  { key: 'totalRegistered', label: 'Registered', accent: 'from-emerald-500 to-lime-400', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'totalRejected', label: 'Rejected', accent: 'from-rose-500 to-red-400', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
  { key: 'totalReported', label: 'Reported', accent: 'from-amber-500 to-orange-400', icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' },
];

const inputClass =
  'rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export default function StatsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [view, setView] = useState<'national' | 'registry'>('national');

  const { data: registries } = useQuery({
    queryKey: ['registries'],
    queryFn: registryApi.getAll,
  });

  const { data: nationalStats } = useQuery({
    queryKey: ['stats', 'national', selectedYear],
    queryFn: () => statsApi.getNationalByYear(selectedYear),
    enabled: view === 'national',
  });

  const { data: registryStats } = useQuery({
    queryKey: ['stats', 'registry'],
    queryFn: () => {
      if (!registries?.length) return [];
      return Promise.all(
        registries.map((r) =>
          statsApi.getByRegistryAndYear(r.id, selectedYear).catch(() => null),
        ),
      );
    },
    enabled: view === 'registry' && !!registries?.length,
  });

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const regColumns = [
    { key: 'registryName', header: 'Registry' },
    { key: 'totalReceived', header: 'Received' },
    { key: 'totalRegistered', header: 'Registered' },
    { key: 'totalRejected', header: 'Rejected' },
    { key: 'totalReported', header: 'Reported' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Statistics" description="Annual registration statistics">
        <select className={`${inputClass} cursor-pointer appearance-none`} value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <div className="flex items-center rounded-xl bg-slate-100 p-0.5">
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'national' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setView('national')}
          >
            National
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'registry' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setView('registry')}
          >
            By Registry
          </button>
        </div>
      </PageHeader>

      <Card>
        {view === 'national' && nationalStats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map(({ key, label, accent, icon }) => (
              <div key={key} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{String(nationalStats[key] ?? 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {view === 'registry' && (
          <DataTable
            columns={regColumns}
            data={(registryStats?.filter(Boolean) as AnnualStats[]) || []}
            keyExtractor={(item: AnnualStats) => `${item.registryId}-${item.year}` as unknown as string | number}
            emptyMessage="No statistics available"
          />
        )}
      </Card>
    </div>
  );
}