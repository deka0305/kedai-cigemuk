import { useCart } from '../context/CartContext';

function Navbar() {
  const { totalItems } = useCart();
  function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }

  return (
    <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(245,237,214,0.97)',backdropFilter:'blur(10px)',borderBottom:'1.5px solid #E8D5B0',padding:'0.9rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
        <div style={{ width:38,height:38,background:'#C4703F',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem' }}>🥟</div>
        <div>
          <div style={{ fontFamily:'Georgia,serif',fontSize:'1.3rem',fontWeight:900,color:'#3E1A06' }}>Kedai <span style={{ color:'#C4703F',fontStyle:'italic' }}>Cigemuk</span></div>
          <div style={{ fontSize:'0.65rem',color:'#9C7A5A',letterSpacing:1,textTransform:'uppercase' }}>Cireng Isi Kuah Creamy</div>
        </div>
      </div>
      <div style={{ display:'flex',gap:'1.8rem' }}>
        {['menu','tentang','order'].map(id => (
          <span key={id} onClick={() => scrollTo(id)} style={{ cursor:'pointer',color:'#6B3A1F',fontSize:'0.88rem',fontWeight:600,textTransform:'capitalize' }}>{id}</span>
        ))}
      </div>
      <button onClick={() => scrollTo('order')} style={{ background:'#3E1A06',color:'#F5EDD6',border:'none',padding:'8px 18px',borderRadius:100,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:'0.88rem',fontWeight:600,display:'flex',alignItems:'center',gap:8 }}>
        🛒 Keranjang
        <span style={{ background:'#C4703F',color:'white',borderRadius:'50%',width:20,height:20,fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700 }}>{totalItems}</span>
      </button>
    </nav>
  );
}
export default Navbar;