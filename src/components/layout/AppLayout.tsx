import { Suspense, type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts';
import { SidebarProvider } from '../../contexts/SidebarContext';

interface AppLayoutProps {
  children: ReactNode;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-maroon-700 rounded-full animate-spin" />
    </div>
  );
}

function LayoutInner({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <div className="flex pt-14">
        {isAuthenticated && <Sidebar />}
        <main
          className={`flex-1 min-h-[calc(100vh-3.5rem)] ${
            isAuthenticated ? 'ml-60' : 'ml-0'
          }`}
        >
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  );
}
