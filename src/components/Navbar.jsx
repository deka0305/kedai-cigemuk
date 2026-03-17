import { useCart } from '../context/CartContext';
import { useState } from 'react';

function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); }

  return (
    <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(245,237,214,0.97)',backdropFilter:'blur(10px)',borderBottom:'1.5px solid #E8D5B0',padding:'0.9rem 1.5rem' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ width:36,height:36,background:'#C4703F',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0 }}>🥟</div>
          <div>
            <div style={{ fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:900,color:'#3E1A06' }}>Kedai <span style={{ color:'#C4703F',fontStyle:'italic' }}>Cigemuk</span></div>
            <div style={{ fontSize:'0.6rem',color:'#9C7A5A',letterSpacing:1,textTransform:'uppercase' }}>Cireng Isi Kuah Creamy</div>
          </div>
        </div>

        {/* Desktop menu */}
        <div className="nav-desktop" style={{ display:'flex',gap:'1.8rem' }}>
          {['menu','tentang','order'].map(id => (
            <span key={id} onClick={() => scrollTo(id)} style={{ cursor:'pointer',color:'#6B3A1F',fontSize:'0.88rem',fontWeight:600,textTransform:'capitalize' }}>{id}</span>
          ))}
        </div>

        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <button onClick={() => scrollTo('order')} style={{ background:'#3E1A06',color:'#F5EDD6',border:'none',padding:'7px 14px',borderRadius:100,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:'0.82rem',fontWeight:600,display:'flex',alignItems:'center',gap:6 }}>
            🛒 <span className="cart-text">Keranjang</span>
            <span style={{ background:'#C4703F',color:'white',borderRadius:'50%',width:18,height:18,fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700 }}>{totalItems}</span>
          </button>
          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'1.4rem',color:'#3E1A06',display:'none' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ paddingTop:'1rem',display:'flex',flexDirection:'column',gap:'0.8rem',borderTop:'1px solid #E8D5B0',marginTop:'0.9rem' }}>
          {['menu','tentang','order'].map(id => (
            <span key={id} onClick={() => scrollTo(id)} style={{ cursor:'pointer',color:'#6B3A1F',fontSize:'1rem',fontWeight:600,textTransform:'capitalize',padding:'0.4rem 0' }}>{id}</span>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .hamburger { display: block !important; }
          .cart-text { display: none; }
        }
      `}</style>
    </nav>
  );
}
export default Navbar;