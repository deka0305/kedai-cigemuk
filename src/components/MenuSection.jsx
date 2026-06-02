import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { subscribeOrders } from '../services/orderService';

function QtyControl({ id }) {
  const { cart, addToCart, removeFromCart } = useCart();
  const qty = cart[id] || 0;

  return qty === 0 ? (
    <button
      type="button"
      onClick={() => addToCart(id)}
      style={{ background: '#3E1A06', color: '#F5EDD6', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      +
    </button>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={() => removeFromCart(id)}
        style={{ background: '#E8D5B0', border: 'none', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontWeight: 700 }}
      >
        -
      </button>
      <span style={{ fontWeight: 700, color: '#3E1A06', minWidth: 18, textAlign: 'center' }}>{qty}</span>
      <button
        type="button"
        onClick={() => addToCart(id)}
        style={{ background: '#E8D5B0', border: 'none', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontWeight: 700 }}
      >
        +
      </button>
    </div>
  );
}

function MenuSection() {
  const { menuItems } = useMenu();
  const [orders, setOrders] = useState([]);
  const specialMenus = menuItems.filter((item) => item.isSpecial);
  const regularMenus = menuItems.filter((item) => !item.isSpecial);

  useEffect(() => {
    const unsubscribe = subscribeOrders(setOrders, () => {});
    return unsubscribe;
  }, []);

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

  function renderVisual(item, size = '2.5rem') {
    if (item.photoUrl) {
      return (
        <img
          src={item.photoUrl}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }

    return <span style={{ fontSize: size }}>{item.emoji}</span>;
  }

  return (
    <section id="menu" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem' }}>
      <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#C4703F', fontWeight: 600, marginBottom: 6 }}>✦ Daftar Menu</p>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: '#3E1A06', marginBottom: 8 }}>Varian <em style={{ color: '#C4703F' }}>Rasa</em> Kami</h2>
      <div style={{ width: 60, height: 3, background: '#D4943A', borderRadius: 4, marginBottom: '2rem' }} />

      {specialMenus.length ? (
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          {specialMenus.map((item) => (
            <div key={item.id} style={{ background: 'linear-gradient(135deg,#5C2E0E,#A0522D)', borderRadius: 20, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: 112, height: 112, borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {renderVisual(item, '3rem')}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: '#D4943A', color: '#3E1A06', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, fontWeight: 700 }}>⭐ Menu Andalan</span>
                  {salesByMenuId[item.id] ? (
                    <span style={{ background: 'rgba(255,255,255,0.15)', color: '#F5EDD6', fontSize: 10, padding: '3px 10px', borderRadius: 100 }}>🔥 {salesByMenuId[item.id]}x terjual</span>
                  ) : null}
                </div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.1rem,3vw,1.5rem)', color: '#F5EDD6', margin: '0.5rem 0 0.3rem' }}>{item.name}</h3>
                <p style={{ fontSize: '0.82rem', color: '#E8D5B0', fontStyle: 'italic', marginBottom: '0.8rem' }}>{item.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 900, color: '#D4943A' }}>
                    Rp {item.price.toLocaleString('id-ID')} <small style={{ fontSize: '0.75rem', color: '#E8D5B0', fontWeight: 400 }}>/ porsi </small>
                  </span>
                  <QtyControl id={item.id} />
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#E8D5B0', fontStyle: 'italic' }}>Untuk pesanan mentah atau mix rasa menu ini, cukup tulis di kolom catatan saat checkout.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {regularMenus.length ? (
        <>
          <p style={{ fontSize: '0.82rem', color: '#9C7A5A', fontStyle: 'italic', marginBottom: '1rem' }}>Atau pilih cireng satuan - Rp 3.000/pcs</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.8rem' }}>
            {regularMenus.map((item) => (
              <div key={item.id} style={{ background: '#FFF9F0', borderRadius: 14, border: '1px solid #E8D5B0', overflow: 'hidden' }}>
                <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0E2C0' }}>
                  {renderVisual(item)}
                </div>
                <div style={{ padding: '0.8rem 1rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, marginBottom: '0.2rem' }}>
                    <div style={{ fontFamily: 'Georgia,serif', fontSize: '0.9rem', fontWeight: 700, color: '#3E1A06', lineHeight: 1.3 }}>{item.name}</div>
                    {salesByMenuId[item.id] ? (
                      <span style={{ fontSize: '0.65rem', color: '#C4703F', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>🔥 {salesByMenuId[item.id]}x</span>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Georgia,serif', fontSize: '1rem', fontWeight: 700, color: '#C4703F' }}>Rp {item.price.toLocaleString('id-ID')}</span>
                    <QtyControl id={item.id} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9C7A5A', fontStyle: 'italic', marginBottom: '0.3rem', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default MenuSection;
