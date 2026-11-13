/* Auth context backed by the Laravel session cookie.
 *
 * Exposes { user, loading, signIn, signUp, signOut }. Compatibility aliases
 * (login, register, logout, ready, isAuthenticated) keep older pages working.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName || user.name || '',
    name: user.fullName || user.name || '',
    is_admin: Boolean(user.is_admin),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.me()
      .then((data) => {
        if (active) setUser(normalizeUser(data.user));
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (username, password, remember = false) => {
    const data = await api.login({ username, password, remember });
    const next = normalizeUser(data.user);
    setUser(next);
    return next;
  }, []);

  const signUp = useCallback(async (fullName, username, password) => {
    const data = await api.signup({ fullName, username, password });
    const next = normalizeUser(data.user);
    setUser(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* even if the request fails, drop the local session view */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      // Compatibility aliases used by the portal/admin pages.
      ready: !loading,
      isAuthenticated: Boolean(user),
      login: signIn,
      register: signUp,
      logout: signOut,
    }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
