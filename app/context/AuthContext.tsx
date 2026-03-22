import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, hasSupabase } from '../lib/supabase';

const AUTH_KEY = '@kpss_auth';
const USERS_KEY = '@kpss_users';

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
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  getUsers: () => Promise<{ id: string; email: string; name: string; role: UserRole }[]>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: { email: string; password: string; name: string; role: UserRole }[] = [
  { email: 'admin@admin.com', password: 'admin123', name: 'Admin', role: 'admin' },
  { email: 'uye@uygulama.com', password: 'uyari123', name: 'Üye Kullanıcı', role: 'member' },
];

async function loadDemoUsers(): Promise<{ email: string; password: string; name: string; role: UserRole }[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return [...DEMO_USERS, ...parsed];
    }
  } catch {}
  return DEMO_USERS;
}

async function saveDemoUser(email: string, password: string, name: string, role: UserRole) {
  const users = await loadDemoUsers();
  if (users.some((u) => u.email === email)) return;
  users.push({ email, password, name, role });
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users.slice(DEMO_USERS.length)));
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
            const role = (session.user as any).role || 'member';
            setUserState({
              id: session.user.id,
              email: session.user.email || '',
              name: (session.user as any).user_metadata?.name || session.user.email || '',
              role,
            });
          }
        } else {
          const raw = await AsyncStorage.getItem(AUTH_KEY);
          if (raw) {
            const u = JSON.parse(raw);
            setUserState(u);
          }
        }
      } catch {}
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        const role = (data.user as any).role || 'member';
        setUserState({
          id: data.user.id,
          email: data.user.email || '',
          name: (data.user as any).user_metadata?.name || '',
          role,
        });
      }
      return { ok: true };
    }

    const users = await loadDemoUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, error: 'E-posta veya şifre hatalı' };
    const u: User = {
      id: found.email,
      email: found.email,
      name: found.name,
      role: found.role,
    };
    setUserState(u);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    return { ok: true };
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
        setUserState({
          id: data.user.id,
          email: data.user.email || '',
          name,
          role: 'member',
        });
      }
      return { ok: true };
    }

    const users = await loadDemoUsers();
    if (users.some((u) => u.email === email)) return { ok: false, error: 'Bu e-posta zaten kayıtlı' };
    await saveDemoUser(email, password, name, 'member');
    const u: User = { id: email, email, name, role: 'member' };
    setUserState(u);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    return { ok: true };
  };

  const logout = async () => {
    if (hasSupabase && supabase) await supabase.auth.signOut();
    else await AsyncStorage.removeItem(AUTH_KEY);
    setUserState(null);
  };

  const getUsers = async () => {
    if (hasSupabase && supabase) {
      const { data } = await supabase.from('users').select('*');
      return (data || []).map((r: any) => ({ id: r.id, email: r.email, name: r.name || '', role: r.role || 'member' }));
    }
    const users = await loadDemoUsers();
    return users.map((u, i) => ({ id: u.email, email: u.email, name: u.name, role: u.role }));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, getUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
