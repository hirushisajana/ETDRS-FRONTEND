import { useAuth } from '../../contexts';

function formatRole(role: string): string {
  const labels: Record<string, string> = {
    IT_ADMIN: 'IT Admin',
    SUPER_ADMIN: 'Super Admin',
    HEAD_OFFICE: 'Head Office',
    REGISTRY_ADMIN: 'Registry Admin',
    REGISTRY_USER: 'Registry User',
    COUNTER_USER: 'Counter User',
    DAYBOOK_USER: 'Daybook User',
    FOLIO_USER: 'Folio User',
  };
  return labels[role] || role;
}

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="fixed right-0 left-60 top-0 z-40 h-14 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <a href="#" className="hidden text-sm text-slate-400 hover:text-slate-700 transition-colors md:block">About</a>
          <a href="#" className="hidden text-sm text-slate-400 hover:text-slate-700 transition-colors md:block">Contact</a>
          <a href="#" className="hidden text-sm text-slate-400 hover:text-slate-700 transition-colors md:block">Help</a>
        </div>
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30">
              {user.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight text-slate-800">{user.fullName}</p>
              <p className="text-[11px] leading-tight text-slate-400">
                {user.registryName ? `${user.registryName} — ` : ''}{user.role ? formatRole(user.role) : 'Unknown'}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}