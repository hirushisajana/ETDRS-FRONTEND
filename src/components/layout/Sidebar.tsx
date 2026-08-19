import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
  tab?: string;
}

const allSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['IT_ADMIN', 'SUPER_ADMIN', 'HEAD_OFFICE', 'REGISTRY_ADMIN', 'DAYBOOK_USER'] },
      { label: 'Land registries', path: '/dashboard/super-admin/registries', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', roles: ['IT_ADMIN', 'SUPER_ADMIN'] },
      { label: 'Users', path: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['IT_ADMIN', 'SUPER_ADMIN'] },
      { label: 'Notaries', path: '/notaries', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', roles: ['IT_ADMIN', 'SUPER_ADMIN'] },
      // Registry admin specific
      { label: 'Daybook', path: '/daybook/list', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25', roles: ['REGISTRY_ADMIN'] },
      { label: 'Folio', path: '/folio/admin', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', roles: ['REGISTRY_ADMIN'] },
      { label: 'Staff', path: '/staff', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', roles: ['REGISTRY_ADMIN'] },
      { label: 'Search', path: '/search', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', roles: ['REGISTRY_ADMIN'] },
      { label: 'Signature', path: '/signature', icon: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z', roles: ['REGISTRY_ADMIN'] },
      // Daybook user specific
      { label: 'Search', path: '/daybook/list', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', roles: ['DAYBOOK_USER'] },
    ],
  },
  {
    title: 'COUNTER',
    items: [
      { label: 'Dashboard', path: '/daybook/counter', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['COUNTER_USER'] },
      { label: 'New Entry', path: '/daybook/counter', tab: 'new', icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['COUNTER_USER'] },
      { label: 'Quarterly Updates', path: '/daybook/counter', tab: 'update', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182', roles: ['COUNTER_USER'] },
      { label: 'Re-submission', path: '/daybook/counter', tab: 'resubmit', icon: 'M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3', roles: ['COUNTER_USER'] },
      { label: 'Handover', path: '/daybook/handover', icon: 'M8.25 4.5l7.5 7.5-7.5 7.5M15.75 12H3.75', roles: ['COUNTER_USER'] },
      { label: 'Completed Handovers', path: '/daybook/handover/history', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', roles: ['COUNTER_USER'] },
      { label: 'Recent Entries', path: '/daybook/recent', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['COUNTER_USER'] },
      { label: 'Rejected Deeds', path: '/daybook/rejected', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', roles: ['COUNTER_USER'] },
    ],
  },
  {
    title: 'FOLIO',
    items: [
      { label: 'Dashboard', path: '/folio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['FOLIO_USER'] },
      { label: 'My Entries', path: '/folio/my', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', roles: ['FOLIO_USER'] },
      { label: 'Search', path: '/folio/my', tab: 'search', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', roles: ['FOLIO_USER'] },
      { label: 'Reported Records', path: '/folio/records', icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z', roles: ['FOLIO_USER'] },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Certificates', path: '/certificates', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', roles: ['IT_ADMIN', 'SUPER_ADMIN', 'REGISTRY_ADMIN', 'HEAD_OFFICE'] },
      { label: 'Suspicious reports', path: '/suspicious', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z', roles: ['IT_ADMIN', 'HEAD_OFFICE', 'SUPER_ADMIN', 'REGISTRY_ADMIN'] },
      { label: 'Statistics', path: '/stats', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', roles: ['IT_ADMIN', 'SUPER_ADMIN', 'REGISTRY_ADMIN', 'HEAD_OFFICE'] },
      // Registry admin specific
      { label: 'Registrar Verification', path: '/approval', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['REGISTRY_ADMIN'] },
      { label: 'Reported Records', path: '/folio/records', icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z', roles: ['REGISTRY_ADMIN'] },
      { label: 'Registered Records', path: '/folio/admin?status=REGISTERED', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.5A5.25 5.25 0 016.75 7.5v3.75m3-3.75V12m-3.75 0v3.75m9-7.5V12m-3.75 0v3.75', roles: ['REGISTRY_ADMIN'] },
      { label: 'Rejected Records', path: '/folio/admin?status=REJECTED', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', roles: ['REGISTRY_ADMIN'] },
      { label: 'Reports', path: '/stats', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', roles: ['REGISTRY_ADMIN'] },
    ],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userRole = user?.role || '';
  const currentTab = searchParams.get('tab');

  const sections = allSections
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => !i.roles || i.roles.includes(userRole)),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-30 flex w-60 flex-col bg-slate-950 text-white no-print">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 h-14">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-black tracking-tight text-white shadow-lg shadow-blue-500/30">
          eT
        </span>
        <span className="text-base font-bold tracking-tight">
          e-Trust<span className="text-blue-400">.</span>
        </span>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const itemPath = item.path.split('?')[0];
                const isActive = item.tab
                  ? location.pathname === itemPath && currentTab === item.tab
                  : location.pathname === itemPath && !currentTab;
                return (
                  <button
                    key={item.path + item.label}
                    onClick={() => navigate(item.tab ? `${item.path}?tab=${item.tab}` : item.path)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 font-medium text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-2 pb-4 pt-3">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-400 transition-all duration-150 hover:bg-white/5 hover:text-white"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}