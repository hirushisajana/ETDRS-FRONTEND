import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsApi, registryApi } from '../../api';
import { PageHeader, Card, DataTable } from '../../components/shared';
import type { AnnualStats } from '../../types';

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
    <div>
      <PageHeader title="Statistics" description="Annual registration statistics">
        <div className="filter-bar">
          <select className="form-select form-select-sm" value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="btn-group">
            <button className={`btn btn-sm ${view === 'national' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('national')}>National</button>
            <button className={`btn btn-sm ${view === 'registry' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setView('registry')}>By Registry</button>
          </div>
        </div>
      </PageHeader>

      <Card>
        {view === 'national' && nationalStats && (
          <div className="stats-summary">
            <div className="stat-box">
              <span className="stat-label">Received</span>
              <span className="stat-number">{nationalStats.totalReceived}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Registered</span>
              <span className="stat-number">{nationalStats.totalRegistered}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Rejected</span>
              <span className="stat-number">{nationalStats.totalRejected}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Reported</span>
              <span className="stat-number">{nationalStats.totalReported}</span>
            </div>
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
