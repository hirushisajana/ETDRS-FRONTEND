import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api';
import { useAuth } from '../../contexts';
import { LoadingSpinner } from '../../components/shared';
import { useState } from 'react';

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

const primaryStats: StatCard[] = [];

const quickLinks = [
  { label: 'Daybook Queue', path: '/daybook/pending', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25', desc: 'Review and process daybook entries', color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200 hover:bg-blue-50/50' },
  { label: 'Folio Queue', path: '/folio/admin', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', desc: 'Manage folio records', color: 'text-slate-600', bg: 'bg-slate-50', border: 'hover:border-slate-200 hover:bg-slate-50/50' },
  { label: 'Staff Management', path: '/staff', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', desc: 'View and manage registry staff', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200 hover:bg-emerald-50/50' },
  { label: 'Approvals', path: '/approval', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Review and approve registrations', color: 'text-maroon-700', bg: 'bg-maroon-50', border: 'hover:border-maroon-200 hover:bg-maroon-50/50' },
];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const sampleHeights = [45, 52, 38, 65, 58, 72, 48, 55, 62, 70, 50, 68];

export default function RegistryDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

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
          const val = (s as any)[key] ?? 0;
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

      {/* Monthly Trend + Staff Summary */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Registration Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Monthly Registration Trend</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Current year activity by month</p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
              {today.getFullYear()}
            </span>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-end gap-2 h-44">
              {months.map((m, i) => {
                const val = sampleHeights[i];
                const isHovered = hoveredMonth === i;
                return (
                  <div
                    key={m}
                    className="flex-1 flex flex-col items-center gap-1.5"
                    onMouseEnter={() => setHoveredMonth(i)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    <div className="relative w-full flex justify-center">
                      <div
                        className={`w-full max-w-[28px] bg-maroon-700 rounded-sm transition-all duration-200 cursor-pointer ${
                          isHovered ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ height: `${val}%` }}
                      />
                      {isHovered && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                          {val} registrations
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium transition-colors ${
                      isHovered ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {m}
                    </span>
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
