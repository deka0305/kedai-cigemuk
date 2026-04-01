# Firebase Setup Admin dan Order

Project ini sekarang memakai:

- Firebase Authentication untuk login admin
- Firestore collection `orders` untuk data pesanan
- Firestore collection `admins` untuk daftar akun yang boleh masuk dashboard

## Route yang tersedia

- `/` halaman publik order
- `/admin/login` halaman login admin
- `/setup-admin` halaman setup admin pertama
- `/admin` dashboard super admin untuk lihat, edit, dan hapus order

## Struktur collection Firestore

### `orders`

Contoh dokumen:

```json
{
  "nama": "Budi",
  "wa": "089612345678",
  "metode": "delivery",
  "alamat": "Jl. Contoh No. 1",
  "tanggal": "2026-04-02",
  "waktu": "Pukul 18.00",
  "bayar": "QRIS",
  "catatan": "Pedas sedang",
  "items": {
    "special": 1,
    "keju": 2
  },
  "itemDetails": [
    {
      "id": "special",
      "name": "Cireng Kuah Creamy",
      "price": 15000,
      "qty": 1,
      "subtotal": 15000
    }
  ],
  "total": 41000,
  "status": "baru",
  "orderNumber": 1,
  "createdAt": "serverTimestamp()",
  "updatedAt": "serverTimestamp()"
}
```

### `admins`

Nama collection: `admins`

ID dokumen: pakai `uid` dari Firebase Authentication.

Contoh dokumen:

```json
{
  "nama": "Super Admin",
  "email": "admin@kedaicigemuk.com",
  "role": "super-admin",
  "isActive": true,
  "createdAt": "serverTimestamp()"
}
```

## Cara buat login admin

### Opsi 1: lewat aplikasi

Pakai ini hanya untuk admin pertama:

1. Jalankan aplikasi.
2. Buka `/setup-admin`.
3. Isi nama, email, password.
4. Submit.
5. Akun akan dibuat di Firebase Authentication dan otomatis dibuatkan dokumen di collection `admins`.

Sesudah itu login normal lewat `/admin/login`.

### Opsi 2: lewat Firebase Console

1. Buka Firebase Console.
2. Authentication -> Sign-in method -> aktifkan `Email/Password`.
3. Authentication -> Users -> Add user.
4. Copy `uid` user yang dibuat.
5. Firestore Database -> collection `admins` -> buat dokumen baru dengan ID = `uid`.
6. Isi field sesuai contoh dokumen `admins`.

## Daftar login admin

Login admin tidak disimpan hardcoded di source code. Data login mengikuti akun yang kamu buat sendiri di Firebase Authentication.

Format login:

- Email: email yang dibuat di Authentication
- Password: password yang dibuat di Authentication
- Syarat tambahan: user tersebut harus punya dokumen di collection `admins`

Contoh:

- Email: `admin@kedaicigemuk.com`
- Password: `Rahasia123`

Contoh di atas hanya format. Kalau mau memakainya, buat akun itu di `/setup-admin` atau Firebase Console.

## Aturan keamanan yang disarankan

Aktifkan Email/Password di Firebase Authentication, lalu pakai rules Firestore yang membatasi collection `orders` dan `admins`. Contoh konsep rule:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isActive == true;
    }

    match /orders/{orderId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

Catatan:

- Firestore tidak punya konsep tabel seperti MySQL. Yang dipakai adalah collection dan document.
- Collection `orders` dan `admins` akan muncul otomatis saat dokumen pertama berhasil dibuat.

## Jika muncul "Missing or insufficient permissions"

Error ini biasanya berarti rules Firestore kamu masih menolak akses.

Yang harus kamu lakukan:

1. Buka Firebase Console.
2. Masuk ke `Firestore Database`.
3. Buka tab `Rules`.
4. Ganti isi rules dengan isi file `firestore.rules` di project ini.
5. Publish rules.

Atau kalau pakai Firebase CLI:

```bash
firebase login
firebase use kedai-cigemuk
firebase deploy --only firestore:rules
```

Hal penting:

- Order dari halaman publik butuh izin `create` ke collection `orders`.
- Dashboard admin butuh izin `read`, `update`, `delete` ke `orders`.
- Login admin saja tidak cukup. User login itu juga harus punya dokumen di collection `admins`.
- Kalau collection `admins` belum ada, buat admin pertama dulu lewat `/setup-admin`.
