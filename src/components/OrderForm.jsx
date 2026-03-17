import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { menuItems } from '../data/menu';
import { simpanOrder } from '../services/orderService';

function OrderForm() {
  const { cart } = useCart();
  const [form, setForm] = useState({ nama:'',wa:'',metode:'delivery',alamat:'',waktu:'Secepatnya (±30 menit)',bayar:'COD (Bayar di Tempat)',catatan:'' });
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);
  const cartEntries = Object.entries(cart);
  const total = cartEntries.reduce((sum,[id,qty]) => { const item = menuItems.find(m=>m.id===id); return sum+(item?.price||0)*qty; },0);
  const inp = { background:'#FFF9F0',border:'1.5px solid #E8D5B0',borderRadius:10,padding:'11px 15px',fontFamily:'Georgia,serif',fontSize:'0.93rem',color:'#2E1004',outline:'none',width:'100%' };

  function buildWA() {
    const items = cartEntries.map(([id,qty]) => { const it=menuItems.find(m=>m.id===id); return `• ${it.name} ×${qty} = Rp ${(it.price*qty).toLocaleString('id-ID')}`; }).join('\n');
    return `Halo Kedai Cigemuk! 🥟\n\n*Pesanan Baru*\nNama: ${form.nama}\nWA: ${form.wa}\n\n*Detail:*\n${items}\n*Total: Rp ${total.toLocaleString('id-ID')}*\n\nPengiriman: ${form.metode==='pickup'?'Ambil Sendiri':'Delivery'}${form.metode==='delivery'?'\nAlamat: '+form.alamat:''}\nWaktu: ${form.waktu}\nPembayaran: ${form.bayar}${form.catatan?'\nCatatan: '+form.catatan:''}`;
  }

  async function handleOrder(via) {
    if(!form.nama) return alert('Nama tidak boleh kosong!');
    if(!form.wa) return alert('Nomor WhatsApp tidak boleh kosong!');
    if(!cartEntries.length) return alert('Pilih minimal 1 menu dulu!');
    setLoading(true);
    await simpanOrder({...form,items:cart,total});
    setLoading(false);
    if(via==='wa') window.open(`https://wa.me/6289663758497?text=${encodeURIComponent(buildWA())}`,'_blank');
    setSukses(true);
  }

  if(sukses) return (
    <section id="order" style={{ background:'#F0E2C0',padding:'5rem 2rem',textAlign:'center' }}>
      <div style={{ background:'#F5EDD6',borderRadius:24,padding:'3rem 2rem',maxWidth:400,margin:'0 auto' }}>
        <div style={{ width:68,height:68,background:'#C4703F',borderRadius:'50%',margin:'0 auto 1.2rem',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem' }}>✓</div>
        <h3 style={{ fontFamily:'Georgia,serif',fontSize:'1.7rem',color:'#3E1A06',marginBottom:'0.6rem' }}>Pesanan Terkirim!</h3>
        <p style={{ color:'#9C7A5A',fontStyle:'italic',marginBottom:'1.5rem' }}>Terima kasih! Kami akan konfirmasi via WhatsApp segera.</p>
        <button onClick={() => setSukses(false)} style={{ background:'#C4703F',color:'#F5EDD6',border:'none',padding:'14px 32px',borderRadius:100,cursor:'pointer',width:'100%',fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:600 }}>Pesan Lagi</button>
      </div>
    </section>
  );

  return (
    <section id="order" style={{ background:'#F0E2C0',padding:'5rem 2rem' }}>
      <div style={{ maxWidth:1100,margin:'0 auto' }}>
        <p style={{ fontSize:11,letterSpacing:4,textTransform:'uppercase',color:'#C4703F',fontWeight:600,marginBottom:6 }}>✦ Order Sekarang</p>
        <h2 style={{ fontFamily:'Georgia,serif',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:700,color:'#3E1A06',marginBottom:8 }}>Isi <em style={{ color:'#C4703F' }}>Pesanan</em> Kamu</h2>
        <div style={{ width:60,height:3,background:'#D4943A',borderRadius:4,marginBottom:'2.5rem' }}/>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'2rem' }}>
          <div>
            <div style={{ background:'#FFF9F0',borderRadius:16,border:'1px solid #E8D5B0',padding:'1.5rem',marginBottom:'1.2rem' }}>
              <div style={{ fontFamily:'Georgia,serif',fontSize:'1.05rem',fontWeight:700,color:'#3E1A06',paddingBottom:'0.75rem',borderBottom:'1px dashed #E8D5B0',marginBottom:'0.75rem' }}>🛒 Ringkasan Pesanan</div>
              {!cartEntries.length ? <p style={{ textAlign:'center',color:'#9C7A5A',fontStyle:'italic',padding:'1.5rem 0',fontSize:'0.88rem' }}>Belum ada item dipilih.<br/>Pilih menu di atas dulu ya!</p> : <>
                {cartEntries.map(([id,qty]) => { const it=menuItems.find(m=>m.id===id); return <div key={id} style={{ display:'flex',justifyContent:'space-between',padding:'7px 0',fontSize:'0.88rem',color:'#6B3A1F' }}><span>{it.emoji} {it.name} ×{qty}</span><strong style={{ color:'#3E1A06' }}>Rp {(it.price*qty).toLocaleString('id-ID')}</strong></div>; })}
                <div style={{ display:'flex',justifyContent:'space-between',paddingTop:'0.75rem',marginTop:'0.5rem',borderTop:'2px solid #E8D5B0',fontFamily:'Georgia,serif',fontSize:'1.2rem',fontWeight:700,color:'#C4703F' }}><span>Total</span><span>Rp {total.toLocaleString('id-ID')}</span></div>
              </>}
            </div>
            {[['nama','Nama Lengkap','text','Nama kamu...'],['wa','No. WhatsApp','tel','0896-xxxx-xxxx']].map(([id,label,type,ph]) => (
              <div key={id} style={{ marginBottom:'1rem' }}>
                <label style={{ fontSize:'0.78rem',fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',color:'#6B3A1F',display:'block',marginBottom:7 }}>{label}</label>
                <input type={type} style={inp} value={form[id]} onChange={e=>setForm({...form,[id]:e.target.value})} placeholder={ph}/>
              </div>
            ))}
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem',fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',color:'#6B3A1F',display:'block',marginBottom:7 }}>Metode Pengiriman</label>
              <select style={inp} value={form.metode} onChange={e=>setForm({...form,metode:e.target.value})}>
                <option value="delivery">🚚 Delivery</option>
                <option value="pickup">🏪 Ambil Sendiri</option>
              </select>
            </div>
            {form.metode==='delivery' && <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem',fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',color:'#6B3A1F',display:'block',marginBottom:7 }}>Alamat Lengkap</label>
              <textarea style={{ ...inp,minHeight:80,resize:'vertical' }} value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} placeholder="Jl., RT/RW, Kelurahan..."/>
            </div>}
          </div>
          <div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem',fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',color:'#6B3A1F',display:'block',marginBottom:7 }}>Waktu Pengiriman</label>
              <select style={inp} value={form.waktu} onChange={e=>setForm({...form,waktu:e.target.value})}>
                {['Secepatnya (±30 menit)','Pukul 15.00','Pukul 16.00','Pukul 17.00','Pukul 18.00','Pukul 19.00'].map(w=><option key={w}>{w}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem',fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',color:'#6B3A1F',display:'block',marginBottom:7 }}>Metode Pembayaran</label>
              <select style={inp} value={form.bayar} onChange={e=>setForm({...form,bayar:e.target.value})}>
                {['COD (Bayar di Tempat)','Transfer Bank','GoPay / OVO / Dana','QRIS'].map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem',fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',color:'#6B3A1F',display:'block',marginBottom:7 }}>Catatan</label>
              <textarea style={{ ...inp,minHeight:70,resize:'vertical' }} value={form.catatan} onChange={e=>setForm({...form,catatan:e.target.value})} placeholder="Level pedas, mix isian, dll..."/>
            </div>
            <div style={{ background:'#FFF9F0',borderRadius:12,border:'1px solid #E8D5B0',padding:'1rem',marginBottom:'1rem',fontSize:'0.82rem',color:'#9C7A5A',fontStyle:'italic',lineHeight:1.6 }}>
              💡 Pesanan diteruskan via WhatsApp. Konfirmasi dalam ±5 menit.
            </div>
            <button onClick={()=>handleOrder('wa')} disabled={loading} style={{ background:'#25D366',color:'white',border:'none',padding:14,borderRadius:12,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:600,width:'100%',marginBottom:'0.75rem',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
              💬 Pesan via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
export default OrderForm;