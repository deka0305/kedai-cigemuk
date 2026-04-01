import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, loginAdmin, isLoading } = useAdminAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname || '/admin';

  if (!isLoading && isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await loginAdmin(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Login admin gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-auth-grid">
        <section className="admin-panel admin-panel-accent">
          <p className="admin-eyebrow">Kedai Cigemuk</p>
          <h1>Login Super Admin</h1>
          {/* <p>
            Halaman ini hanya untuk admin yang sudah terdaftar di Firebase Authentication dan
            koleksi <strong>admins</strong>.
          </p> */}
          {/* <div className="admin-note">
            <span>URL admin</span>
            <strong>/admin/login</strong>
          </div> */}
          {/* <div className="admin-note">
            <span>Setup pertama</span>
            <strong>
              <Link to="/setup-admin">/setup-admin</Link>
            </strong>
          </div> */}
        </section>

        <section className="admin-panel admin-panel-form">
          <form onSubmit={handleSubmit} className="admin-form">
            <label>
              Email admin
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="admin@kedaicigemuk.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Minimal 6 karakter"
                required
              />
            </label>
            {error ? <p className="admin-error">{error}</p> : null}
            <button type="submit" className="admin-primary-button" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Masuk ke Dashboard'}
            </button>
            <Link to="/" className="admin-secondary-link">
              Kembali ke halaman utama
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}

export default AdminLogin;
