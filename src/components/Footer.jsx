function Footer() {
  return (
    <footer style={{ background: '#1E0A02', color: '#E8D5B0' }}>

      {/* MAPS SECTION */}
      <section id="tentang" style={{ background: '#3E1A06', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#D4943A', fontWeight: 600, marginBottom: 6 }}>✦ Lokasi Kami</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#F5EDD6', marginBottom: '0.5rem', fontStyle: 'italic' }}>
            Temukan <em style={{ color: '#D4943A' }}>Kedai Cigemuk</em>
          </h2>
          <div style={{ width: 60, height: 3, background: '#D4943A', borderRadius: 4, marginBottom: '2rem' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '2rem', alignItems: 'start' }}>

            {/* Info Lokasi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: '📍', label: 'Alamat', val: 'Jl. H. Aba, RT.006/RW.003, Panunggangan Utara, Kec. Pinang, Kota Tangerang, Banten 15143' },
                { icon: '📞', label: 'Telepon / WhatsApp', val: '0896-6375-8497' },
                { icon: '🕐', label: 'Jam Buka', val: 'Senin–Kamis & Sabtu–Minggu\n15.00 – 20.00 WIB' },
                { icon: '🔴', label: 'Hari Libur', val: 'Jumat' },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem 1.2rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: 2 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', letterSpacing: 2, textTransform: 'uppercase', color: '#D4943A', marginBottom: 3, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: '0.92rem', color: '#F5EDD6', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{val}</div>
                  </div>
                </div>
              ))}

              {/* Tombol buka di Google Maps */}
              
                <a href="https://www.google.com/maps/place/CIGEMUK+TANGERANG/@-6.2154476,106.6371453,17z/data=!4m15!1m8!3m7!1s0x2e69f90061d4a5f1:0x2d1193cc053229bc!2sCIGEMUK+TANGERANG!8m2!3d-6.2154476!4d106.6397202!10e1!16s%2Fg%2F11xn3n3k3c!3m5!1s0x2e69f90061d4a5f1:0x2d1193cc053229bc!8m2!3d-6.2154476!4d106.6397202!16s%2Fg%2F11xn3n3k3c?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C4703F', color: '#F5EDD6', padding: '12px 24px', borderRadius: 100, textDecoration: 'none', fontFamily: 'Georgia,serif', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.5rem', width: 'fit-content' }}
              >
                🗺️ Buka di Google Maps
              </a>
            </div>

            {/* Google Maps Embed */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.1)', minHeight: 320 }}>
              <iframe
                title="Lokasi Kedai Cigemuk"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.365410133032!2d106.63714527499033!3d-6.2154475937724865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f90061d4a5f1%3A0x2d1193cc053229bc!2sCIGEMUK%20TANGERANG!5e0!3m2!1sid!2sid!4v1773729496342!5m2!1sid!2sid"
                width="100%"
                height="320"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER BAWAH */}
      <div style={{ textAlign: 'center', padding: '2rem 1.5rem', fontSize: '0.82rem', fontStyle: 'italic' }}>
        <p style={{ fontFamily: 'Georgia,serif', fontSize: '1.2rem', color: '#E8D5B0', marginBottom: '0.4rem' }}>Kedai Cigemuk</p>
        <p>📍 Jl. H. Aba RT.006/RW.003, Panunggangan Utara, Kec. Pinang, Kota Tangerang 15143</p>
        <p style={{ marginTop: '0.3rem' }}>📞 0896-6375-8497 &nbsp;|&nbsp; 🕐 Senin–Kamis & Sabtu–Minggu 15.00–20.00 &nbsp;|&nbsp; Libur Jumat</p>
        <p style={{ marginTop: '0.8rem', fontSize: '0.72rem', opacity: 0.5 }}>© 2025 Kedai Cigemuk. All rights reserved.</p>
      </div>

    </footer>
  );
}
export default Footer;