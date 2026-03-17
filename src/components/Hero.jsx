function Hero() {
  function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
  return (
    <section style={{ minHeight:'92vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'3rem 2rem',background:'#F5EDD6' }}>
      <span style={{ display:'inline-block',background:'#C4703F',color:'#F5EDD6',fontSize:11,letterSpacing:3,textTransform:'uppercase',padding:'6px 20px',borderRadius:100,marginBottom:'1.5rem',fontStyle:'italic',fontWeight:600 }}>✦ Kota Tangerang ✦ Panunggangan Utara ✦</span>
      <h1 style={{ fontFamily:'Georgia,serif',fontSize:'clamp(3.8rem,11vw,8rem)',fontWeight:900,lineHeight:0.88,color:'#3E1A06',marginBottom:'0.2em' }}>
        Kedai<br/><span style={{ color:'#C4703F',fontStyle:'italic' }}>Cigemuk</span>
      </h1>
      <p style={{ fontSize:'clamp(0.9rem,2vw,1.15rem)',color:'#6B3A1F',maxWidth:480,lineHeight:1.75,margin:'1.2rem auto 2.5rem',fontStyle:'italic' }}>
        Cireng isi kuah creamy yang bikin nagih! Kenyal sempurna, kuah gurih & creamy, chilli oil yang menggoyang lidah.
      </p>
      <div style={{ display:'flex',gap:'2.5rem',justifyContent:'center',marginBottom:'2.5rem' }}>
        {[['7+','Varian Isi'],['Rp 3K','Mulai dari'],['15.00','Buka Setiap Hari']].map(([val,label]) => (
          <div key={label} style={{ textAlign:'center' }}>
            <strong style={{ display:'block',fontFamily:'Georgia,serif',fontSize:'1.6rem',fontWeight:900,color:'#C4703F' }}>{val}</strong>
            <span style={{ fontSize:'0.75rem',color:'#9C7A5A',letterSpacing:1.5,textTransform:'uppercase' }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap' }}>
        <button onClick={() => scrollTo('menu')} style={{ background:'#C4703F',color:'#F5EDD6',border:'none',padding:'14px 32px',fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:600,borderRadius:100,cursor:'pointer' }}>Lihat Menu Lengkap</button>
        <button onClick={() => scrollTo('order')} style={{ background:'transparent',color:'#C4703F',border:'2px solid #C4703F',padding:'12px 32px',fontFamily:'Georgia,serif',fontSize:'1rem',borderRadius:100,cursor:'pointer' }}>Pesan Sekarang</button>
      </div>
    </section>
  );
}
export default Hero;