import { useAuth } from '../../contexts';
import { useNavigate } from 'react-router-dom';

const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const hour = today.getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

const statCards = [
  { label: 'Land registries', value: '0', icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21', note: '—' },
  { label: 'Total users', value: '0', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', note: '—' },
  { label: 'Requests this month', value: '0', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z', note: '—' },
  { label: 'Suspicious reports', value: '0', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z', note: '0 pending review' },
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

function StatCard({ label, value, icon, note }: { label: string; value: string; icon: string; note: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-400">{note}</p>
    </div>
  );
}

function getDaysColor(days: number) {
  if (days <= 30) return 'bg-red-100 text-red-700';
  if (days <= 60) return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {greeting}, {user?.fullName?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {user?.registryName ? `${user.registryName} — ` : ''}National overview
            </p>
          </div>
          <p className="text-sm text-gray-400">{dateStr}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Two panels: Expiring certs + Pending invites */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Expiring certificates */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Certificates expiring within 90 days</h2>
          </div>
          <div className="p-5">
            {expiringCertificates.length > 0 ? (
              <div className="space-y-3">
                {expiringCertificates.map((cert) => (
                  <div key={cert.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{cert.name}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getDaysColor(cert.days)}`}>
                      {cert.days} days
                    </span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-2">+3 more expiring soon</p>
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">All clear</p>
                <p className="text-xs text-gray-400 mt-1">No certificates expiring within 90 days</p>
              </div>
            )}
            <button className="mt-3 w-full py-2 text-sm text-maroon-700 hover:text-maroon-900 hover:bg-maroon-50 rounded-lg transition-colors font-medium">
              View all certificates
            </button>
          </div>
        </div>

        {/* Pending invites */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Pending invites</h2>
          </div>
          <div className="p-5">
            {pendingInvites.length > 0 ? (
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div key={invite.name} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${invite.color} flex items-center justify-center`}>
                      <span className="text-xs font-semibold text-white">{invite.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{invite.name}</p>
                      <p className="text-xs text-gray-400 truncate">{invite.role} &middot; {invite.dept}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      invite.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {invite.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">No pending invites</p>
                <p className="text-xs text-gray-400 mt-1">All invited users have activated their accounts</p>
              </div>
            )}
            <button
              onClick={() => navigate('/users')}
              className="mt-3 w-full py-2 text-sm text-maroon-700 hover:text-maroon-900 hover:bg-maroon-50 rounded-lg transition-colors font-medium"
            >
              View all users &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Registry Activity Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Registry activity &mdash; {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}, Top 5 by volume</h2>
        </div>
        <div className="p-5">
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
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{r.code}</span>
                      <span className="text-xs text-gray-400">{total} requests</span>
                    </div>
                    <div className="h-5 bg-gray-50 rounded-full overflow-hidden flex">
                      {total > 0 && (
                        <>
                          <div className="bg-blue-500 h-full transition-all" style={{ width: `${regPct}%` }} title={`Registered: ${r.registered}`} />
                          <div className="bg-red-400 h-full transition-all" style={{ width: `${rejPct}%` }} title={`Rejected: ${r.rejected}`} />
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
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">No registry activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Data will appear as registrations are processed</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: National stats + Quick actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* National statistics */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">National statistics &mdash; {today.getFullYear()}</h2>
          </div>
          <div className="p-5">
            {nationalStats.some((s) => s.total > 0) ? (
              <div className="space-y-4">
                {nationalStats.map((s) => {
                  const maxTotal = Math.max(...nationalStats.map((x) => x.total), 1);
                  const barPct = (s.total / maxTotal) * 100;
                  const rateColor = s.rate >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
                  return (
                    <div key={s.code}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{s.code}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{s.total} requests</span>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${rateColor}`}>
                            {s.rate}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-maroon-700 rounded-full transition-all" style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">No statistics yet</p>
                <p className="text-xs text-gray-400 mt-1">Data will populate as registrations are processed</p>
              </div>
            )}
            <button
              onClick={() => navigate('/stats')}
              className="mt-3 w-full py-2 text-sm text-maroon-700 hover:text-maroon-900 hover:bg-maroon-50 rounded-lg transition-colors font-medium"
            >
              View full report &rarr;
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Quick actions</h2>
          </div>
          <div className="p-5 space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                  </svg>
                </div>
                <span>{action.label}</span>
                <svg className="w-4 h-4 ml-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
