# SEEDLOG

PWA pencatatan pertumbuhan benih alpukat (React, Vite, TypeScript, Tailwind CSS, Dexie/IndexedDB, vite-plugin-pwa).

## Menjalankan (PowerShell)
```powershell
npm install
npm run dev        # pengembangan, http://localhost:5173
npm run build      # build produksi + service worker
npm run preview    # uji PWA/offline dari build produksi
```
Opsi instal PWA dan offline hanya berfungsi pada build produksi (`build` + `preview`), bukan `dev`.

## Struktur
- `src/database` skema Dexie · `src/services` logika data (seedService, authService) · `src/pages` halaman
- `src/components` UI bersama · `src/hooks` · `src/utils` · `src/types`

## Pengujian di HP
Kamera langsung dan instal PWA butuh HTTPS (atau localhost). Akses `http://IP-laptop:4173` dari HP akan membuat
login (WebCrypto) gagal. Deploy ke hosting HTTPS gratis (Netlify/Vercel/GitHub Pages) atau gunakan tunnel
(mis. `npx cloudflared tunnel --url http://localhost:4173`), lalu buka di Chrome Android: ambil foto,
instal lewat menu "Instal aplikasi", aktifkan mode pesawat, dan buka kembali.

## Batasan keamanan login
Akun disimpan lokal di IndexedDB (kata sandi di-hash PBKDF2-SHA256 + salt). Ini membatasi akses lewat antarmuka,
bukan enkripsi data: siapa pun yang menguasai perangkat/browser dapat membaca IndexedDB lewat DevTools.
Tidak ada pemulihan kata sandi; menghapus data situs akan menghapus akun beserta seluruh data. Unduh cadangan
JSON di Pengaturan secara berkala. Tidak ada sinkronisasi antarperangkat.
