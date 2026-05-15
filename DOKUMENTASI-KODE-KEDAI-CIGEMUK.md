# Dokumentasi Kode Kedai Cigemuk

Dokumen ini merangkum struktur kode, alur aplikasi, fungsi utama, dan potongan implementasi penting pada project `kedai-cigemuk`.

## 1. Ringkasan Project

- Nama project: `kedai-cigemuk`
- Tipe: aplikasi pemesanan online sederhana
- Stack utama:
  - `React`
  - `Vite`
  - `React Router`
  - `Firebase Auth`
  - `Firestore`
  - `xlsx`
- Fungsi utama:
  - menampilkan katalog menu
  - menambah item ke keranjang
  - membuat order
  - meneruskan order ke WhatsApp
  - login admin
  - kelola menu
  - kelola order
  - export data Excel

## 2. Struktur Folder Inti

```txt
src/
  components/
    Footer.jsx
    Hero.jsx
    MenuSection.jsx
    Navbar.jsx
    OrderForm.jsx
    ProtectedAdminRoute.jsx
  context/
    AdminAuthContext.jsx
    CartContext.jsx
    MenuContext.jsx
  data/
    menu.js
  pages/
    AdminDashboard.jsx
    AdminLogin.jsx
    AdminSetup.jsx
    Home.jsx
  services/
    adminAuthService.js
    menuService.js
    orderService.js
  App.jsx
  firebase.js
  index.css
  main.jsx
public/
  menu-images/
    README.md
```

## 3. Alur Aplikasi

### 3.1 Startup

1. Browser load `src/main.jsx`
2. `BrowserRouter` membungkus `App`
3. `App` membungkus route dengan provider:
   - `AdminAuthProvider`
   - `MenuProvider`
   - `CartProvider`
4. Route dipetakan ke halaman publik dan admin

Contoh kode:

```jsx
<AdminAuthProvider>
  <MenuProvider>
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/setup-admin" element={<AdminSetup />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </CartProvider>
  </MenuProvider>
</AdminAuthProvider>
```

### 3.2 Halaman Publik

Urutan render di `Home.jsx`:

1. `Navbar`
2. `Hero`
3. `MenuSection`
4. `OrderForm`
5. `Footer`

### 3.3 Alur Menu

1. `MenuContext` subscribe ke Firestore collection `menu`
2. Data dinormalisasi lewat `normalizeMenu` di `menuService.js`
3. Jika collection belum ada data valid, aplikasi fallback ke `src/data/menu.js`
4. `MenuSection` menampilkan menu unggulan dan menu reguler

### 3.4 Alur Keranjang

1. User klik tombol `+` di `MenuSection`
2. `addToCart(id)` menambah qty item
3. `CartContext` menyimpan state object:

```js
{
  "ayam-pedas": 2,
  "keju": 1
}
```

4. `OrderForm` membaca isi keranjang lalu menghitung subtotal, ongkir, dan total

### 3.5 Alur Order

1. User isi form order
2. `handleOrder('wa')` melakukan validasi
3. Data item dibentuk menjadi `itemDetails`
4. `simpanOrder()` menyimpan data ke Firestore collection `orders`
5. Nomor order dibuat dari data order terakhir, dengan fallback ke `localStorage`
6. Setelah sukses, browser membuka WhatsApp dengan format pesan order

### 3.6 Alur Admin

1. `AdminSetup` dipakai sekali untuk membuat admin pertama
2. `AdminLogin` login ke Firebase Auth
3. `adminAuthService` validasi apakah user juga ada di collection `admins`
4. `ProtectedAdminRoute` mencegah akses `/admin` jika belum admin
5. `AdminDashboard` dipakai untuk:
   - melihat order realtime
   - update status/data order
   - hapus order
   - kelola menu
   - export order/menu ke Excel

## 4. Dokumentasi Per File dan Fungsi

## 4.1 `src/main.jsx`

Tugas:
- entry point React
- render `App` ke elemen `#root`

Fungsi utama:
- `createRoot(...).render(...)`

## 4.2 `src/App.jsx`

Tugas:
- menyusun provider global
- mendefinisikan seluruh route

