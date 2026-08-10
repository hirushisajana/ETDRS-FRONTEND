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
    <header className="fixed top-0 right-0 left-60 z-40 h-14 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors hidden md:block">About</a>
          <a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors hidden md:block">Contact</a>
          <a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors hidden md:block">Help</a>
        </div>
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-maroon-700 flex items-center justify-center text-white text-xs font-semibold">
              {user.fullName?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800 leading-tight">{user.fullName}</p>
              <p className="text-[11px] text-gray-400 leading-tight">
                {user.registryName ? `${user.registryName} — ` : ''}{user.role ? formatRole(user.role) : 'Unknown'}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
