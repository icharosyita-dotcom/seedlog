# SEEDLOG

Aplikasi pemantauan pertumbuhan benih alpukat, dari ditanam, berkecambah, sampai menjadi bibit. Pengamatan dicatat manual oleh pengguna dan didokumentasikan dengan foto dari kamera HP.

- **Tugas:** Pemrograman Bergerak (CPL 10, Sub-CPMK: UI/UX, struktur navigasi, manajemen data, interaksi hardware)
- **Penyusun:** Icha Rosyita (NIM 2305101130), Teknik Informatika, Universitas PGRI Madiun
- **Konteks:** pembibitan alpukat di kebun pribadi, Bendo, Magetan
- **APK:** unduh `app-debug.apk` di [Releases](../../releases/latest)

Versi ini tidak memakai AI, Machine Learning, sensor, maupun IoT. Status pertumbuhan ditentukan sendiri oleh pengguna, dan foto hanya untuk dokumentasi.

## Teknologi

React, Vite, TypeScript, Tailwind CSS, Dexie.js (IndexedDB), vite-plugin-pwa, dan Capacitor untuk membungkus aplikasi menjadi APK Android (dibuka di Android Studio).

## 1. Rancangan UI/UX

- Gaya natural dan minimalis: dominan hijau tua dan hijau muda dengan latar putih atau off-white.
- Kartu bersudut membulat, ikon konsisten (lucide), foto benih sebagai elemen visual utama.
- Mobile-first: tombol minimal 48 px agar mudah disentuh, formulir singkat dengan label jelas.
- Status tidak hanya dibedakan lewat warna, tetapi juga lewat teks.
- Validasi dan pesan kesalahan dalam bahasa Indonesia.

Halaman: Login, Beranda (ringkasan), Kelompok (cari dan filter), Detail kelompok, Form kelompok, Form pengamatan, Riwayat (timeline), Pengaturan.

## 2. Struktur navigasi

Bottom navigation di HP (sidebar di layar lebar) dengan lima menu:

| Menu | Fungsi |
|---|---|
| Beranda | Statistik dari data tersimpan, kelompok dan pengamatan terbaru |
| Kelompok | Daftar kelompok benih, tab Aktif/Arsip, pencarian, filter status |
| Pengamatan | Form catat pengamatan baru |
| Riwayat | Timeline pengamatan, filter per kelompok dan urutan tanggal |
| Pengaturan | Info penyimpanan, ekspor cadangan, keluar |

Alur utama:

```
Login -> Beranda -> Kelompok baru -> Simpan -> Detail kelompok
      -> Tambah pengamatan -> Ambil foto -> Isi status dan catatan -> Simpan -> Riwayat
```

## 3. Manajemen data

Data disimpan lokal di IndexedDB lewat Dexie. Logika data dipisah dari tampilan di `src/services` agar mudah dihubungkan ke API pada pengembangan berikutnya.

| Tabel | Isi utama |
|---|---|
| `seed_groups` | kode (unik), nama, tanggal tanam, jumlah benih, media, lokasi, catatan, status arsip |
| `observations` | `seed_group_id`, tanggal, status pertumbuhan, kondisi, tinggi, catatan |
| `photos` | `seed_group_id`, `observation_id`, `image_blob`, keterangan |
| `users` | nama pengguna dan hash kata sandi (PBKDF2-SHA256 + salt) |

Relasi memakai ID: satu kelompok punya banyak pengamatan dan foto, sehingga data tiap kelompok tidak tercampur.

- Tujuh status: Ditanam, Belum Berkecambah, Mulai Berkecambah, Sudah Berkecambah, Tumbuh Menjadi Bibit, Tidak Berkembang, Perlu Diperiksa.
- Kode kelompok harus unik (contoh ALP-001), divalidasi sebelum simpan.
- Kelompok bisa diarsipkan; hapus permanen meminta konfirmasi dan ikut menghapus pengamatan serta fotonya.
- Ekspor cadangan JSON dari halaman Pengaturan, dan penyimpanan persisten diminta lewat `navigator.storage.persist()`.

## 4. Interaksi hardware: kamera

- Tombol **Ambil foto** membuka kamera belakang HP (`<input type="file" accept="image/*" capture="environment">`); tombol **Dari galeri** sebagai alternatif.
- Ada pratinjau sebelum simpan, serta opsi mengganti dan menghapus foto.
- Format dan ukuran divalidasi (maksimal 15 MB), lalu foto diperkecil (maksimal 1280 px, JPEG) sebelum disimpan sebagai Blob di IndexedDB.
- Foto tetap tampil setelah aplikasi ditutup dan dibuka lagi.

## Instal APK (Android)

1. Buka halaman [Releases](../../releases/latest) dari HP, lalu unduh `app-debug.apk`.
2. Izinkan pemasangan dari sumber tidak dikenal bila diminta, lalu instal.
3. Buka SEEDLOG, buat akun lokal, dan izinkan akses kamera saat diminta.

## Menjalankan dari source code

```powershell
npm install
npm run build
npx cap sync
```

Lalu buka folder `android` di Android Studio (**File > Open**) dan klik **Run**. Untuk versi web saja: `npm run dev`.

## Pengujian

- `npm run build` (pemeriksaan TypeScript dan build produksi) berhasil.
- Logika data (CRUD, kode unik, relasi, arsip, hapus berantai, penyimpanan foto Blob, ekspor) diuji otomatis dengan IndexedDB tiruan: 9 pengecekan lulus.
- Aplikasi dijalankan di emulator Android lewat Android Studio.
- Kamera di HP fisik: belum diuji.

## Batasan

- Data hanya ada di perangkat dan tidak tersinkron antarperangkat. Menghapus data aplikasi menghapus semuanya, jadi unduh cadangan secara berkala.
- Login membatasi akses lewat antarmuka saja, bukan enkripsi data, dan tidak ada pemulihan kata sandi.
- Arsitektur disiapkan untuk pengembangan IoT (ESP32, sensor) pada tahap skripsi, tetapi fitur itu belum diimplementasikan.