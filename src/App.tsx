import { useState } from 'react';
import { DataProvider } from '@/context/DataContext';
import { useData } from '@/context/useData';
import { Sidebar, MobileNav, TopBar, type Page } from '@/components/Navigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';

function AppInner() {
  const [page, setPage] = useState<Page>('dashboard');
  const { updateSettings } = useData();

  const toggleTheme = () => {
    const dark = document.documentElement.classList.contains('dark');
    updateSettings({ theme: dark ? 'light' : 'dark' });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar page={page} onNavigate={setPage} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onToggleTheme={toggleTheme} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
          {page === 'dashboard' && <DashboardPage />}
          {page === 'progress' && <ProgressPage />}
          {page === 'history' && <HistoryPage />}
          {page === 'settings' && <SettingsPage />}
        </main>
      </div>
      <MobileNav page={page} onNavigate={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}
