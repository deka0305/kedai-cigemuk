import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuItems as fallbackMenuItems } from '../data/menu';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useMenu } from '../context/MenuContext';
import {
  deleteMenuById,
  exportMenusToExcel,
  getDefaultMenuEmoji,
  seedMenus,
  updateMenuById,
  createMenu
} from '../services/menuService';
import {
  deleteOrderById,
  exportOrdersToExcel,
  subscribeOrders,
  updateOrderById
} from '../services/orderService';
import { subscribeVisitors } from '../services/visitorService';

const EMPTY_ORDER_FORM = {
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

const EMPTY_MENU_FORM = {
  name: '',
  desc: '',
  price: 0,
  emoji: getDefaultMenuEmoji(),
  photoUrl: '',
  isSpecial: false,
  isActive: true,
  sortOrder: 0
};

function MenuVisual({ menu, fallbackEmoji }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (menu.photoUrl && !imageFailed) {
    return (
      <img
        src={menu.photoUrl}
        alt={menu.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <span>{menu.emoji || fallbackEmoji}</span>;
}

function getOrderStatus(order) {
  return order.status || 'pending';
}

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

function toDateInputValue(value) {
  return value.toISOString().slice(0, 10);
}

function getOrderFilterDate(order) {
  if (order.tanggal) {
    return order.tanggal;
  }

  if (typeof order.createdAt?.toDate === 'function') {
    return toDateInputValue(order.createdAt.toDate());
  }

  return '';
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
    status: getOrderStatus(order)
  };
}

function buildMenuForm(menu) {
  return {
    name: menu.name || '',
    desc: menu.desc || '',
    price: menu.price || 0,
    emoji: menu.emoji || getDefaultMenuEmoji(),
    photoUrl: menu.photoUrl || '',
    isSpecial: Boolean(menu.isSpecial),
    isActive: menu.isActive !== false,
    sortOrder: Number(menu.sortOrder || 0)
  };
}

function AdminDashboard() {
  const { adminProfile, logoutAdmin } = useAdminAuth();
  const { menuItems, rawMenus, hasRemoteMenus } = useMenu();
  const [activeSection, setActiveSection] = useState('orders');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_ORDER_FORM);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [orderFeedback, setOrderFeedback] = useState('');
  const [orderBusyAction, setOrderBusyAction] = useState('');

  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [menuForm, setMenuForm] = useState(EMPTY_MENU_FORM);
  const [menuFeedback, setMenuFeedback] = useState('');
  const [menuBusyAction, setMenuBusyAction] = useState('');
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeOrders((incomingOrders) => {
      setOrders(incomingOrders);
      setLoadingOrders(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeVisitors((data) => setVisitors(data));
    return unsubscribe;
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus = filterStatus === 'semua' || getOrderStatus(order) === filterStatus;

      if (!matchStatus) {
        return false;
      }

      const orderDate = getOrderFilterDate(order);

      if (filterDateFrom && (!orderDate || orderDate < filterDateFrom)) {
        return false;
      }

      if (filterDateTo && (!orderDate || orderDate > filterDateTo)) {
        return false;
      }

      return true;
    });
  }, [filterDateFrom, filterDateTo, filterStatus, orders]);

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

  const salesByMenuId = useMemo(() => {
    const counts = {};
    for (const order of orders) {
      if (!Array.isArray(order.itemDetails)) continue;
      for (const item of order.itemDetails) {
        if (!item.id) continue;
        counts[item.id] = (counts[item.id] || 0) + (Number(item.qty) || 0);
      }
    }
    return counts;
  }, [orders]);

  const analyticsData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    function getOrderTimestamp(order) {
      if (typeof order.createdAt?.toDate === 'function') return order.createdAt.toDate();
      if (order.tanggal) return new Date(order.tanggal);
      return null;
    }

    function inPeriod(order) {
      if (analyticsPeriod === 'all') return true;
      const d = getOrderTimestamp(order);
      if (!d) return false;
      return todayStart - d < Number(analyticsPeriod) * 24 * 60 * 60 * 1000;
    }

    const periodOrders = orders.filter(inPeriod);

    const omzetSelesai = periodOrders
      .filter((o) => getOrderStatus(o) === 'selesai')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const omzetSemua = periodOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const avgOrder = periodOrders.length ? Math.round(omzetSemua / periodOrders.length) : 0;

    const statusBreakdown = {};
    for (const o of periodOrders) {
      const s = getOrderStatus(o);
      statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
    }

    const bayarBreakdown = {};
    for (const o of periodOrders) {
      const raw = o.bayar || 'Lainnya';
      const label = raw.includes('COD') ? 'COD' : raw;
      bayarBreakdown[label] = (bayarBreakdown[label] || 0) + 1;
    }

    const metodeBreakdown = { Pickup: 0, Delivery: 0 };
    for (const o of periodOrders) {
      if (o.metode === 'delivery') metodeBreakdown['Delivery']++;
      else metodeBreakdown['Pickup']++;
    }

    const menuQty = {};
    const menuNames = {};
    for (const o of periodOrders) {
      if (!Array.isArray(o.itemDetails)) continue;
      for (const item of o.itemDetails) {
        if (!item.id) continue;
        menuQty[item.id] = (menuQty[item.id] || 0) + (Number(item.qty) || 0);
        menuNames[item.id] = item.name || item.id;
      }
    }
    const topMenus = Object.entries(menuQty)
      .map(([id, qty]) => ({ id, name: menuNames[id], qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
    const maxMenuQty = topMenus[0]?.qty || 1;

    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      dailyData.push({ key, label, count: 0 });
    }
    for (const o of orders) {
      const d = getOrderTimestamp(o);
      if (!d) continue;
      const key = d.toISOString().slice(0, 10);
      const entry = dailyData.find((e) => e.key === key);
      if (entry) entry.count++;
    }
    const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);

    return {
      periodOrders,
      omzetSelesai,
      avgOrder,
      statusBreakdown,
      bayarBreakdown,
      metodeBreakdown,
      topMenus,
      maxMenuQty,
      dailyData,
      maxDaily,
    };
  }, [orders, analyticsPeriod]);

  const visitorData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    function getVisitorTime(v) {
      if (typeof v.timestamp?.toDate === 'function') return v.timestamp.toDate();
      return null;
    }

    const totalVisits = visitors.length;
    const uniqueVisitors = visitors.filter((v) => v.isUnique).length;

    const todayVisits = visitors.filter((v) => {
      const d = getVisitorTime(v);
      return d && d >= todayStart;
    }).length;

    const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
    for (const v of visitors) {
      const dev = v.device || 'desktop';
      deviceBreakdown[dev] = (deviceBreakdown[dev] || 0) + 1;
    }

    const dailyVisits = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      dailyVisits.push({ key, label, count: 0 });
    }
    for (const v of visitors) {
      const d = getVisitorTime(v);
      if (!d) continue;
      const key = d.toISOString().slice(0, 10);
      const entry = dailyVisits.find((e) => e.key === key);
      if (entry) entry.count++;
    }
    const maxDailyVisit = Math.max(...dailyVisits.map((d) => d.count), 1);

    return { totalVisits, uniqueVisitors, todayVisits, deviceBreakdown, dailyVisits, maxDailyVisit };
  }, [visitors]);

  const managedMenus = useMemo(() => (hasRemoteMenus ? rawMenus : []), [hasRemoteMenus, rawMenus]);
  const selectedMenu = useMemo(
    () => managedMenus.find((menu) => menu.id === selectedMenuId) || null,
    [managedMenus, selectedMenuId]
  );

  useEffect(() => {
    if (selectedMenu) {
      setMenuForm(buildMenuForm(selectedMenu));
      setIsCreatingMenu(false);
      return;
    }

    if (managedMenus[0] && !selectedMenuId && !isCreatingMenu) {
      setSelectedMenuId(managedMenus[0].id);
      setMenuForm(buildMenuForm(managedMenus[0]));
    }
  }, [isCreatingMenu, managedMenus, selectedMenu, selectedMenuId]);

  async function handleLogout() {
    await logoutAdmin();
  }

  async function handleUpdateOrder(event) {
    event.preventDefault();

    if (!selectedOrderId) {
      return;
    }

    setOrderBusyAction('update');
    setOrderFeedback('');

    try {
      await updateOrderById(selectedOrderId, {
        ...editForm,
        total: Number(editForm.total || 0)
      });
      setOrderFeedback('Order berhasil diperbarui.');
    } catch (error) {
      setOrderFeedback(error.message || 'Update order gagal.');
    } finally {
      setOrderBusyAction('');
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

    setOrderBusyAction('delete');
    setOrderFeedback('');

    try {
      await deleteOrderById(selectedOrderId);
      setOrderFeedback('Order berhasil dihapus.');
      setSelectedOrderId(null);
      setEditForm(EMPTY_ORDER_FORM);
    } catch (error) {
      setOrderFeedback(error.message || 'Hapus order gagal.');
    } finally {
      setOrderBusyAction('');
    }
  }

  function resetMenuForm() {
    setSelectedMenuId(null);
    setIsCreatingMenu(true);
    setMenuForm({
      ...EMPTY_MENU_FORM,
      sortOrder: (hasRemoteMenus ? rawMenus : menuItems).length
    });
  }

  function updateMenuFormField(key, value) {
    setMenuForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSaveMenu(event) {
    event.preventDefault();

    setMenuBusyAction(selectedMenuId ? 'update' : 'create');
    setMenuFeedback('');

    try {
      if (selectedMenuId) {
        await updateMenuById(selectedMenuId, menuForm);
        setMenuFeedback('Menu berhasil diperbarui.');
      } else {
        await createMenu(menuForm);
        resetMenuForm();
        setMenuFeedback('Menu baru berhasil ditambahkan.');
      }
    } catch (error) {
      setMenuFeedback(error.message || 'Simpan menu gagal.');
    } finally {
      setMenuBusyAction('');
    }
  }

  async function handleDeleteMenu() {
    if (!selectedMenuId) {
      return;
    }

    const confirmed = window.confirm('Hapus menu ini dari Firebase?');

    if (!confirmed) {
      return;
    }

    setMenuBusyAction('delete');
    setMenuFeedback('');

    try {
      await deleteMenuById(selectedMenuId);
      setSelectedMenuId(null);
      setIsCreatingMenu(true);
      setMenuFeedback('Menu berhasil dihapus.');
      resetMenuForm();
    } catch (error) {
      setMenuFeedback(error.message || 'Hapus menu gagal.');
    } finally {
      setMenuBusyAction('');
    }
  }

  async function handleSeedMenus() {
    setMenuBusyAction('seed');
    setMenuFeedback('');

    try {
      await seedMenus(fallbackMenuItems);
      setMenuFeedback('Menu bawaan berhasil dimasukkan ke Firestore.');
    } catch (error) {
      setMenuFeedback(error.message || 'Import menu bawaan gagal.');
    } finally {
      setMenuBusyAction('');
    }
  }

  function handleSelectMenuCard(menu) {
    if (hasRemoteMenus) {
      setIsCreatingMenu(false);
      setSelectedMenuId(menu.id);
      setMenuForm(buildMenuForm(menu));
      setMenuFeedback('');
      return;
    }

    setSelectedMenuId(null);
    setIsCreatingMenu(true);
    setMenuForm({
      ...buildMenuForm(menu),
      sortOrder: menu.sortOrder ?? menuItems.length
    });
    setMenuFeedback('Template menu dimuat. Klik Tambah Menu untuk menyimpan ke Firestore.');
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="admin-eyebrow">Super Admin</p>
          <h1>Dashboard Kedai</h1>
          <p className="dashboard-subtitle">
            Login sebagai {adminProfile?.nama || adminProfile?.email}. Data order realtime berasal dari
            Firestore collection <strong>orders</strong>, dan menu editable memakai collection <strong>menu</strong>.
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
          <strong>{orders.filter((order) => getOrderStatus(order) === 'baru').length}</strong>
        </article>
        <article className="dashboard-metric">
          <span>Diproses</span>
          <strong>{orders.filter((order) => getOrderStatus(order) === 'diproses').length}</strong>
        </article>
        <article className="dashboard-metric">
          <span>Selesai</span>
          <strong>{orders.filter((order) => getOrderStatus(order) === 'selesai').length}</strong>
        </article>
        <article className="dashboard-metric">
          <span>Dibatalkan</span>
          <strong>{orders.filter((order) => getOrderStatus(order) === 'dibatalkan').length}</strong>
        </article>
        <article className="dashboard-metric">
          <span>Total menu aktif</span>
          <strong>{menuItems.length}</strong>
        </article>
      </section>

      <section className="dashboard-section-switcher">
        <button
          type="button"
          className={`dashboard-section-tab ${activeSection === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSection('orders')}
        >
          Orderan
        </button>
        <button
          type="button"
          className={`dashboard-section-tab ${activeSection === 'menus' ? 'active' : ''}`}
          onClick={() => setActiveSection('menus')}
        >
          Menu
        </button>
        <button
          type="button"
          className={`dashboard-section-tab ${activeSection === 'analitik' ? 'active' : ''}`}
          onClick={() => setActiveSection('analitik')}
        >
          Analitik
        </button>
      </section>

      {activeSection === 'orders' ? (
        <section className="dashboard-content-section">
          <div className="dashboard-section-heading">
            <div>
              <p className="admin-eyebrow dashboard-section-eyebrow">Kelola Orderan</p>
              <h2>Daftar dan detail pesanan pelanggan</h2>
            </div>
            <p className="dashboard-helper-text">
              Fokuskan halaman ini untuk memeriksa order masuk, filter status, dan update detail pesanan tanpa bercampur dengan manajemen menu.
            </p>
          </div>

          <section className="dashboard-grid">
            <div className="dashboard-list">
              <div className="dashboard-list-header">
                <h2>Daftar Order</h2>
                <div className="menu-inline-actions">
                  <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                    <option value="semua">Semua status</option>
                    <option value="pending">Pending</option>
                    <option value="baru">Baru</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                  <button
                    type="button"
                    className="dashboard-link-button"
                    onClick={() => exportOrdersToExcel(filteredOrders)}
                    disabled={!filteredOrders.length}
                  >
                    Export Order Excel
                  </button>
                </div>
              </div>

              <div className="dashboard-filter-row">
                <label>
                  Dari Tanggal
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(event) => setFilterDateFrom(event.target.value)}
                  />
                </label>
                <label>
                  Sampai Tanggal
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(event) => setFilterDateTo(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="dashboard-link-button"
                  onClick={() => {
                    setFilterStatus('semua');
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                >
                  Reset Filter
                </button>
              </div>

              {loadingOrders ? <p style={{ padding: '0 24px 24px' }}>Memuat order...</p> : null}
              {!loadingOrders && filteredOrders.length === 0 ? (
                <p style={{ padding: '0 24px 24px' }}>Belum ada order dengan filter ini.</p>
              ) : null}

              <div className="dashboard-order-list">
                {filteredOrders.map((order) => {
                  const orderStatus = getOrderStatus(order);

                  return (
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
                        <span className={`status-badge status-${orderStatus}`}>
                          {orderStatus}
                        </span>
                      </div>
                      <h3>{order.nama || 'Tanpa nama'}</h3>
                      <p>{order.wa || '-'}</p>
                      <p>{order.metode === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                      <p>Rp {formatCurrency(order.total)}</p>
                      <small>{formatDate(order.createdAt)}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-editor">
              <div className="dashboard-editor-header">
                <h2>Edit Order</h2>
                {selectedOrder ? (
                  <span>
                    No. Urut: #{selectedOrder.orderNumber || '-'} · ID: {selectedOrder.id}
                  </span>
                ) : null}
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
                        <option value="pending">Pending</option>
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

                    {orderFeedback ? <p className="dashboard-feedback">{orderFeedback}</p> : null}

                    <div className="dashboard-form-actions">
                      <button type="submit" className="admin-primary-button" disabled={orderBusyAction !== ''}>
                        {orderBusyAction === 'update' ? 'Menyimpan...' : 'Update Order'}
                      </button>
                      <button
                        type="button"
                        className="dashboard-link-button danger"
                        onClick={handleDeleteOrder}
                        disabled={orderBusyAction !== ''}
                      >
                        {orderBusyAction === 'delete' ? 'Menghapus...' : 'Hapus Order'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </section>
        </section>
      ) : null}

      {activeSection === 'menus' ? (
        <section className="dashboard-content-section">
          <div className="dashboard-section-heading">
            <div>
              <p className="admin-eyebrow dashboard-section-eyebrow">Kelola Menu</p>
              <h2>Tambah, ubah, dan rapikan katalog menu</h2>
            </div>
            <p className="dashboard-helper-text">
              Tambah, ubah, dan hapus menu tanpa hardcode. Isi `Foto URL` jika memakai gambar, atau kosongkan supaya tampilan publik otomatis memakai emoji.
            </p>
          </div>

          <section className="dashboard-section-card">
            <div className="dashboard-list-header">
              <div>
                <h2>Manajemen Menu</h2>
                <p className="dashboard-helper-text">
                  Atur daftar menu secara terpisah dari orderan supaya proses edit katalog lebih fokus.
                </p>
              </div>
              <div className="menu-inline-actions">
                {!hasRemoteMenus ? (
                  <button
                    type="button"
                    className="dashboard-link-button"
                    onClick={handleSeedMenus}
                    disabled={menuBusyAction !== ''}
                  >
                    {menuBusyAction === 'seed' ? 'Mengimpor...' : 'Import Menu Bawaan'}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="dashboard-link-button"
                  onClick={() => exportMenusToExcel(hasRemoteMenus ? rawMenus : menuItems)}
                >
                  Export Excel
                </button>
                <button type="button" className="dashboard-link-button" onClick={resetMenuForm}>
                  Menu Baru
                </button>
              </div>
            </div>

            {!hasRemoteMenus ? (
              <p className="dashboard-helper-text dashboard-section-padding">
                Collection `menu` belum berisi data yang valid. Saat ini halaman publik masih memakai menu bawaan dari source code sebagai fallback. Anda bisa klik kartu menu di kiri untuk menjadikannya template, lalu klik `Tambah Menu`, atau gunakan `Import Menu Bawaan` untuk memindahkan semua data awal ke Firestore.
              </p>
            ) : null}

            <div className="menu-management-grid">
              <div className="menu-card-list">
                {(hasRemoteMenus ? rawMenus : menuItems).map((menu) => (
                  <button
                    type="button"
                    key={menu.id}
                    className={`menu-card ${selectedMenuId === menu.id ? 'active' : ''}`}
                    onClick={() => handleSelectMenuCard(menu)}
                  >
                    <div className="menu-thumb">
                      <MenuVisual menu={menu} fallbackEmoji={getDefaultMenuEmoji()} />
                    </div>
                    <div className="menu-card-content">
                      <div className="dashboard-order-top">
                        <strong>{menu.name}</strong>
                        {menu.isSpecial ? <span className="status-badge status-baru">Unggulan</span> : null}
                      </div>
                      <p>Rp {formatCurrency(menu.price)}</p>
                      <small>Terjual: {salesByMenuId[menu.id] || 0}x</small>
                    </div>
                  </button>
                ))}
              </div>

              <div className="dashboard-editor menu-editor">
                <div className="dashboard-editor-header">
                  <h2>{selectedMenuId && !isCreatingMenu ? 'Edit Menu' : 'Tambah Menu'}</h2>
                  {selectedMenuId && !isCreatingMenu ? <span>ID: {selectedMenuId}</span> : null}
                </div>

                <form className="dashboard-form menu-form-grid" onSubmit={handleSaveMenu}>
                  <label>
                    Nama Menu
                    <input
                      type="text"
                      value={menuForm.name}
                      onChange={(event) => updateMenuFormField('name', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Harga
                    <input
                      type="number"
                      min="0"
                      value={menuForm.price}
                      onChange={(event) => updateMenuFormField('price', Number(event.target.value))}
                      required
                    />
                  </label>
                  <label>
                    Emoji
                    <input
                      type="text"
                      value={menuForm.emoji}
                      onChange={(event) => updateMenuFormField('emoji', event.target.value)}
                      placeholder="🍽️"
                    />
                  </label>
                  <label>
                    Urutan Tampil
                    <input
                      type="number"
                      value={menuForm.sortOrder}
                      onChange={(event) => updateMenuFormField('sortOrder', Number(event.target.value))}
                    />
                  </label>
                  <label className="dashboard-form-span">
                    Foto URL
                    <input
                      type="url"
                      value={menuForm.photoUrl}
                      onChange={(event) => updateMenuFormField('photoUrl', event.target.value)}
                      placeholder="https://..."
                    />
                    <small>
                      Harus berupa link gambar langsung, misalnya `.jpg`, `.png`, atau URL file dari Firebase
                      Storage. Link halaman web biasa tidak bisa dipakai di `img src`.
                    </small>
                  </label>
                  <label className="dashboard-form-span">
                    Deskripsi
                    <textarea
                      value={menuForm.desc}
                      onChange={(event) => updateMenuFormField('desc', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Menu Unggulan</span>
                    <select
                      value={menuForm.isSpecial ? 'ya' : 'tidak'}
                      onChange={(event) => updateMenuFormField('isSpecial', event.target.value === 'ya')}
                    >
                      <option value="tidak">Tidak</option>
                      <option value="ya">Ya</option>
                    </select>
                  </label>
                  <label>
                    Status Menu
                    <select
                      value={menuForm.isActive ? 'aktif' : 'nonaktif'}
                      onChange={(event) => updateMenuFormField('isActive', event.target.value === 'aktif')}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </label>

                  {menuFeedback ? <p className="dashboard-feedback">{menuFeedback}</p> : null}

                  <div className="dashboard-form-actions">
                    <button type="submit" className="admin-primary-button" disabled={menuBusyAction !== ''}>
                      {menuBusyAction === 'create'
                        ? 'Menambahkan...'
                        : menuBusyAction === 'update'
                          ? 'Menyimpan...'
                          : selectedMenuId && !isCreatingMenu
                            ? 'Update Menu'
                            : 'Tambah Menu'}
                    </button>
                    <button type="button" className="dashboard-link-button" onClick={resetMenuForm}>
                      Reset Form
                    </button>
                    <button
                      type="button"
                      className="dashboard-link-button danger"
                      onClick={handleDeleteMenu}
                      disabled={!selectedMenuId || isCreatingMenu || menuBusyAction !== ''}
                    >
                      {menuBusyAction === 'delete' ? 'Menghapus...' : 'Hapus Menu'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </section>
      ) : null}

      {activeSection === 'analitik' ? (
        <section className="dashboard-content-section">
          <div className="dashboard-section-heading">
            <div>
              <p className="admin-eyebrow dashboard-section-eyebrow">Analitik</p>
              <h2>Ringkasan performa penjualan</h2>
            </div>
            <div className="menu-inline-actions" style={{ alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '0.9rem', color: '#522817' }}>
                Periode
                <select
                  value={analyticsPeriod}
                  onChange={(e) => setAnalyticsPeriod(e.target.value)}
                  style={{ borderRadius: 14, border: '1px solid #dfc9b5', padding: '10px 14px', fontSize: '0.95rem', background: '#fffdf9', color: '#2E1004' }}
                >
                  <option value="1">Hari ini</option>
                  <option value="7">7 hari terakhir</option>
                  <option value="30">30 hari terakhir</option>
                  <option value="all">Semua waktu</option>
                </select>
              </label>
            </div>
          </div>

          <div className="analytics-metric-row">
            <div className="analytics-metric-card">
              <span>Total Pesanan</span>
              <strong>{analyticsData.periodOrders.length}</strong>
              <small>dalam periode ini</small>
            </div>
            <div className="analytics-metric-card highlight">
              <span>Omzet (Selesai)</span>
              <strong>Rp {formatCurrency(analyticsData.omzetSelesai)}</strong>
              <small>dari pesanan berstatus selesai</small>
            </div>
            <div className="analytics-metric-card">
              <span>Rata-rata Nilai Order</span>
              <strong>Rp {formatCurrency(analyticsData.avgOrder)}</strong>
              <small>rata-rata per pesanan</small>
            </div>
          </div>

          <div className="analytics-charts-row">
            <div className="analytics-card">
              <h3>Pesanan 7 Hari Terakhir</h3>
              <div className="analytics-bar-chart">
                {analyticsData.dailyData.map((day) => (
                  <div key={day.key} className="analytics-bar-item">
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{ height: `${(day.count / analyticsData.maxDaily) * 100}%` }}
                      />
                    </div>
                    <span className="analytics-bar-value">{day.count}</span>
                    <span className="analytics-bar-label">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h3>Menu Terlaris</h3>
              {analyticsData.topMenus.length === 0 ? (
                <p style={{ color: '#8b5b40', marginTop: 12 }}>Belum ada data penjualan pada periode ini.</p>
              ) : (
                <div className="analytics-ranking">
                  {analyticsData.topMenus.map((menu, i) => (
                    <div key={menu.id} className="analytics-rank-item">
                      <span className="analytics-rank-num">{i + 1}</span>
                      <div className="analytics-rank-bar-wrap">
                        <div className="analytics-rank-label-row">
                          <span>{menu.name}</span>
                          <span className="analytics-rank-qty">{menu.qty}x</span>
                        </div>
                        <div className="analytics-rank-track">
                          <div
                            className="analytics-rank-fill"
                            style={{ width: `${(menu.qty / analyticsData.maxMenuQty) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section-heading" style={{ marginTop: 32 }}>
            <div>
              <p className="admin-eyebrow dashboard-section-eyebrow">Pengunjung</p>
              <h2>Statistik kunjungan halaman</h2>
            </div>
          </div>

          <div className="analytics-metric-row">
            <div className="analytics-metric-card">
              <span>Total Kunjungan</span>
              <strong>{visitorData.totalVisits}</strong>
              <small>semua waktu (maks 1000 terbaru)</small>
            </div>
            <div className="analytics-metric-card highlight">
              <span>Pengunjung Unik</span>
              <strong>{visitorData.uniqueVisitors}</strong>
              <small>perangkat baru yang belum pernah berkunjung</small>
            </div>
            <div className="analytics-metric-card">
              <span>Kunjungan Hari Ini</span>
              <strong>{visitorData.todayVisits}</strong>
              <small>sejak tengah malam</small>
            </div>
          </div>

          <div className="analytics-charts-row">
            <div className="analytics-card">
              <h3>Kunjungan 7 Hari Terakhir</h3>
              <div className="analytics-bar-chart">
                {visitorData.dailyVisits.map((day) => (
                  <div key={day.key} className="analytics-bar-item">
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{ height: `${(day.count / visitorData.maxDailyVisit) * 100}%` }}
                      />
                    </div>
                    <span className="analytics-bar-value">{day.count}</span>
                    <span className="analytics-bar-label">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h3>Perangkat Pengunjung</h3>
              <div className="analytics-breakdown-list">
                {Object.entries(visitorData.deviceBreakdown).map(([device, count]) => (
                  <div key={device} className="analytics-breakdown-item">
                    <div className="analytics-breakdown-label-row">
                      <span style={{ textTransform: 'capitalize' }}>{device}</span>
                      <span>{count}</span>
                    </div>
                    <div className="analytics-breakdown-track">
                      <div
                        className="analytics-breakdown-fill"
                        style={{
                          width: visitorData.totalVisits
                            ? `${(count / visitorData.totalVisits) * 100}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analytics-breakdown-row">
            <div className="analytics-card">
              <h3>Status Pesanan</h3>
              {Object.keys(analyticsData.statusBreakdown).length === 0 ? (
                <p style={{ color: '#8b5b40', marginTop: 8 }}>Belum ada data.</p>
              ) : (
                <div className="analytics-breakdown-list">
                  {Object.entries(analyticsData.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="analytics-breakdown-item">
                      <div className="analytics-breakdown-label-row">
                        <span className={`status-badge status-${status}`}>{status}</span>
                        <span>{count}</span>
                      </div>
                      <div className="analytics-breakdown-track">
                        <div
                          className="analytics-breakdown-fill"
                          style={{ width: `${(count / analyticsData.periodOrders.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="analytics-card">
              <h3>Metode Pembayaran</h3>
              {Object.keys(analyticsData.bayarBreakdown).length === 0 ? (
                <p style={{ color: '#8b5b40', marginTop: 8 }}>Belum ada data.</p>
              ) : (
                <div className="analytics-breakdown-list">
                  {Object.entries(analyticsData.bayarBreakdown).map(([label, count]) => (
                    <div key={label} className="analytics-breakdown-item">
                      <div className="analytics-breakdown-label-row">
                        <span>{label}</span>
                        <span>{count}</span>
                      </div>
                      <div className="analytics-breakdown-track">
                        <div
                          className="analytics-breakdown-fill"
                          style={{ width: `${(count / analyticsData.periodOrders.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="analytics-card">
              <h3>Pickup vs Delivery</h3>
              <div className="analytics-breakdown-list">
                {Object.entries(analyticsData.metodeBreakdown).map(([label, count]) => (
                  <div key={label} className="analytics-breakdown-item">
                    <div className="analytics-breakdown-label-row">
                      <span>{label}</span>
                      <span>{count}</span>
                    </div>
                    <div className="analytics-breakdown-track">
                      <div
                        className="analytics-breakdown-fill"
                        style={{
                          width: analyticsData.periodOrders.length
                            ? `${(count / analyticsData.periodOrders.length) * 100}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default AdminDashboard;
