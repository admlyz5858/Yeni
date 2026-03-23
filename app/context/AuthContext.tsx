import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, hasSupabase } from '../lib/supabase';

const AUTH_KEY = '@study_auth';

export type UserRole = 'admin' | 'member';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  hasBackend: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  getUsers: () => Promise<{ id: string; email: string; name: string; role: UserRole }[]>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  getSessionToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<{ name: string; role: UserRole } | null> {
  if (!hasSupabase || !supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', userId)
    .single();
  if (data) return { name: data.name || '', role: (data.role as UserRole) || 'member' };
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (hasSupabase && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setUserState({
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || (session.user as any).user_metadata?.name || session.user.email || '',
              role: profile?.role || 'member',
            });
          }
        } else {
          const raw = await AsyncStorage.getItem(AUTH_KEY);
          if (raw) {
            try {
              const u = JSON.parse(raw);
              if (u?.id === 'demo') setUserState(u);
            } catch (e) {
              if (__DEV__) console.warn('Demo auth parse:', e);
            }
          }
        }
      } catch (e) {
        if (__DEV__) console.warn('Auth init:', e);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') setUserState(null);
      else if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUserState({
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || (session.user as any).user_metadata?.name || '',
          role: profile?.role || 'member',
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        const u: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.name || (data.user as any).user_metadata?.name || '',
          role: profile?.role || 'member',
        };
        setUserState(u);
      }
      return { ok: true };
    }

    if (email === 'demo@calismaasistani.app' && password === 'demo123') {
      const u: User = { id: 'demo', email, name: 'Demo Kullanıcı', role: 'member' };
      setUserState(u);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
      return { ok: true };
    }

    return { ok: false, error: 'Uygulama henüz yapılandırılmamış. Lütfen geliştirici ile iletişime geçin.' };
  };

  const register = async (email: string, password: string, name: string) => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role: 'member' } },
      });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        if (data.session) {
          const profile = await fetchProfile(data.user.id);
          setUserState({
            id: data.user.id,
            email: data.user.email || '',
            name: profile?.name || name,
            role: profile?.role || 'member',
          });
          return { ok: true };
        }
        return { ok: true, error: 'EMAIL_CONFIRM' };
      }
      return { ok: false, error: 'Kayıt sırasında bir hata oluştu.' };
    }

    return { ok: false, error: 'Uygulama henüz yapılandırılmamış. Lütfen geliştirici ile iletişime geçin.' };
  };

  const logout = async () => {
    if (hasSupabase && supabase) await supabase.auth.signOut();
    await AsyncStorage.removeItem(AUTH_KEY);
    setUserState(null);
  };

  const getUsers = async () => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.from('profiles').select('id, email, name, role');
      if (error) return [];
      return (data || []).map((r: any) => ({
        id: r.id,
        email: r.email || '',
        name: r.name || '',
        role: (r.role as UserRole) || 'member',
      }));
    }
    return [];
  };

  const resetPassword = async (email: string) => {
    if (!hasSupabase || !supabase) return { ok: false, error: 'Backend yapılandırılmamış' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const getSessionToken = async (): Promise<string | null> => {
    if (!hasSupabase || !supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      hasBackend: hasSupabase,
      login,
      register,
      logout,
      getUsers,
      resetPassword,
      getSessionToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
