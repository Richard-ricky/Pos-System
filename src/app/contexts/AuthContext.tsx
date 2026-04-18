// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../utils/supabase/client';
import { User } from '../types';
import { getUserProfile } from '../utils/api';

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: (token?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // useNavigate works here because AuthProvider is always rendered
  // inside a RouterProvider (via Providers wrapper in routes.tsx)
  const navigate = useNavigate();

  const refreshProfile = async (token?: string) => {
    const resolvedToken = token ?? session?.access_token;
    if (!resolvedToken) return;
    try {
      const { profile } = await getUserProfile(resolvedToken);
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  // ── Initial session load ────────────────────────────────────────────
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session: current } } = await supabase.auth.getSession();
        if (current) {
          setSession(current);
          await refreshProfile(current.access_token);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth state listener ─────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (newSession && ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) {
          await refreshProfile(newSession.access_token);
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          // Hard redirect to login — clears any stale screen state
          navigate('/login', { replace: true });
        }
      },
    );
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── signIn ──────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      await refreshProfile(data.session.access_token);
    }
  };

  // ── signOut ─────────────────────────────────────────────────────────
  // Calling supabase.auth.signOut() triggers the SIGNED_OUT event above,
  // which handles clearing state + navigating to /login automatically.
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, currentUser: user, session, loading, signIn, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}