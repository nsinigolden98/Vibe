import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { TermsModal } from './components/auth/TermsModal';
import { MainLayout } from './components/layout/MainLayout';
import { StreamPage } from './pages/StreamPage';
import { PulsePage } from './pages/PulsePage';
import { SpacesPage } from './pages/SpacesPage';
import { AuraPage } from './pages/AuraPage';
import { SettingsPage } from './pages/SettingsPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { supabase } from './lib/supabase';
import { soundManager } from './lib/soundManager';

type Page = 'stream' | 'pulse' | 'spaces' | 'aura' | 'settings' | 'discover';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('stream');
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    if (user && profile && !localStorage.getItem('termsAccepted')) {
      setShowTermsModal(true);
    }
  }, [user, profile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Handle escape key globally
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePageChange = (page: Page) => {
    soundManager.playNavigation();
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-red-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginScreen onComplete={() => {}} />;
  }

  if (showTermsModal) {
    return (
      <TermsModal
        onAccept={() => {
          localStorage.setItem('termsAccepted', 'true');
          setShowTermsModal(false);
        }}
      />
    );
  }

  return (
    <MainLayout currentPage={currentPage} onPageChange={handlePageChange}>
      {currentPage === 'stream' && <StreamPage />}
      {currentPage === 'pulse' && <PulsePage />}
      {currentPage === 'spaces' && <SpacesPage />}
      {currentPage === 'discover' && <DiscoverPage />}
      {currentPage === 'aura' && <AuraPage />}
      {currentPage === 'settings' && <SettingsPage />}
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
