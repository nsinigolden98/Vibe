import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { soundManager } from '@/sounds/SoundManager';
import { setDemoUser } from '@/services/supabaseClient';
import Navbar from '@/components/Navbar';
import CreateDropModal from '@/components/CreateDropModal';
import PremiumModal from '@/components/PremiumModal';

// Pages
import Stream from '@/pages/Stream';
import Pulse from '@/pages/Pulse';
import Spaces from '@/pages/Spaces';
import Aura from '@/pages/Aura';
import Discover from '@/pages/Discover';
import Auth from '@/pages/Auth';
import Signals from '@/pages/Signals';
import Masks from '@/pages/Masks';
import VoidWall from '@/pages/VoidWall';
import TruthOrVoid from '@/pages/TruthOrVoid';
import VibeMatch from '@/pages/VibeMatch';

import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff2e2e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Auth Callback Handler
const AuthCallback: React.FC = () => {
  const { refreshUser } = useAuth();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      await refreshUser();
      setHandled(true);
    };
    handleCallback();
  }, [refreshUser]);

  if (handled) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ff2e2e] border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

// Main App Content
const AppContent: React.FC = () => {
  const { user, refreshUser, isAuthenticated, isDemoMode } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    // DEMO MODE: Sync demo user with supabase client
    if (isDemoMode && user) {
      setDemoUser(user);
    } else if (!isDemoMode) {
      setDemoUser(null);
    }
    
    // Initialize sound manager
    if (user) {
      soundManager.setEnabled(user.sound_enabled);
    }
  }, [user, isDemoMode]);

  const handleCreateDrop = () => {
    if (!isAuthenticated) {
      return;
    }
    setShowCreateModal(true);
    soundManager.playClick();
  };

  const handleUpgrade = () => {
    refreshUser();
  };

  return (
    <ThemeProvider isPremium={user?.premium || false}>
      <div className="min-h-screen bg-gray-900 text-white">
        <Router>
          {isAuthenticated && (
            <Navbar
              currentUser={user}
              onCreateDrop={handleCreateDrop}
              onUpgrade={() => setShowPremiumModal(true)}
            />
          )}

          <main className={`${isAuthenticated ? 'lg:ml-64' : ''} min-h-screen pt-14 lg:pt-0`}>
            <Routes>
              <Route
                path="/auth"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />}
              />
              <Route
                path="/auth/callback"
                element={<AuthCallback />}
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Stream currentUser={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pulse"
                element={
                  <ProtectedRoute>
                    <Pulse currentUser={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/spaces"
                element={
                  <ProtectedRoute>
                    <Spaces currentUser={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discover"
                element={
                  <ProtectedRoute>
                    <Discover currentUser={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/aura"
                element={
                  <ProtectedRoute>
                    <Aura currentUser={user} onUpdate={refreshUser} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/signals"
                element={
                  <ProtectedRoute>
                    <Signals currentUser={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/masks"
                element={
                  <ProtectedRoute>
                    <Masks currentUser={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/void"
                element={
                  <ProtectedRoute>
                    <VoidWall currentUser={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/truth"
                element={
                  <ProtectedRoute>
                    <TruthOrVoid currentUser={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/match"
                element={
                  <ProtectedRoute>
                    <VibeMatch currentUser={user} />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </Router>

        {/* Create Drop Modal */}
        <CreateDropModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          currentUser={user}
          onSuccess={() => {
            refreshUser();
          }}
        />

        {/* Premium Modal */}
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          currentUser={user}
          onUpgrade={handleUpgrade}
        />
      </div>
    </ThemeProvider>
  );
};

// Root App
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
