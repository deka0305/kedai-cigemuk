function Hero() {
  function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
  return (
    <section style={{ minHeight:'92vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'3rem 1.5rem',background:'#F5EDD6' }}>
      <span style={{ display:'inline-block',background:'#C4703F',color:'#F5EDD6',fontSize:10,letterSpacing:2,textTransform:'uppercase',padding:'5px 16px',borderRadius:100,marginBottom:'1.2rem',fontStyle:'italic',fontWeight:600 }}>✦ Kota Tangerang ✦ Panunggangan Utara ✦</span>
      <h1 style={{ fontFamily:'Georgia,serif',fontSize:'clamp(3rem,12vw,8rem)',fontWeight:900,lineHeight:0.88,color:'#3E1A06',marginBottom:'0.2em' }}>
        Kedai<br/><span style={{ color:'#C4703F',fontStyle:'italic' }}>Cigemuk</span>
      </h1>
      <p style={{ fontSize:'clamp(0.88rem,3vw,1.15rem)',color:'#6B3A1F',maxWidth:480,lineHeight:1.75,margin:'1rem auto 2rem',fontStyle:'italic',padding:'0 0.5rem' }}>
        Cireng isi kuah creamy yang bikin nagih! Kenyal sempurna, kuah gurih & creamy, chilli oil yang menggoyang lidah.
      </p>
      <div style={{ display:'flex',gap:'1.5rem',justifyContent:'center',marginBottom:'2rem',flexWrap:'wrap' }}>
        {[['7+','Varian Isi'],['Rp 3K','Mulai dari'],['15.00','Buka Setiap Hari']].map(([val,label]) => (
          <div key={label} style={{ textAlign:'center' }}>
            <strong style={{ display:'block',fontFamily:'Georgia,serif',fontSize:'clamp(1.2rem,4vw,1.6rem)',fontWeight:900,color:'#C4703F' }}>{val}</strong>
            <span style={{ fontSize:'0.7rem',color:'#9C7A5A',letterSpacing:1.5,textTransform:'uppercase' }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex',gap:'0.8rem',justifyContent:'center',flexWrap:'wrap',padding:'0 1rem' }}>
        <button onClick={() => scrollTo('menu')} style={{ background:'#C4703F',color:'#F5EDD6',border:'none',padding:'12px 24px',fontFamily:'Georgia,serif',fontSize:'0.95rem',fontWeight:600,borderRadius:100,cursor:'pointer' }}>Lihat Menu</button>
        <button onClick={() => scrollTo('order')} style={{ background:'transparent',color:'#C4703F',border:'2px solid #C4703F',padding:'10px 24px',fontFamily:'Georgia,serif',fontSize:'0.95rem',borderRadius:100,cursor:'pointer' }}>Pesan Sekarang</button>
      </div>
    </section>
  );
}
export default Hero;