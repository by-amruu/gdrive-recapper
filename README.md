# GDrive Media Recapper 📸⚡

[![Deploy to GitHub Pages](https://github.com/by-amruu/gdrive-recapper/actions/workflows/deploy.yml/badge.svg)](https://github.com/by-amruu/gdrive-recapper/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-emerald.svg)](https://vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-cyan.svg)](https://tailwindcss.com/)
[![Built with Vite](https://img.shields.io/badge/Vite-v8.3-purple.svg)](https://vitejs.dev/)

> **Aplikasi web previewer & media picker Google Drive modern berestetika Light Semi Neo-Brutalism.**  
> Dirancang khusus untuk mempermudah divisi Media & Kreatif / PDD (Publikasi, Dokumentasi, Desain) organisasi kampus dalam menyortir, membandingkan, serta mengunduh foto dan video dari ribuan aset dokumentasi acara untuk materi konten Instagram (Feed/Reels/Stories).

🌐 **Demo Live:** [https://by-amruu.github.io/gdrive-recapper/](https://by-amruu.github.io/gdrive-recapper/)

---

## ✨ Fitur Unggulan

- 📂 **Auto-Fetch Google Drive Folder & Subfolder Explorer**  
  Cukup masukkan tautan folder Google Drive publik, aplikasi langsung memuat seluruh file foto dan video di dalamnya. Dilengkapi sistem navigasi subfolder bersarang (breadcrumbs navigation).
- 🍱 **Bento Masonry Dynamic Layout**  
  Tata letak fleksibel tanpa crop yang mempertahankan rasio aspek asli (landscape, portrait, square) dari setiap foto dokumentasi.
- ☑️ **Multi-Selection & Batch Download (.ZIP)**  
  Pilih foto-foto terbaik dengan satu klik centang, lalu unduh sekaligus dalam satu paket `.zip` terkompresi langsung di browser pengguna tanpa perantara server pihak ketiga.
- 🖼️ **Native High-Res Image Preview**  
  Preview layar penuh resolusi tinggi mandiri dengan kontrol keyboard (`←`, `→`, `ESC`, dan `Space`). Menghindari pengalihan halaman ke antarmuka Google Drive.
- ⊟ **Split-Screen Comparison**  
  Bandingkan dua foto atau video kandidat secara berdampingan untuk menentukan bidikan terbaik yang layak masuk konten recap.
- ⚡ **GSAP Micro-Interactions**  
  Animasi transisi pemuatan gambar dan shimmer skeleton menggunakan GreenSock (GSAP) untuk kenyamanan visual maksimal.
- 🎨 **Clean Light Semi Neo-Brutalism UI**  
  Kombinasi kanvas cerah retro modern, aksen warna neo kontras, dan modal interaktif menggantikan alert browser default.
- 🧹 **Manajemen Cache Mutlak**  
  Fitur pembersihan total penyimpanan lokal dan browser cache dalam satu sentuhan.

---

## 🛠️ Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animation:** [GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/)
- **Archiving:** [JSZip](https://stuk.github.io/jszip/)
- **Bundler / Dev Server:** [Vite](https://vitejs.dev/)
- **API:** Google Drive REST API v3

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat berkas [`LICENSE`](LICENSE) untuk informasi lebih lanjut.

---

## 👨‍💻 Kontributor & Kredit

Dibuat dan dikembangkan oleh **[@by.amruu](https://instagram.com/by.amruu)** untuk mendukung efisiensi dokumentasi kreatif organisasi dan civitas akademika kampus.
