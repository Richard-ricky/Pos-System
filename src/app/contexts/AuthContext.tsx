// AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../utils/supabase/client'; // ← shared singleton
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

  const refreshProfile = async (token?: string) => {
    // Use explicit token, or the current session from the shared client
    const resolvedToken = token ?? session?.access_token;
    if (!resolvedToken) return; // no session yet — skip silently

    try {
      const { profile } = await getUserProfile(resolvedToken);
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  // ─── Initial session load ──────────────────────────────────────────────────
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

  // ─── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (
          newSession &&
          (event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED' ||
            event === 'USER_UPDATED' ||
            event === 'INITIAL_SESSION')
        ) {
          await refreshProfile(newSession.access_token);
        } else if (!newSession) {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── signIn ────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.session) {
      setSession(data.session);
      await refreshProfile(data.session.access_token);
    }
  };

  // ─── signOut ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, currentUser: user, session, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
