    import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Readable hint that a session likely exists. The real auth token lives in an
// httpOnly cookie the JS can't read, so we track this alongside it purely to
// avoid firing /api/auth/me (and a 401) for every anonymous visitor. This is
// NOT a security control — the server still enforces the cookie on every route.
const AUTH_HINT_KEY = 'ct-auth-hint';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    // No session hint → anonymous visitor. Skip the request entirely so we
    // never generate a 401 just to confirm what we already know.
    if (!localStorage.getItem(AUTH_HINT_KEY)) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        // Server can occasionally return a non-JSON body; parse defensively.
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setUser(data.user);
        } catch {
          localStorage.removeItem(AUTH_HINT_KEY);
        }
      } else {
        // Hint was stale (session expired/invalid). Clear it so the next load
        // stays quiet instead of asking again.
        localStorage.removeItem(AUTH_HINT_KEY);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        console.error('Login response parse error. Status:', res.status, 'Body:', text);
        throw new Error(`Server returned invalid response (${res.status}). See console.`);
    }

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem(AUTH_HINT_KEY, '1');
    setUser(data.user);
  }

  async function register(name: string, email: string, password: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await res.json();
    localStorage.setItem(AUTH_HINT_KEY, '1');
    setUser(data.user);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem(AUTH_HINT_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
