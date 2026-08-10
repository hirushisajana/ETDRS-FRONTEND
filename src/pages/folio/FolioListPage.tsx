import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { folioApi } from '../../api';
import { useAuth } from '../../contexts';
import { LoadingSpinner, StatusBadge } from '../../components/shared';

export default function FolioListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['folio', 'dashboard-stats'],
    queryFn: folioApi.getDashboardStats,
    refetchInterval: 30_000,
  });

  const { data: pendingFolios, isLoading: pendingLoading } = useQuery({
    queryKey: ['folio', 'pending'],
    queryFn: () => folioApi.getPendingQueue(),
    refetchInterval: 30_000,
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { label: 'Pending Folios', value: stats?.pendingFolios ?? 0, accent: 'border-l-amber-600', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-amber-50 text-amber-700' },
    { label: 'Registered Today', value: stats?.registeredToday ?? 0, accent: 'border-l-green-600', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-green-50 text-green-700' },
    { label: 'Rejected Today', value: stats?.rejectedToday ?? 0, accent: 'border-l-red-600', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', iconBg: 'bg-red-50 text-red-700' },
    { label: 'Reported / Pending Correction', value: (stats?.reportedCount ?? 0) + (stats?.pendingCorrectionCount ?? 0), accent: 'border-l-orange-600', icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z', iconBg: 'bg-orange-50 text-orange-700' },
  ];

  if (statsLoading || pendingLoading) return <LoadingSpinner />;

  const pendingList = pendingFolios || [];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {greeting}, {user?.fullName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-300" />
            <span className="text-xs font-medium text-gray-500">
              {stats?.totalThisYear ?? 0} total this year
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, accent, icon, iconBg }) => (
          <div
            key={label}
            className={`bg-white rounded-xl border border-gray-200 border-l-[3px] ${accent} p-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">{label}</p>
              <div className={`p-2 rounded-lg ${iconBg} shrink-0 ml-2`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Pending Queue */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Pending Queue</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Folios in daybook number order — click to enter data</p>
          </div>
        </div>
        {pendingList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No pending folios</p>
            <p className="text-xs text-gray-400 mt-1">All folio entries have been processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  {['Folio #', 'Daybook #', 'Trust Type', 'Category', 'Trust Name', 'Volume', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingList.map((folio, idx) => (
                  <tr
                    key={folio.id}
                    onClick={() => navigate(`/folio/${folio.id}/entry`)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800">
                      {folio.volumeNumber ? `${folio.volumeNumber}/${folio.folioNumber || '-'}` : folio.folioNumber || '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{folio.daybookNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        folio.trustType === 'EXPRESS' ? 'bg-maroon-100 text-maroon-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {folio.trustType === 'EXPRESS' ? 'E' : 'N'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{folio.trustCategory}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{folio.trustName || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{folio.volumeNumber || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={folio.approvalStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
