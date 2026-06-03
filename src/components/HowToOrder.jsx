const STEPS = [
  {
    num: '1',
    icon: '🛍️',
    title: 'Pilih Menu',
    desc: 'Tekan tombol + pada menu yang kamu mau. Bisa pilih lebih dari satu.',
  },
  {
    num: '2',
    icon: '📝',
    title: 'Isi Data',
    desc: 'Tulis nama, nomor WhatsApp, pilih metode ambil atau antar, dan waktu.',
  },
  {
    num: '3',
    icon: '💬',
    title: 'Kirim via WhatsApp',
    desc: 'Tekan tombol hijau. Pesanan otomatis dikirim ke WhatsApp kami untuk dikonfirmasi.',
  },
];

function HowToOrder() {
  return (
    <section style={{ background: '#F5EDD6', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#C4703F', fontWeight: 600, marginBottom: 6 }}>
          Panduan
        </p>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.7rem,3.5vw,2.5rem)', fontWeight: 700, color: '#3E1A06', marginBottom: 8 }}>
          Cara <em style={{ color: '#C4703F' }}>Pesan</em>
        </h2>
        <div style={{ width: 60, height: 3, background: '#D4943A', borderRadius: 4, marginBottom: '2.5rem' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem', position: 'relative' }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
              <div style={{ background: '#FFF9F0', border: '1px solid #E8D5B0', borderRadius: 20, padding: '1.5rem', flex: 1, boxShadow: '0 8px 24px rgba(62,26,6,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#c56a34,#8d4521)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    {step.num}
                  </div>
                  <span style={{ fontSize: '1.6rem' }}>{step.icon}</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', fontWeight: 700, color: '#3E1A06', marginBottom: '0.4rem' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#7b533d', lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ display: 'none', alignSelf: 'center', color: '#D4943A', fontSize: '1.3rem', flexShrink: 0 }} className="how-to-arrow">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.83rem', color: '#9b7054', textAlign: 'center', fontStyle: 'italic' }}>
          Pesanan dikonfirmasi dalam ±5 menit via WhatsApp. Buka setiap hari kecuali Jumat, pukul 15.00–20.00 WIB.
        </p>
      </div>
    </section>
  );
}

export default HowToOrder;