Route yang tersedia:
- `/` -> `Home`
- `/admin/login` -> `AdminLogin`
- `/setup-admin` -> `AdminSetup`
- `/admin` -> `AdminDashboard` via `ProtectedAdminRoute`

## 4.3 `src/firebase.js`

Tugas:
- inisialisasi Firebase app
- export `auth`
- export `db`

Potongan kode:

```js
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 4.4 `src/context/CartContext.jsx`

Tugas:
- menyimpan state keranjang global

Fungsi:
- `addToCart(id)`
  - menambah qty item
- `removeFromCart(id)`
  - mengurangi qty item
  - menghapus key jika qty jadi 0
- `clearCart()`
  - mengosongkan seluruh isi keranjang setelah order sukses atau reset manual

Output context:
- `cart`
- `addToCart`
- `removeFromCart`
- `totalItems`

Pola kode:

```jsx
function addToCart(id) {
  setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
}
```

## 4.5 `src/context/MenuContext.jsx`

Tugas:
- mengambil menu dari Firestore
- fallback ke data lokal jika Firestore kosong

Fungsi/alur:
- `useEffect(...)`
  - subscribe ke `subscribeMenuItems`
- `useMemo(...)`
  - memilih source menu: remote atau fallback
- `menuById`
  - ubah array menu menjadi object lookup

Output context:
- `loadingMenus`
- `menuItems`
- `menuById`
- `rawMenus`
- `hasRemoteMenus`

## 4.6 `src/context/AdminAuthContext.jsx`

Tugas:
- menyimpan state sesi admin global

Fungsi:
- `handleLoginAdmin(email, password)`
- `handleLogoutAdmin()`
- `handleCreateInitialAdmin(payload)`

Hook penting:
- `subscribeAdminSession(...)`
  - sinkronisasi state login dari Firebase Auth

Output context:
- `user`
- `adminProfile`
- `isAdmin`
- `isLoading`
- `loginAdmin`
- `logoutAdmin`
- `createInitialAdmin`

## 4.7 `src/services/adminAuthService.js`

Tugas:
- layer Firebase Auth + validasi admin Firestore

Fungsi:
- `getAdminProfile(uid)`
  - ambil data admin dari collection `admins`
  - cek `isActive !== false`
- `hasAdminAccount()`
  - cek apakah admin pertama sudah ada
- `loginAdmin(email, password)`
  - login ke Firebase Auth
  - validasi data admin di Firestore
- `logoutAdmin()`
  - logout auth
- `subscribeAdminSession(callback)`
  - pantau perubahan auth state
- `createInitialAdmin({ nama, email, password })`
  - buat user auth
  - simpan profil admin ke Firestore

Logika penting:

```js
if (!adminProfile) {
  await signOut(auth);
  throw new Error('Akun ini berhasil login ke Firebase Auth, tapi belum terdaftar sebagai admin.');
}
```

## 4.8 `src/services/menuService.js`

Tugas:
- CRUD menu
- subscribe menu realtime
- export menu ke Excel

Fungsi:
- `sortMenus(items)`
  - urutkan menu unggulan dulu
  - lalu berdasarkan `sortOrder`
  - lalu `name`
- `normalizeMenu(menu)`
  - samakan struktur data dari field alternatif:
    - `name` / `nama`
    - `desc` / `deskripsi`
    - `price` / `harga`
    - `photoUrl` / `foto`
- `prepareMenuPayload(menu)`
  - bersihkan data sebelum simpan
- `getDefaultMenuEmoji()`
- `subscribeMenuItems(callback)`
- `createMenu(menu)`
- `seedMenus(menus)`
- `updateMenuById(menuId, menu)`
- `deleteMenuById(menuId)`
- `exportMenusToExcel(menus)`

Contoh normalisasi:

```js
photoUrl: String(menu.photoUrl || menu.foto || '').trim()
```

## 4.9 `src/services/orderService.js`

Tugas:
- simpan order
- subscribe order realtime
- update/hapus order
- export order ke Excel

Fungsi:
- `getLocalNextOrderNumber()`
  - fallback counter dari `localStorage`
- `saveLocalOrderNumber(orderNumber)`
- `getNextOrderNumber()`
  - ambil nomor order terbesar dari Firestore
- `simpanOrder(dataOrder)`
  - simpan order baru
- `subscribeOrders(callback)`
- `updateOrderById(orderId, data)`
- `deleteOrderById(orderId)`
- `formatExportDate(value)`
- `formatExportItems(order)`
- `exportOrdersToExcel(orders)`

Alur `simpanOrder`:

1. coba ambil nomor order dari Firestore
2. jika gagal, pakai fallback `localStorage`
3. simpan order ke Firestore
4. simpan nomor order terakhir ke browser

## 4.10 `src/components/Navbar.jsx`

Tugas:
- navigasi sticky
- tampilkan total item keranjang
- menu desktop dan mobile

Fungsi:
- `scrollTo(id)`
  - scroll ke section tertentu

State:
- `menuOpen`

## 4.11 `src/components/Hero.jsx`

Tugas:
- section landing utama

Fungsi:
- `scrollTo(id)`

Aksi tombol:
- `Lihat Menu` -> ke section `menu`
- `Pesan Sekarang` -> ke section `order`

## 4.12 `src/components/MenuSection.jsx`

Tugas:
- tampilkan menu publik
- kontrol tambah/kurang qty item

Komponen internal:
- `QtyControl({ id })`
  - tombol `+`, `-`, qty
- `MenuVisual({ item, size })`
  - render gambar menu
  - fallback ke emoji jika gambar gagal

Fungsi penting:
- filter `specialMenus`
- filter `regularMenus`

Pola fallback gambar:

```jsx
if (item.photoUrl && !imageFailed) {
  return (
    <img
      src={item.photoUrl}
      alt={item.name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setImageFailed(true)}
    />
  );
}
```

Catatan:
- `photoUrl` harus direct image URL
- link Google Maps atau halaman web biasa tidak bisa dipakai langsung

## 4.13 `src/components/OrderForm.jsx`

Tugas:
- tampilkan ringkasan keranjang
- tampilkan form order
- simpan order
- teruskan ke WhatsApp

State:
- `form`
- `loading`
- `sukses`
- `orderNumber`

Fungsi:
- `updateForm(key, value)`
- `buildWA(currentOrderNumber)`
  - susun pesan WhatsApp
- `handleOrder(via)`
  - validasi input
  - bentuk `itemDetails`
  - panggil `simpanOrder`
  - bersihkan keranjang tanpa `window.location.reload()`

Validasi penting:
- nama wajib
- WA wajib
- cart tidak boleh kosong
- tanggal wajib
- alamat wajib jika delivery
- catatan wajib jika ada menu unggulan

Perubahan terbaru:
- keranjang dibersihkan dengan `clearCart()`
- form direset ke `INITIAL_FORM`
- tombol `Pesan Lagi` tidak lagi me-reload halaman

Output data order:

```js
{
  nama,
  wa,
  metode,
  alamat,
  tanggal,
  waktu,
  bayar,
  catatan,
  items,
  itemDetails,
  total
}
```

## 4.14 `src/components/Footer.jsx`

Tugas:
- tampilkan info lokasi
- tombol ke Google Maps
- iframe Google Maps embed

Catatan:
- link Google Maps di footer dipakai untuk buka halaman lokasi
- iframe embed dipakai untuk peta
- ini berbeda dengan `photoUrl` gambar produk

## 4.15 `src/components/ProtectedAdminRoute.jsx`

Tugas:
- proteksi route admin

Logika:
- jika `isLoading`, tampilkan status pengecekan sesi
- jika `!isAdmin`, redirect ke `/admin/login`
- jika lolos, render `Outlet`

## 4.16 `src/pages/Home.jsx`

Tugas:
- menyusun halaman publik

## 4.17 `src/pages/AdminLogin.jsx`

Tugas:
- form login admin

Fungsi:
- `handleSubmit(event)`
  - panggil `loginAdmin`
  - redirect ke halaman tujuan

## 4.18 `src/pages/AdminSetup.jsx`

Tugas:
- buat admin pertama

Fungsi:
- `handleSubmit(event)`
  - validasi password
  - panggil `createInitialAdmin`

Alur awal:
- `hasAdminAccount()` dicek saat mount
- jika admin sudah ada, redirect ke login

## 4.19 `src/pages/AdminDashboard.jsx`

Tugas:
- pusat manajemen order dan menu

Fitur order:
- list order realtime
- filter status
- filter tanggal
- edit order
- hapus order
- export Excel

Fitur menu:
- list menu
- tambah menu
- edit menu
- hapus menu
- seed menu bawaan
- export Excel
- simpan gambar produk ke folder repo lokal `public/menu-images`
- preview gambar sebelum simpan
- hapus foto dari form menu

State utama:
- `activeSection`
- `orders`
- `selectedOrderId`
- `editForm`
- `filterStatus`
- `filterDateFrom`
- `filterDateTo`
- `selectedMenuId`
- `isCreatingMenu`
- `menuForm`

Fungsi penting:
- `getOrderStatus(order)`
- `formatCurrency(value)`
- `formatDate(value)`
- `getOrderFilterDate(order)`
- `buildEditForm(order)`
- `buildMenuForm(menu)`
- `handleUpdateOrder(event)`
- `handleDeleteOrder()`
- `resetMenuForm()`
- `updateMenuFormField(key, value)`
- `handlePickMenuRepoDirectory()`
- `handleChooseRepoDirectory()`
- `saveMenuPhotoToRepository(file)`
- `handleMenuPhotoChange(event)`
- `resetMenuPhotoToCurrentUrl()`
- `clearMenuPhoto()`
- `handleSaveMenu(event)`
- `handleDeleteMenu()`
- `handleSeedMenus()`
- `handleSelectMenuCard(menu)`

Catatan penting:
- dashboard membaca `rawMenus` jika data Firestore tersedia
- jika belum ada, dashboard masih bisa memakai fallback menu sebagai template
- jika file upload dipilih, file akan disalin ke folder repo lokal yang dipilih user lalu `photoUrl` diisi path seperti `/menu-images/nama-file.jpg`
- fitur simpan ke repo memakai File System Access API, jadi cocok untuk browser Chromium di `localhost`

## 4.20 `src/data/menu.js`

Tugas:
- fallback menu statis jika Firestore kosong

Isi:
- daftar menu default
- dipakai oleh `MenuContext`

## 5. Struktur Data Firestore

## 5.1 Collection `menu`

Contoh field:

```js
{
  name: 'Cireng Isi Keju Lumer',
  desc: 'Keju lumer yang stretchy gurih dan lezat',
  price: 3000,
  emoji: '🥟🧀',
  photoUrl: '',
  isSpecial: false,
  isActive: true,
  sortOrder: 4,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

## 5.2 Collection `orders`

Contoh field:

```js
{
  nama: 'Deka',
  wa: '0896xxxx',
  metode: 'delivery',
  alamat: 'Panunggangan',
  tanggal: '2026-05-15',
  waktu: 'Pukul 18.00',
  bayar: 'COD (Bayar di Tempat)',
  catatan: 'Mix rasa',
  items: { keju: 2, usus: 1 },
  itemDetails: [
    { id: 'keju', name: 'Cireng Isi Keju Lumer', price: 3000, qty: 2, subtotal: 6000 }
  ],
  total: 26000,
  status: 'baru',
  orderNumber: 12,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

## 5.3 Collection `admins`

Contoh field:

```js
{
  nama: 'Admin Kedai',
  email: 'admin@kedaicigemuk.com',
  role: 'super-admin',
  isActive: true,
  createdAt: serverTimestamp()
}
```

## 6. Cara Menjalankan Project

Install dependency:

```bash
npm install
```

Mode development:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## 7. Catatan Perubahan Penting

- gambar produk dari field `photoUrl` hanya bisa memakai direct image URL
- fallback gambar ke emoji sudah ditambahkan jika image gagal dimuat
- admin dashboard sudah diberi helper text untuk field `Foto URL`
- upload gambar produk sekarang diarahkan ke folder repo lokal `public/menu-images`
- order sukses sekarang membersihkan keranjang tanpa reload halaman

## 8. Rekomendasi Dokumentasi Lanjutan

Dokumen ini bisa dikembangkan lagi dengan tambahan:

- flow chart order
- mapping state per halaman
- dokumentasi CSS class
- dokumentasi Firebase rules
- SOP deploy ke Vercel/Firebase
- dokumentasi alur gambar produk via repository lokal
