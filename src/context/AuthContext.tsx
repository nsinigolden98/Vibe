import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import {
  supabase,
  getCurrentUser,
  getUserProfile,
  createUserProfile,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut
} from '@/services/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string, email: string) => {
    let profile = await getUserProfile(userId);
    
    if (!profile) {
      // Create profile if it doesn't exist
      const { data, error } = await createUserProfile(userId, email);
      if (!error && data) {
        profile = data as User;
      }
    }
    
    setUser(profile);
  }, []);

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id, currentSession.user.email!);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, newSession: any) => {
        setSession(newSession);
        
        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id, newSession.user.email!);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password);
    return { error: error?.message };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await signUpWithEmail(email, password);
    
    if (error) {
      return { error: error.message };
    }
    
    // Check if email confirmation is required
    const needsConfirmation = !data.session;
    
    if (data.user && !needsConfirmation) {
      await fetchUserProfile(data.user.id, email);
    }
    
    return { needsConfirmation };
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    return { error: error?.message };
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setSession(null);
  };

  const refreshUser = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user.id, session.user.email!);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle: handleGoogleSignIn,
        logout,
        refreshUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
