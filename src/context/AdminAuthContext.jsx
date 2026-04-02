import { createContext, useContext, useEffect, useState } from 'react';
import {
  createInitialAdmin,
  loginAdmin,
  logoutAdmin,
  subscribeAdminSession
} from '../services/adminAuthService';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState({
    user: null,
    adminProfile: null,
    isAdmin: false,
    isLoading: true
  });

  async function handleLoginAdmin(email, password) {
    const authSession = await loginAdmin(email, password);
    setSession({
      ...authSession,
      isAdmin: true,
      isLoading: false
    });

    return authSession;
  }

  async function handleLogoutAdmin() {
    await logoutAdmin();
    setSession({
      user: null,
      adminProfile: null,
      isAdmin: false,
      isLoading: false
    });
  }

  async function handleCreateInitialAdmin(payload) {
    const authSession = await createInitialAdmin(payload);
    setSession({
      ...authSession,
      isAdmin: true,
      isLoading: false
    });

    return authSession;
  }

  useEffect(() => {
    const unsubscribe = subscribeAdminSession((authSession) => {
      setSession({
        ...authSession,
        isLoading: false
      });
    });

    return unsubscribe;
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        ...session,
        loginAdmin: handleLoginAdmin,
        logoutAdmin: handleLogoutAdmin,
        createInitialAdmin: handleCreateInitialAdmin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth harus dipakai di dalam AdminAuthProvider.');
  }

  return context;
}
