import { useAuth } from '../../contexts';
import { useNavigate } from 'react-router-dom';

const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const hour = today.getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

const statCards = [
  { label: 'Land registries', value: '0', icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21', note: '—', accent: 'from-blue-600 to-blue-500' },
  { label: 'Total users', value: '0', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', note: '—', accent: 'from-cyan-500 to-teal-400' },
  { label: 'Requests this month', value: '0', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z', note: '—', accent: 'from-emerald-500 to-lime-400' },
  { label: 'Suspicious reports', value: '0', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z', note: '0 pending review', accent: 'from-violet-500 to-purple-400' },
];

const expiringCertificates: { name: string; days: number }[] = [];

const pendingInvites: { name: string; initials: string; color: string; role: string; dept: string; status: 'Pending' | 'Expired' }[] = [];

const topRegistries = [
  { code: 'CMB', name: 'Colombo', registered: 0, rejected: 0 },
  { code: 'KAN', name: 'Kandy', registered: 0, rejected: 0 },
  { code: 'GAL', name: 'Galle', registered: 0, rejected: 0 },
  { code: 'JAF', name: 'Jaffna', registered: 0, rejected: 0 },
  { code: 'KUR', name: 'Kurunegala', registered: 0, rejected: 0 },
];

const nationalStats = topRegistries.map((r) => ({
  code: r.code,
  name: r.name,
  total: 0,
  approved: 0,
  rate: 0,
}));

const quickActions = [
  { label: 'Register new land registry', path: '/registries/new', icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Create Registry Admin', path: '/users/new', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  { label: 'Create Head Office user', path: '/users/new', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Review suspicious reports', path: '/suspicious', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
];

function StatCard({ label, value, icon, note, accent }: { label: string; value: string; icon: string; note: string; accent: string }) {
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
      <p className="mb-0.5 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{note}</p>
    </div>
  );
}

function getDaysColor(days: number) {
  if (days <= 30) return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20';
  if (days <= 60) return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20';
  return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
}

function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
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

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-[1400px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {greeting}, <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{user?.fullName?.split(' ')[0] || 'Admin'}</span>
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {user?.registryName ? `${user.registryName} — ` : ''}National overview
            </p>
          </div>
          <p className="text-sm text-slate-400">{dateStr}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Two panels: Expiring certs + Pending invites */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Expiring certificates */}
        <Panel title="Certificates expiring within 90 days">
          {expiringCertificates.length > 0 ? (
            <div className="space-y-3">
              {expiringCertificates.map((cert) => (
                <div key={cert.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{cert.name}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDaysColor(cert.days)}`}>
                    {cert.days} days
                  </span>
                </div>
              ))}
              <p className="pt-2 text-xs text-slate-400">+3 more expiring soon</p>
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
          <button className="mt-3 w-full rounded-xl py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
            View all certificates
          </button>
        </Panel>

        {/* Pending invites */}
        <Panel title="Pending invites">
          {pendingInvites.length > 0 ? (
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.name} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${invite.color}`}>
                    <span className="text-xs font-semibold text-white">{invite.initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{invite.name}</p>
                    <p className="truncate text-xs text-slate-400">{invite.role} &middot; {invite.dept}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    invite.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                  }`}>
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
          <button
            onClick={() => navigate('/users')}
            className="mt-3 w-full rounded-xl py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
          >
            View all users &rarr;
          </button>
        </Panel>
      </div>

      {/* Registry Activity Chart */}
      <Panel title={`Registry activity &mdash; ${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}, Top 5 by volume`} right={<span className="flex items-center gap-3 text-[11px] text-slate-400"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Registered</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" />Rejected</span></span>}>
        <div className="mb-8">
          {topRegistries.some((r) => r.registered > 0 || r.rejected > 0) ? (
            <div className="space-y-4">
              {topRegistries.map((r) => {
                const total = r.registered + r.rejected;
                const maxTotal = Math.max(...topRegistries.map((x) => x.registered + x.rejected), 1);
                const barPct = (total / maxTotal) * 100;
                const regPct = total > 0 ? (r.registered / total) * barPct : 0;
                const rejPct = total > 0 ? (r.rejected / total) * barPct : 0;
                return (
                  <div key={r.code}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{r.code}</span>
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
        {/* National statistics */}
        <Panel title={`National statistics &mdash; ${today.getFullYear()}`}>
          {nationalStats.some((s) => s.total > 0) ? (
            <div className="space-y-4">
              {nationalStats.map((s) => {
                const maxTotal = Math.max(...nationalStats.map((x) => x.total), 1);
                const barPct = (s.total / maxTotal) * 100;
                const rateColor = s.rate >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
                return (
                  <div key={s.code}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{s.code}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{s.total} requests</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${rateColor}`}>
                          {s.rate}%
                        </span>
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
          <button
            onClick={() => navigate('/stats')}
            className="mt-3 w-full rounded-xl py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
          >
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