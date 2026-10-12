# Panduan Deployment ke GitHub & Vercel

Aplikasi **Mechanic Point & Acceleration Dashboard** telah dikonfigurasi agar dapat dideploy tanpa error ke **Vercel** maupun **GitHub Pages**.

---

## 1. Deploy ke Vercel (Rekomendasi untuk Full-Stack AI)

Vercel mendukung penuh antarmuka frontend Vite dan fungsi backend serverless AI (`/api/*`).

### Langkah-langkah:
1. Push repository Anda ke GitHub.
2. Buka [Vercel Dashboard](https://vercel.com/) dan klik **"Add New Project"** > **Import Git Repository**.
3. Vercel akan otomatis mendeteksi konfigurasi melalui file `vercel.json` yang telah disediakan:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - Tambahkan Environment Variable:
     - `GEMINI_API_KEY`: *(Masukkan kunci API Google Gemini Anda dari Google AI Studio)*
5. Klik **Deploy**. Selesai!

---

## 2. Deploy ke GitHub Pages (Static Hosting)

Karena GitHub Pages merupakan hosting file statis:
- File `vite.config.ts` telah disetel dengan `base: './'` agar seluruh file CSS dan JavaScript biner dapat dimuat dengan path relatif tanpa error 404.
- Fitur analisis AI telah dilengkapi dengan **Resilient Local Intelligence Engine**, sehingga tetap berfungsi normal meskipun dihosting secara statis tanpa server Node.js aktif.

### Menggunakan GitHub Actions (Otomatis):
1. Buka repository Anda di GitHub.
2. Masuk ke tab **Settings** > **Pages**.
3. Pada bagian **Build and deployment** > **Source**, pilih **GitHub Actions**.
4. File `.github/workflows/deploy.yml` yang telah disediakan akan otomatis mem-build dan mempublikasikan dashboard setiap kali Anda push ke branch `main` atau `master`.

---

## 3. Verifikasi Build Lokal

Sebelum melakukan push ke Git, Anda dapat memverifikasi build kapan saja di terminal:
```bash
npm run build
```
Build akan menghasilkan output direktori `dist/` yang siap dideploy.
