import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminSetup from './pages/AdminSetup';

function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/setup-admin" element={<AdminSetup />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AdminAuthProvider>
  );
}

export default App;
