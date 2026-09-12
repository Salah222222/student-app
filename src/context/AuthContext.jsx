import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api, setUnauthorizedHandler } from "../lib/apiClient";
import { getToken, getUser, setSession, clearSession } from "../lib/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getUser() : null));

  const logoutLocal = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    // Central place a 401 from anywhere in the app routes to: drop the
    // session and let ProtectedRoute redirect to /login.
    setUnauthorizedHandler(logoutLocal);
  }, [logoutLocal]);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    setSession(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getToken()) await api.logout();
    } catch {
      // Even if the network call fails, the device should still end up
      // logged out locally — a dead token left behind is harmless (it
      // simply expires in 90 days) but a stuck "logged in" UI is not.
    } finally {
      logoutLocal();
    }
  }, [logoutLocal]);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
