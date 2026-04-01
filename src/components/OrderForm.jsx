import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { menuItems } from '../data/menu';
import { simpanOrder } from '../services/orderService';

function OrderForm() {
  const { cart } = useCart();
  const [form, setForm] = useState({
    nama: '',
    wa: '',
    metode: 'pickup',
    alamat: '',
    tanggal: '',
    waktu: 'Secepatnya (+/-30 menit)',
    bayar: 'COD (Bayar di Tempat)',
    catatan: ''
  });
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const cartEntries = Object.entries(cart);
  const subtotal = cartEntries.reduce((sum, [id, qty]) => {
    const item = menuItems.find((menu) => menu.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);
  const ongkir = form.metode === 'delivery' ? 20000 : 0;
  const total = subtotal + ongkir;
  const inp = {
    background: '#FFF9F0',
    border: '1.5px solid #E8D5B0',
    borderRadius: 10,
    padding: '11px 15px',
    fontFamily: 'Georgia,serif',
    fontSize: '0.93rem',
    color: '#2E1004',
    outline: 'none',
    width: '100%'
  };

  function updateForm(key, value) {
    setForm({ ...form, [key]: value });
  }

  function buildWA(currentOrderNumber) {
    const items = cartEntries
      .map(([id, qty]) => {
        const item = menuItems.find((menu) => menu.id === id);
        return `- ${item.name} x${qty} = Rp ${(item.price * qty).toLocaleString('id-ID')}`;
      })
      .join('\n');

    return `Halo Kedai Cigemuk!

*Pesanan Baru*
No. Urut: ${currentOrderNumber}
Nama: ${form.nama}
WA: ${form.wa}
Metode: ${form.metode}
${form.metode === 'delivery' ? `Tanggal Antar: ${form.tanggal || '-'}
Alamat: ${form.alamat || '-'}
` : ''}Waktu: ${form.waktu}
Pembayaran: ${form.bayar}
Tanggal Pesanan: ${form.tanggal || '-'}\n

*Detail:*
${items}
${form.metode === 'delivery' ? '- Ongkos Kirim = Rp 20.000\n' : '- Ongkos Kirim = Gratis (Pickup)\n'}*Total: Rp ${total.toLocaleString('id-ID')}*

Catatan: ${form.catatan || '-'}`;
  }

  async function handleOrder(via) {
    if (!form.nama) return alert('Nama tidak boleh kosong!');
    if (!form.wa) return alert('Nomor WhatsApp tidak boleh kosong!');
    if (!cartEntries.length) return alert('Pilih minimal 1 menu dulu!');
    if (!form.tanggal) return alert('Pilih tanggal pengantaran/pickup!');
    if (form.metode === 'delivery' && !form.alamat) return alert('Alamat tidak boleh kosong untuk pengantaran!');
          

          
    const itemDetails = cartEntries.map(([id, qty]) => {
      const item = menuItems.find((menu) => menu.id === id);

      return {
        id,
        name: item?.name || id,
        price: item?.price || 0,
        qty,
        subtotal: (item?.price || 0) * qty
      };
    });

    setLoading(true);
    const result = await simpanOrder({ ...form, items: cart, itemDetails, total });
    setLoading(false);

    if (!result.success) {
      return alert(`Pesanan gagal disimpan: ${result.error}`);
    }

    setOrderNumber(result.orderNumber);

    if (via === 'wa') {
      window.open(`https://wa.me/6289667329000?text=${encodeURIComponent(buildWA(result.orderNumber))}`, '_blank');
    }

    setSukses(true);
  }

  if (sukses) {
    return (
      <section id="order" style={{ background: '#F0E2C0', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ background: '#F5EDD6', borderRadius: 24, padding: '3rem 2rem', maxWidth: 400, margin: '0 auto' }}>
          <div style={{ width: 68, height: 68, background: '#C4703F', borderRadius: '50%', margin: '0 auto 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>✓</div>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.7rem', color: '#3E1A06', marginBottom: '0.6rem' }}>Pesanan Terkirim!</h3>
          {orderNumber ? <p style={{ color: '#6B3A1F', fontWeight: 700, marginBottom: '0.6rem' }}>No. Urut Pesanan: #{orderNumber}</p> : null}
          <p style={{ color: '#9C7A5A', fontStyle: 'italic', marginBottom: '1.5rem' }}>Terima kasih! Kami akan konfirmasi via WhatsApp segera.</p>
          <button
            onClick={() => {
              setSukses(false);
              setOrderNumber(null);
              window.location.reload();
            }}
            style={{ background: '#C4703F', color: '#F5EDD6', border: 'none', padding: '14px 32px', borderRadius: 100, cursor: 'pointer', width: '100%', fontFamily: 'Georgia,serif', fontSize: '1rem', fontWeight: 600 }}
          >
            Pesan Lagi
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="order" style={{ background: '#F0E2C0', padding: '5rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#C4703F', fontWeight: 600, marginBottom: 6 }}>Order Sekarang</p>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: '#3E1A06', marginBottom: 8 }}>
          Isi <em style={{ color: '#C4703F' }}>Pesanan</em> Kamu
        </h2>
        <div style={{ width: 60, height: 3, background: '#D4943A', borderRadius: 4, marginBottom: '2.5rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '2rem' }}>
          <div>
            <div style={{ background: '#FFF9F0', borderRadius: 16, border: '1px solid #E8D5B0', padding: '1.5rem', marginBottom: '1.2rem' }}>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', fontWeight: 700, color: '#3E1A06', paddingBottom: '0.75rem', borderBottom: '1px dashed #E8D5B0', marginBottom: '0.75rem' }}>
                🛒 Ringkasan Pesanan
              </div>
              {!cartEntries.length ? (
                <p style={{ textAlign: 'center', color: '#9C7A5A', fontStyle: 'italic', padding: '1.5rem 0', fontSize: '0.88rem' }}>
                  Belum ada item dipilih.
                  <br />
                  Pilih menu di atas dulu ya!
                </p>
              ) : (
                <>
                  {cartEntries.map(([id, qty]) => {
                    const item = menuItems.find((menu) => menu.id === id);
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.88rem', color: '#6B3A1F' }}>
                        <span>{item.emoji} {item.name} x{qty}</span>
                        <strong style={{ color: '#3E1A06' }}>Rp {(item.price * qty).toLocaleString('id-ID')}</strong>
                      </div>
                    );
                  })}
                  {form.metode === 'delivery' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.88rem', color: '#6B3A1F' }}>
                      <span>🚚 Ongkos Kirim</span>
                      <strong style={{ color: '#3E1A06' }}>Rp 20.000</strong>
                    </div>
                  )}
                  {form.metode === 'pickup' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.88rem', color: '#6B3A1F' }}>
                      <span>🏪 Ongkos Kirim</span>
                      <strong style={{ color: '#2E7D32' }}>Gratis</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.5rem', borderTop: '2px solid #E8D5B0', fontFamily: 'Georgia,serif', fontSize: '1.2rem', fontWeight: 700, color: '#C4703F' }}>
                    <span>Total</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}
            </div>

            {[
              ['nama', 'Nama Lengkap', 'text', 'Nama kamu...'],
              ['wa', 'No. WhatsApp', 'tel', '0896-xxxx-xxxx']
            ].map(([id, label, type, placeholder]) => (
              <div key={id} style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B3A1F', display: 'block', marginBottom: 7 }}>{label}</label>
                <input type={type} style={inp} value={form[id]} onChange={(e) => updateForm(id, e.target.value)} placeholder={placeholder} />
              </div>
            ))}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B3A1F', display: 'block', marginBottom: 7 }}>Metode Pengiriman</label>
              <select style={inp} value={form.metode} onChange={(e) => updateForm('metode', e.target.value)}>
                <option value="">----Pilih----</option>
                <option value="pickup">🏪 Ambil Sendiri</option>
                <option value="delivery">🚚 Delivery</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B3A1F', display: 'block', marginBottom: 7 }}>Tanggal Pengiriman</label>
              <input type="date" style={inp} value={form.tanggal} onChange={(e) => updateForm('tanggal', e.target.value)} />
            </div>

            {form.metode === 'delivery' && (
              <>
                <div style={{ marginBottom: '1rem', background: '#FFF9F0', borderRadius: 12, border: '1px solid #E8D5B0', padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#6B3A1F', lineHeight: 1.6 }}>
                  🚚 Layanan antar hanya tersedia untuk area Tangerang tertentu dan menyesuaikan jarak pengantaran.
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B3A1F', display: 'block', marginBottom: 7 }}>Alamat Lengkap</label>
                  <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={form.alamat} onChange={(e) => updateForm('alamat', e.target.value)} placeholder="Jl., RT/RW, Kelurahan... Atau Share lokasi di WhatsApp" required />
                </div>
              </>
            )}
          </div>

          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B3A1F', display: 'block', marginBottom: 7 }}>Waktu Pengiriman</label>
              <select style={inp} value={form.waktu} onChange={(e) => updateForm('waktu', e.target.value)}>
                {['Secepatnya (+/-30 menit)', 'Pukul 10.00', 'Pukul 11.00', 'Pukul 12.00', 'Pukul 13.00', 'Pukul 14.00', 'Pukul 15.00', 'Pukul 16.00', 'Pukul 17.00', 'Pukul 18.00', 'Pukul 19.00', 'Pukul 20.00', 'Pukul 21.00', 'Pukul 22.00'].map((waktu) => (
                  <option key={waktu}>{waktu}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B3A1F', display: 'block', marginBottom: 7 }}>Metode Pembayaran</label>
              <select style={inp} value={form.bayar} onChange={(e) => updateForm('bayar', e.target.value)}>
                {['COD (Bayar di Tempat)', 'Transfer Bank', 'QRIS'].map((bayar) => (
                  <option key={bayar}>{bayar}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6B3A1F', display: 'block', marginBottom: 7 }}>Catatan</label>
              <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} value={form.catatan} onChange={(e) => updateForm('catatan', e.target.value)} placeholder="Level pedas, mix isian, mau versi mentah, dll..." />
            </div>

            <div style={{ background: '#FFF9F0', borderRadius: 12, border: '1px solid #E8D5B0', padding: '1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#9C7A5A', fontStyle: 'italic', lineHeight: 1.6 }}>
              💡 Pesanan harus diteruskan via WhatsApp. Konfirmasi dalam +/-5 menit.
            </div>

            <button
              onClick={() => handleOrder('wa')}
              disabled={loading}
              style={{ background: '#25D366', color: 'white', border: 'none', padding: 14, borderRadius: 12, cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: '1rem', fontWeight: 600, width: '100%', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              💬 Pesan via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderForm;
