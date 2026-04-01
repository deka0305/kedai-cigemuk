import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  deleteOrderById,
  subscribeOrders,
  updateOrderById
} from '../services/orderService';

const EMPTY_FORM = {
  nama: '',
  wa: '',
  metode: 'pickup',
  alamat: '',
  tanggal: '',
  waktu: '',
  bayar: 'COD (Bayar di Tempat)',
  catatan: '',
  total: 0,
  status: 'baru'
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().toLocaleString('id-ID');
  }

  return '-';
}

function buildEditForm(order) {
  return {
    nama: order.nama || '',
    wa: order.wa || '',
    metode: order.metode || 'pickup',
    alamat: order.alamat || '',
    tanggal: order.tanggal || '',
    waktu: order.waktu || '',
    bayar: order.bayar || 'COD (Bayar di Tempat)',
    catatan: order.catatan || '',
    total: order.total || 0,
    status: order.status || 'baru'
  };
}

function AdminDashboard() {
  const { adminProfile, logoutAdmin } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [feedback, setFeedback] = useState('');
  const [busyAction, setBusyAction] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeOrders((incomingOrders) => {
      setOrders(incomingOrders);
      setLoadingOrders(false);
    });

    return unsubscribe;
  }, []);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'semua') {
      return orders;
    }

    return orders.filter((order) => order.status === filterStatus);
  }, [filterStatus, orders]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  useEffect(() => {
    if (selectedOrder) {
      setEditForm(buildEditForm(selectedOrder));
      return;
    }

    if (orders[0] && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
      setEditForm(buildEditForm(orders[0]));
    }
  }, [orders, selectedOrder, selectedOrderId]);

  async function handleLogout() {
    await logoutAdmin();
  }

  async function handleUpdateOrder(event) {
    event.preventDefault();

    if (!selectedOrderId) {
      return;
    }

    setBusyAction('update');
    setFeedback('');

    try {
      await updateOrderById(selectedOrderId, {
        ...editForm,
        total: Number(editForm.total || 0)
      });
      setFeedback('Order berhasil diperbarui.');
    } catch (error) {
      setFeedback(error.message || 'Update order gagal.');
    } finally {
      setBusyAction('');
    }
  }

  async function handleDeleteOrder() {
    if (!selectedOrderId) {
      return;
    }

    const confirmed = window.confirm('Hapus order ini dari Firebase?');

    if (!confirmed) {
      return;
    }

    setBusyAction('delete');
    setFeedback('');

    try {
      await deleteOrderById(selectedOrderId);
      setFeedback('Order berhasil dihapus.');
      setSelectedOrderId(null);
      setEditForm(EMPTY_FORM);
    } catch (error) {
      setFeedback(error.message || 'Hapus order gagal.');
    } finally {
      setBusyAction('');
    }
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="admin-eyebrow">Super Admin</p>
          <h1>Dashboard Order</h1>
          <p className="dashboard-subtitle">
            Login sebagai {adminProfile?.nama || adminProfile?.email}. Data di bawah ini realtime dari
            Firestore collection <strong>orders</strong>.
          </p>
        </div>
        <div className="dashboard-actions">
          <Link to="/" className="dashboard-link-button">
            Lihat halaman publik
          </Link>
          <button type="button" className="dashboard-link-button danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-overview">
        <article className="dashboard-metric">
          <span>Total order</span>
          <strong>{orders.length}</strong>
        </article>
        <article className="dashboard-metric">
          <span>Order baru</span>
          <strong>{orders.filter((order) => order.status === 'baru').length}</strong>
        </article>
        <article className="dashboard-metric">
          <span>Diproses</span>
          <strong>{orders.filter((order) => order.status === 'diproses').length}</strong>
        </article>
        <article className="dashboard-metric">
          <span>Selesai</span>
          <strong>{orders.filter((order) => order.status === 'selesai').length}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-list">
          <div className="dashboard-list-header">
            <h2>Daftar Order</h2>
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="semua">Semua status</option>
              <option value="pending">Pending</option>
              <option value="baru">Baru</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {loadingOrders ? <p style={{ padding: '0 24px 24px' }}>Memuat order...</p> : null}
          {!loadingOrders && filteredOrders.length === 0 ? (
            <p style={{ padding: '0 24px 24px' }}>Belum ada order dengan filter ini.</p>
          ) : null}

          <div className="dashboard-order-list">
            {filteredOrders.map((order) => (
              <button
                type="button"
                key={order.id}
                className={`dashboard-order-card ${selectedOrderId === order.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setEditForm(buildEditForm(order));
                }}
              >
                <div className="dashboard-order-top">
                  <strong>#{order.orderNumber || '-'}</strong>
                  <span className={`status-badge status-${order.status || 'baru'}`}>
                    {order.status || 'baru'}
                  </span>
                </div>
                <h3>{order.nama || 'Tanpa nama'}</h3>
                <p>{order.wa || '-'}</p>
                <p>{order.metode === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                <p>Rp {formatCurrency(order.total)}</p>
                <small>{formatDate(order.createdAt)}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-editor">
          <div className="dashboard-editor-header">
            <h2>Edit Order</h2>
            {selectedOrder ? <span>ID: {selectedOrder.id}</span> : null}
          </div>

          {!selectedOrder ? (
            <p style={{ padding: '0 24px' }}>Pilih order dari daftar kiri untuk melihat dan mengubah data.</p>
          ) : (
            <>
              <div className="dashboard-items-box">
                <h3>Item Pesanan</h3>
                {selectedOrder.itemDetails?.length ? (
                  <ul>
                    {selectedOrder.itemDetails.map((item) => (
                      <li key={`${selectedOrder.id}-${item.id}`}>
                        {item.name} x{item.qty} - Rp {formatCurrency(item.subtotal)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Item detail belum tersedia pada order lama.</p>
                )}
              </div>

              <form className="dashboard-form" onSubmit={handleUpdateOrder}>
                <label>
                  Nama
                  <input
                    type="text"
                    value={editForm.nama}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, nama: event.target.value }))
                    }
                  />
                </label>
                <label>
                  WhatsApp
                  <input
                    type="text"
                    value={editForm.wa}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, wa: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Metode
                  <select
                    value={editForm.metode}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, metode: event.target.value }))
                    }
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </label>
                <label>
                  Tanggal
                  <input
                    type="date"
                    value={editForm.tanggal}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, tanggal: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Waktu
                  <input
                    type="text"
                    value={editForm.waktu}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, waktu: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Pembayaran
                  <input
                    type="text"
                    value={editForm.bayar}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, bayar: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Status
                  <select
                    value={editForm.status}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="baru">Baru</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </label>
                <label>
                  Total
                  <input
                    type="number"
                    min="0"
                    value={editForm.total}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, total: event.target.value }))
                    }
                  />
                </label>
                <label className="dashboard-form-span">
                  Alamat
                  <textarea
                    value={editForm.alamat}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, alamat: event.target.value }))
                    }
                  />
                </label>
                <label className="dashboard-form-span">
                  Catatan
                  <textarea
                    value={editForm.catatan}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, catatan: event.target.value }))
                    }
                  />
                </label>

                {feedback ? <p className="dashboard-feedback">{feedback}</p> : null}

                <div className="dashboard-form-actions">
                  <button type="submit" className="admin-primary-button" disabled={busyAction !== ''}>
                    {busyAction === 'update' ? 'Menyimpan...' : 'Update Order'}
                  </button>
                  <button
                    type="button"
                    className="dashboard-link-button danger"
                    onClick={handleDeleteOrder}
                    disabled={busyAction !== ''}
                  >
                    {busyAction === 'delete' ? 'Menghapus...' : 'Hapus Order'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
