import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Auth } from '@/components/Auth';
import { Library } from '@/components/Library';
import { Sidebar } from '@/components/Sidebar';
import { PromptEditor } from '@/components/PromptEditor';
import { Settings } from '@/components/Settings';
import { Header } from '@/components/Header';
import { Drawer } from '@/components/ui/drawer';
import { Share } from '@/components/Share';
import { ShareBook } from '@/components/Share';
import { PromptBooks } from '@/components/PromptBooks';
import { PromptBookEditor } from '@/components/PromptBookEditor';
import { getNextIconColor } from '@/lib/utils';

function App() {
  const { user, checkUser, isDarkMode } = useStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const iconColor = React.useMemo(getNextIconColor, []);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--light-icon-color', iconColor.light);
    document.documentElement.style.setProperty('--dark-icon-color', iconColor.dark);
  }, [iconColor]);

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const theme = localStorage.getItem('theme');
      if (theme === null) {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    // Initial check
    if (localStorage.getItem('theme') === null) {
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  React.useEffect(() => {
    const initAuth = async () => {
      await checkUser();
      setIsLoading(false);
    };
    initAuth();
  }, [checkUser]);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-foreground/60">Loading...</div>
      </div>
    );
  }

  // Only require auth for non-share routes
  if (!user && !window.location.pathname.startsWith('/share/')) {
    return <Auth />;
  }

  return (
    <Router>
      {/* Render header and sidebar only for authenticated users */}
      {user ? (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <div className="flex pt-16 flex-1 h-[calc(100vh-4rem)] overflow-hidden">
          <div className="hidden lg:block h-full">
            <Sidebar />
          </div>
          <Drawer open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </Drawer>
          <main className="flex-1 h-full p-6 overflow-y-auto relative">
            <Routes>
              <Route path="/" element={<Library />} />
              <Route path="/prompts" element={<Library />} />
              <Route path="/prompts/category/:id" element={<Library />} />
              <Route path="/prompt/:id" element={<PromptEditor />} />
              <Route path="/books" element={<PromptBooks />} />
              <Route path="/books/:id" element={<PromptBookEditor />} />
              <Route path="/share/book/:bookId" element={<ShareBook />} />
              <Route path="/share/book/:bookId/prompt/:promptId" element={<Share />} />
              <Route path="/share/prompt/:shareId" element={<Share />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
      ) : (
        <main className="h-screen">
          <Routes>
            <Route path="/share/book/:bookId" element={<ShareBook />} />
            <Route path="/share/book/:bookId/prompt/:promptId" element={<Share />} />
            <Route path="/share/prompt/:shareId" element={<Share />} />
          </Routes>
        </main>
      )}
    </Router>
  );
}

export default App;
