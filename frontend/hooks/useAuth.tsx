import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string | null;
  phone: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, redirect?: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    location?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_DASHBOARDS: Record<string, string> = {
  buyer: '/dashboard/buyer',
  admin: '/dashboard/admin',
};

async function fetchProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, location, phone')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setUser(profile);
      }
      if (mounted) setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted) setUser(profile);
        } else {
          if (mounted) setUser(null);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, redirect?: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      const profile = await fetchProfile(data.user.id);
      if (!profile) throw new Error('Profile not found');

      setUser(profile);
      router.push(redirect || ROLE_DASHBOARDS[profile.role] || '/');
    },
    [router],
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      location?: string;
      phone?: string;
    }) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
            location: data.location || null,
            phone: data.phone || null,
          },
        },
      });

      if (error) throw new Error(error.message);
      if (!authData.user) throw new Error('Registration failed');

      const profile = await fetchProfile(authData.user.id);
      if (profile) {
        setUser(profile);
        router.push(ROLE_DASHBOARDS[profile.role] || '/');
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
