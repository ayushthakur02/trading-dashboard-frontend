import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextValue {
  auth: AuthState;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'td_token';
const USER_KEY  = 'td_user';

function loadSaved(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    if (token && raw) return { token, user: JSON.parse(raw) as User };
  } catch {
    // ignore corrupt storage
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadSaved);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuth({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuth({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
