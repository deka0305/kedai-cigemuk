import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import { MenuProvider } from './context/MenuContext';
import FloatingCart from './components/FloatingCart';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminSetup from './pages/AdminSetup';

function AppRoutes() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/setup-admin" element={<AdminSetup />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isHome && <FloatingCart />}
    </>
  );
}

function App() {
  return (
    <AdminAuthProvider>
      <MenuProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </MenuProvider>
    </AdminAuthProvider>
  );
}

export default App;
