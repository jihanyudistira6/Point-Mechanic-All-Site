# Panduan Deployment ke GitHub & Vercel (Teruji & Bebas Error)

Semua konfigurasi build untuk **Vercel** dan **GitHub Pages** telah disinkronkan dan diuji:

---

## Solusi Error Sebelumnya:
1. **Penyebab Error GitHub Actions (10 Detik)**:
   - Terjadi karena konflik versi `esbuild` vs `vite 8` saat menjalankan instalasi dependensi, serta ketiadaan file `package-lock.json`.
   - **Solusi**: File `package-lock.json` telah dibuat, `package.json` diperbarui dengan `esbuild: ^0.28.0`, dan dibuat file `.npmrc` dengan `legacy-peer-deps=true`. File workflow `.github/workflows/deploy.yml` kini menggunakan `npm install --legacy-peer-deps`.

2. **Penyebab Error Vercel**:
   - Vercel mendeteksi direktori `api/` sebagai serverless function yang tidak lengkap.
   - **Solusi**: `vercel.json` telah disederhanakan sebagai Vite Single Page Application murni (`outputDirectory: "dist"`), dan modul AI dirancang menggunakan sistem resilient client-side & server hybrid sehingga dapat berjalan statis di Vercel maupun GitHub Pages.

---

## 1. Deploy ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/) dan pilih project Anda.
2. Klik **Redeploy** (atau lakukan `git push` ulang).
3. Vercel akan otomatis mendeteksi:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deployment akan selesai dengan status **Ready / Success**.

---

## 2. Deploy ke GitHub Pages

1. Buka repository Anda di GitHub.
2. Masuk ke **Settings** > **Pages**.
3. Di bagian **Build and deployment** > **Source**, pilih **GitHub Actions**.
4. Lakukan `git push` ke branch `main`.
5. Buka tab **Actions** di GitHub, workflow `Deploy to GitHub Pages` akan berjalan sukses dan memberikan URL website Anda.
