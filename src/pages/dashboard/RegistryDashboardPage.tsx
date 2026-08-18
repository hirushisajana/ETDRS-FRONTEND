import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api';
import { useAuth } from '../../contexts';
import { LoadingSpinner } from '../../components/shared';

interface StatCard {
  key: keyof RegistryStatMap;
  label: string;
  icon: string;
  accent: string;
  bg: string;
}

type RegistryStatMap = {
  pendingDaybookEntries: number;
  pendingFolios: number;
  pendingScans: number;
  pendingApprovals: number;
  registeredToday: number;
  rejectedToday: number;
  totalRequests: number;
  activeStaff: number;
  totalStaff: number;
  expiringCertificates: number;
  pendingInvites: number;
  pendingSuspiciousReports: number;
  nextSequenceNumber: number | null;
  nextDaybookFormat: string | null;
};

const primaryStats: StatCard[] = [
  { key: 'totalRequests', label: 'Total requests', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z', accent: 'border-l-maroon-700', bg: 'bg-maroon-50' },
  { key: 'pendingApprovals', label: 'Approvals pending', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'border-l-emerald-600', bg: 'bg-emerald-50' },
  { key: 'registeredToday', label: 'Registered today', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', accent: 'border-l-blue-600', bg: 'bg-blue-50' },
  { key: 'pendingSuspiciousReports', label: 'Suspicious pending', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z', accent: 'border-l-violet-600', bg: 'bg-violet-50' },
];

const quickLinks = [
  { label: 'Daybook Queue', path: '/daybook/pending', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25', desc: 'Review and process daybook entries', color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200 hover:bg-blue-50/50' },
  { label: 'Folio Queue', path: '/folio/admin', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', desc: 'Manage folio records', color: 'text-slate-600', bg: 'bg-slate-50', border: 'hover:border-slate-200 hover:bg-slate-50/50' },
  { label: 'Staff Management', path: '/staff', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', desc: 'View and manage registry staff', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200 hover:bg-emerald-50/50' },
  { label: 'Approvals', path: '/approval', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Review and approve registrations', color: 'text-maroon-700', bg: 'bg-maroon-50', border: 'hover:border-maroon-200 hover:bg-maroon-50/50' },
];

export default function RegistryDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'registry'],
    queryFn: dashboardApi.getRegistry,
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (isLoading) return <LoadingSpinner />;

  const s = (stats ?? {}) as RegistryStatMap;

  const pendingItems = [
    { label: 'Daybook entries', count: s.pendingDaybookEntries ?? 0, path: '/daybook/pending', color: 'text-blue-600', bar: 'bg-blue-500' },
    { label: 'Folio records', count: s.pendingFolios ?? 0, path: '/folio/admin', color: 'text-slate-600', bar: 'bg-slate-500' },
    { label: 'Scans to process', count: s.pendingScans ?? 0, path: '/scan', color: 'text-violet-600', bar: 'bg-violet-500' },
    { label: 'Approvals pending', count: s.pendingApprovals ?? 0, path: '/approval', color: 'text-emerald-600', bar: 'bg-emerald-500' },
  ];

  const maxPending = Math.max(...pendingItems.map((p) => p.count), 1);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {greeting}, {user?.fullName?.split(' ')[0] || 'User'}
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-medium bg-maroon-50 text-maroon-700 border border-maroon-200 rounded-full">
                {user?.registryName || 'Registry Admin'}
              </span>
            </div>
            <p className="text-sm text-gray-400">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-300" />
              <span className="text-xs font-medium text-gray-500">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {primaryStats.map(({ key, label, icon, accent, bg }) => {
          const val = s[key] ?? 0;
          return (
            <div
              key={key}
              className={`bg-white rounded-xl border border-gray-200 border-l-[3px] ${accent} p-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                  {label}
                </p>
                <div className={`p-2 rounded-lg ${bg} shrink-0 ml-2`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{val}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions + Pending Overview */}
      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-start gap-2 p-4 bg-white rounded-xl border border-gray-200 shadow-sm ${link.border} transition-all text-left cursor-pointer`}
            >
              <div className={`p-2 rounded-lg ${link.bg}`}>
                <svg className={`w-4 h-4 ${link.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-800">{link.label}</span>
              <span className="text-[11px] text-gray-400 leading-tight">{link.desc}</span>
            </button>
          ))}
        </div>

        {/* Pending Items Overview */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pending Items</h3>
          <div className="space-y-4">
            {pendingItems.map((item) => {
              const pct = maxPending > 0 ? (item.count / maxPending) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      onClick={() => navigate(item.path)}
                      className={`text-sm font-medium ${item.color} hover:underline`}
                    >
                      {item.label}
                    </button>
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Activity + Staff Summary */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Registration Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Today&apos;s Registration Activity</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Requests handled today across all staff</p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
              {today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="px-5 py-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total requests', value: s.totalRequests ?? 0, color: 'text-gray-900', bar: 'bg-maroon-700' },
                { label: 'Registered', value: s.registeredToday ?? 0, color: 'text-emerald-600', bar: 'bg-emerald-500' },
                { label: 'Rejected', value: s.rejectedToday ?? 0, color: 'text-rose-600', bar: 'bg-rose-400' },
              ].map((item) => {
                const total = Math.max(s.totalRequests ?? 0, 1);
                const pct = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[11px] font-medium text-gray-500">{item.label}</p>
                    <p className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.value}</p>
                    <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                      <div className={`h-full ${item.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Staff & Registry Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Staff Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Active staff</span>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">{s.activeStaff ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Total staff</span>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">{s.totalStaff ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Expiring certificates</span>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">{s.expiringCertificates ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Pending invites</span>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">{s.pendingInvites ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Next sequence</span>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">
                {s.nextSequenceNumber != null ? `#${s.nextSequenceNumber}` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[11px] text-gray-400 text-center border-t border-gray-100 pt-5">
        Registry dashboard &bull; Last updated {today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
