import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { hasAdminAccount } from '../services/adminAuthService';

function AdminSetup() {
  const navigate = useNavigate();
  const { createInitialAdmin, isAdmin, isLoading } = useAdminAuth();
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [hasExistingAdmin, setHasExistingAdmin] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    hasAdminAccount()
      .then((result) => {
        if (active) {
          setHasExistingAdmin(result);
        }
      })
      .catch(() => {
        if (active) {
          setHasExistingAdmin(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!isLoading && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (hasExistingAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setSubmitting(true);

    try {
      await createInitialAdmin({
        nama: form.nama,
        email: form.email,
        password: form.password
      });

      navigate('/admin', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Setup admin gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-auth-grid">
        <section className="admin-panel admin-panel-accent">
          <p className="admin-eyebrow">Setup Pertama</p>
          <h1>Buat Super Admin</h1>
          <p>
            Halaman ini hanya dipakai sekali untuk membuat akun admin pertama. Setelah ada satu admin,
            route ini otomatis dialihkan ke halaman login.
          </p>
          <div className="admin-note">
            <span>Role otomatis</span>
            <strong>super-admin</strong>
          </div>
          <div className="admin-note">
            <span>Status akun</span>
            <strong>active</strong>
          </div>
        </section>

        <section className="admin-panel admin-panel-form">
          {hasExistingAdmin === null ? (
            <p>Memeriksa data admin...</p>
          ) : (
            <form onSubmit={handleSubmit} className="admin-form">
              <label>
                Nama admin
                <input
                  type="text"
                  value={form.nama}
                  onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))}
                  placeholder="Nama lengkap admin"
                  required
                />
              </label>
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
              <label>
                Konfirmasi password
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                  placeholder="Ulangi password"
                  required
                />
              </label>
              {error ? <p className="admin-error">{error}</p> : null}
              <button type="submit" className="admin-primary-button" disabled={submitting}>
                {submitting ? 'Membuat admin...' : 'Buat Admin Pertama'}
              </button>
              <Link to="/admin/login" className="admin-secondary-link">
                Sudah punya admin? Login di sini
              </Link>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminSetup;
