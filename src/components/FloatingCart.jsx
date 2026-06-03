import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';

function FloatingCart() {
  const { cart, totalItems } = useCart();
  const { menuById } = useMenu();
  const [pastOrder, setPastOrder] = useState(false);

  useEffect(() => {
    function onScroll() {
      const orderEl = document.getElementById('order');
      if (!orderEl) return;
      setPastOrder(window.scrollY >= orderEl.offsetTop - 80);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (totalItems === 0) return null;

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    return sum + (menuById[id]?.price || 0) * qty;
  }, 0);

  function handleClick() {
    if (pastOrder) {
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: pastOrder
          ? 'linear-gradient(135deg,#5a8a5a,#2e5c2e)'
          : 'linear-gradient(135deg,#c56a34,#8d4521)',
        color: '#fff7ef',
        border: 'none',
        borderRadius: 999,
        padding: '14px 24px',
        fontFamily: 'Georgia,serif',
        fontSize: '0.95rem',
        fontWeight: 700,
        boxShadow: '0 8px 32px rgba(62,26,6,0.35)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        animation: 'floatIn 0.3s ease',
        transition: 'background 0.3s ease',
      }}
    >
      <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
        {totalItems}
      </span>
      {pastOrder ? '← Tambah Menu' : `🛒 Rp ${total.toLocaleString('id-ID')}`}
      {!pastOrder && <span style={{ opacity: 0.85, fontSize: '0.82rem' }}>→ Pesan</span>}
    </button>
  );
}

export default FloatingCart;
