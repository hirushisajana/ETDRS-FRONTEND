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
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
    </div>
  );
}

function LayoutInner({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
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