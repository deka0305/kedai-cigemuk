import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

function ProtectedAdminRoute() {
  const location = useLocation();
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <p>Memeriksa sesi admin...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
