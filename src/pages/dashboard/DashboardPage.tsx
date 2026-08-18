import type { ReactNode } from 'react';
import { useAuth } from '../../contexts';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api';
import { LoadingSpinner } from '../../components/shared';
import type { SuperAdminDashboard, HeadOfficeDashboard } from '../../types';

const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const hour = today.getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

function StatCard({ label, value, icon, note, accent }: { label: string; value: number | string; icon: string; note?: string; accent: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
      </div>
      <p className="mb-0.5 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      {note && <p className="text-xs text-slate-400">{note}</p>}
    </div>
  );
}

function getDaysColor(days: number) {
  if (days <= 30) return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20';
  if (days <= 60) return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20';
  return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
}

function Panel({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const registryIcon = 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21';
const usersIcon = 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z';
const requestsIcon = 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z';
const alertIcon = 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z';

const quickActions = [
  { label: 'Register new land registry', path: '/registries/new', icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Create Registry Admin', path: '/users/new', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  { label: 'Create Head Office user', path: '/users/new', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Review suspicious reports', path: '/suspicious', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
];

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = hasRole('SUPER_ADMIN') || hasRole('IT_ADMIN');

  const superAdminQuery = useQuery({
    queryKey: ['dashboard', 'super-admin'],
    queryFn: dashboardApi.getSuperAdmin,
    enabled: isSuperAdmin,
  });

  const headOfficeQuery = useQuery({
    queryKey: ['dashboard', 'head-office'],
    queryFn: dashboardApi.getHeadOffice,
    enabled: !isSuperAdmin,
  });

  if ((isSuperAdmin && superAdminQuery.isLoading) || (!isSuperAdmin && headOfficeQuery.isLoading)) {
    return <LoadingSpinner />;
  }

  if (isSuperAdmin) {
    const s = (superAdminQuery.data ?? {}) as SuperAdminDashboard;
    return <SuperAdminView data={s} navigate={navigate} userFullName={user?.fullName} />;
  }

  const h = (headOfficeQuery.data ?? {}) as HeadOfficeDashboard;
  return <HeadOfficeView data={h} navigate={navigate} userFullName={user?.fullName} />;
}

function SuperAdminView({ data, navigate, userFullName }: { data: SuperAdminDashboard; navigate: (path: string) => void; userFullName?: string }) {
  const s = data;
  const invites = s.recentPendingInvitesList ?? [];
  const activity = s.registryActivityCurrentMonth ?? [];
  const national = s.nationalStatsCurrentYear ?? [];

  return (
    <div className="max-w-[1400px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {greeting}, <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{userFullName?.split(' ')[0] || 'Admin'}</span>
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">National overview</p>
          </div>
          <p className="text-sm text-slate-400">{dateStr}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Land registries" value={s.totalRegistries ?? 0} icon={registryIcon} accent="from-blue-600 to-blue-500" />
        <StatCard label="Active users" value={s.totalUsers ?? 0} icon={usersIcon} accent="from-cyan-500 to-teal-400" />
        <StatCard label="Requests this month" value={s.requestsThisMonth ?? 0} icon={requestsIcon} accent="from-emerald-500 to-lime-400" />
        <StatCard label="Suspicious reports" value={s.pendingSuspiciousReports ?? 0} icon={alertIcon} note={`${s.pendingSuspiciousReports ?? 0} pending review`} accent="from-violet-500 to-purple-400" />
      </div>

      {/* Two panels: Expiring certs + Pending invites */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Certificates expiring within 90 days">
          {(s.certificatesExpiringSoon ?? 0) > 0 ? (
            <div className="py-8 text-center">
              <p className="text-4xl font-bold text-slate-900 tabular-nums">{s.certificatesExpiringSoon}</p>
              <p className="mt-1 text-sm text-slate-400">certificates need renewal attention</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDaysColor(30)}`}>≤ 30 days</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDaysColor(45)}`}>≤ 60 days</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDaysColor(90)}`}>≤ 90 days</span>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500">All clear</p>
              <p className="mt-1 text-xs text-slate-400">No certificates expiring within 90 days</p>
            </div>
          )}
          <button onClick={() => navigate('/certificates')} className="mt-3 w-full rounded-xl py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
            View all certificates
          </button>
        </Panel>

        <Panel title={`Pending invites (${(s.pendingInvites ?? 0) + (s.expiredInvites ?? 0)} total, ${s.expiredInvites ?? 0} expired)`}>
          {invites.length > 0 ? (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-xs font-semibold text-blue-700">
                      {(invite.fullName || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{invite.fullName}</p>
                    <p className="truncate text-xs text-slate-400">{invite.role.replace(/_/g, ' ')}{invite.registryId ? ` · Registry #${invite.registryId}` : ''}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${invite.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                    {invite.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500">No pending invites</p>
              <p className="mt-1 text-xs text-slate-400">All invited users have activated their accounts</p>
            </div>
          )}
          <button onClick={() => navigate('/users')} className="mt-3 w-full rounded-xl py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
            View all users &rarr;
          </button>
        </Panel>
      </div>

      {/* Registry Activity Chart */}
      <Panel
        title={`Registry activity — ${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}, Top 5 by volume`}
        right={<span className="flex items-center gap-3 text-[11px] text-slate-400"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Registered</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" />Rejected</span></span>}
      >
        <div className="mb-8">
          {activity.length > 0 ? (
            <div className="space-y-4">
              {activity.map((r) => {
                const total = r.received || 0;
                const maxTotal = Math.max(...activity.map((x) => x.received || 0), 1);
                const barPct = (total / maxTotal) * 100;
                const regPct = total > 0 ? ((r.registered || 0) / total) * barPct : 0;
                const rejPct = total > 0 ? ((r.rejected || 0) / total) * barPct : 0;
                return (
                  <div key={r.registryCode}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{r.registryCode}</span>
                      <span className="text-xs text-slate-400">{total} requests</span>
                    </div>
                    <div className="flex h-5 overflow-hidden rounded-full bg-slate-50">
                      {total > 0 && (
                        <>
                          <div className="h-full bg-blue-500 transition-all" style={{ width: `${regPct}%` }} title={`Registered: ${r.registered}`} />
                          <div className="h-full bg-rose-400 transition-all" style={{ width: `${rejPct}%` }} title={`Rejected: ${r.rejected}`} />
                        </>
                      )}
                      {total === 0 && <div className="h-full" style={{ width: '100%' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500">No registry activity yet</p>
              <p className="mt-1 text-xs text-slate-400">Data will appear as registrations are processed</p>
            </div>
          )}
        </div>
      </Panel>

      {/* Bottom: National stats + Quick actions */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title={`National statistics — ${today.getFullYear()}`}>
          {national.length > 0 ? (
            <div className="space-y-4">
              {national.map((st) => {
                const maxTotal = Math.max(...national.map((x) => x.totalReceived || 0), 1);
                const barPct = ((st.totalReceived || 0) / maxTotal) * 100;
                const rate = st.totalReceived > 0 ? Math.round(((st.totalRegistered || 0) / st.totalReceived) * 100) : 0;
                const rateColor = rate >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
                return (
                  <div key={st.registryId}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Registry #{st.registryId}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{st.totalReceived} received · {st.totalRegistered} registered</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${rateColor}`}>{rate}%</span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-50">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all" style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500">No statistics yet</p>
              <p className="mt-1 text-xs text-slate-400">Data will populate as registrations are processed</p>
            </div>
          )}
          <button onClick={() => navigate('/stats')} className="mt-3 w-full rounded-xl py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
            View full report &rarr;
          </button>
        </Panel>

        {/* Quick actions */}
        <Panel title="Quick actions">
          <div className="space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                  </svg>
                </div>
                <span>{action.label}</span>
                <svg className="ml-auto h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function HeadOfficeView({ data, navigate, userFullName }: { data: HeadOfficeDashboard; navigate: (path: string) => void; userFullName?: string }) {
  const d = data;
  const stats = [
    { label: 'Total requests (all registries)', value: d.totalRequests ?? 0, icon: requestsIcon, accent: 'from-blue-600 to-cyan-500' },
    { label: 'Registered', value: d.registeredToday ?? 0, icon: registryIcon, accent: 'from-emerald-500 to-lime-400' },
    { label: 'Rejected', value: d.rejectedToday ?? 0, icon: alertIcon, accent: 'from-rose-500 to-orange-400' },
    { label: 'Pending suspicious reports', value: d.pendingSuspiciousReports ?? 0, icon: alertIcon, accent: 'from-violet-500 to-purple-400' },
  ];

  return (
    <div className="max-w-[1400px] p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {greeting}, <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{userFullName?.split(' ')[0] || 'Officer'}</span>
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">Registrar General&apos;s Department — Head Office overview</p>
          </div>
          <p className="text-sm text-slate-400">{dateStr}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st) => (
          <StatCard key={st.label} {...st} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Pending work across registries">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-600">Daybook entries pending</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">{d.pendingDaybookEntries ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-600">Folios pending</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">{d.pendingFolios ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-600">Scans to process</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">{d.pendingScans ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-600">Approvals pending</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">{d.pendingApprovals ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600">Expiring certificates</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">{d.expiringCertificates ?? 0}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Actions">
          <div className="space-y-1">
            <button
              onClick={() => navigate('/suspicious')}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-600/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <span>Review suspicious reports</span>
            </button>
            <button
              onClick={() => navigate('/stats')}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <span>View statistics report</span>
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}