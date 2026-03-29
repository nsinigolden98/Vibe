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
import { supabase } from './lib/supabase';

type Page = 'stream' | 'pulse' | 'spaces' | 'aura' | 'settings';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('stream');
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    if (user && profile && !localStorage.getItem('termsAccepted')) {
      setShowTermsModal(true);
    }
  }, [user, profile]);

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
    <MainLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'stream' && <StreamPage />}
      {currentPage === 'pulse' && <PulsePage />}
      {currentPage === 'spaces' && <SpacesPage />}
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
