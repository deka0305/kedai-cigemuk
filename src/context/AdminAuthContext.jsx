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
        loginAdmin,
        logoutAdmin,
        createInitialAdmin
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
