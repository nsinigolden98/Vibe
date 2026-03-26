import { useEffect, useState } from 'react';
import { useVibeStore } from '@/hooks/useVibeStore';
import SplashScreen from '@/sections/SplashScreen';
import LoginScreen from '@/sections/LoginScreen';
import UnifiedLayout from '@/layouts/UnifiedLayout';
import DropCreator from '@/components/DropCreator';
import DropDetailModal from '@/components/DropDetailModal';
import TermsModal from '@/components/TermsModal';
import PrivacyModal from '@/components/PrivacyModal';
import IdentityModal from '@/components/IdentityModal';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import './App.css';
import { supabase } from '@/lib/supabase';


function App() {
  const { 
    isAuthenticated, 
    settings, 
    showTermsModal, 
    showPrivacyModal, 
    showIdentityModal,
    isDropDetailOpen,
  } = useVibeStore();
  const [showSplash, setShowSplash] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'terms' | 'privacy'>('main');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  useEffect(() => {
    // Splash screen timer
    if (isMobile && !isAuthenticated) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        setShowLogin(true);
      }, 2500);
      return () => clearTimeout(timer);
    } else if (!isMobile && !isAuthenticated) {
      setShowSplash(false);
      setShowLogin(true);
    }
  }, [isMobile, isAuthenticated]);

  // Navigation handler for legal pages
  const navigateTo = (page: 'main' | 'terms' | 'privacy') => {
    setCurrentPage(page);
  };

  // Render legal pages
  if (currentPage === 'terms') {
    return <TermsPage onBack={() => navigateTo('main')} />;
  }

  if (currentPage === 'privacy') {
    return <PrivacyPage onBack={() => navigateTo('main')} />;
  }

  // Render authentication flow
  if (!isAuthenticated) {
    if (isMobile && showSplash) {
      return <SplashScreen />;
    }
    if (showLogin) {
      return <LoginScreen />;
    }
  }

  // Render main app
  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-gray-900'}`}>
      <UnifiedLayout onNavigate={navigateTo} />
      <DropCreator />
      {isDropDetailOpen && <DropDetailModal />}
      {showTermsModal && <TermsModal />}
      {showPrivacyModal && <PrivacyModal />}
      {showIdentityModal && <IdentityModal />}
    </div>
  );
}





export default App;
