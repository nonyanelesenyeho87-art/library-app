import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);
const USER_KEY = 'library_user';

function loadUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const logout = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const login = useCallback(async (membershipId, password) => {
    const { token, user: u } = await api.login(membershipId, password);
    tokenStore.set(token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  // If the server says our token expired, log out automatically.
  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  const value = useMemo(() => ({ user, isAdmin: user?.role === 'admin', login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
