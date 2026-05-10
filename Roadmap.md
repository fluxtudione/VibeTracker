# Roadmap: Habit Tracker App (Safe Execution Version)

Dokumen ini adalah referensi teknis untuk eksekusi fitur oleh AI/Developer (Roocode). Berisi audit, rencana fitur, dan protokol keamanan Git.

---

## 1. Analisis MVP & Audit UI
- **Home:** Daftar habit dengan status completion.
- **Edit:** Form nama, deskripsi, ikon, warna, dan frekuensi.
- **Profile:** Ringkasan aktivitas dan grafik.
- **Koreksi:** Pastikan *Empty State* pada grafik ditangani dan *Color Coding* sinkron antara Edit & Home.

---

## 2. Rencana Eksekusi Fitur (Execution Plan)

### 🚀 Phase 1: UX Foundations (High Priority)
1. **Smart Reminders:** Implementasi `TimePicker` & `Local Notification`.
2. **Daily Progress Bar:** Komponen visual `(Selesai/Total) * 100`.
3. **Visual Coding:** Hubungkan variabel warna ke UI List.

### 🔥 Phase 2: Retention & Gamification (Medium Priority)
1. **Sistem Streak (🔥):** Logic perhitungan hari berturut-turut.
2. **Heatmap Bulanan:** Grid kalender di tab Profile.

### 💎 Phase 3: Scaling & Pro (Future)
1. **Interactive Widget**, **Cloud Sync**, dan **Dark Mode**.

---

## 3. Protokol Keamanan Git (SOP) - WAJIB DIIKUTI
Agar tidak merusak versi stabil di `main`, ikuti langkah ini:

### A. Alur Kerja Fitur Baru:
1. `git checkout main` (Selalu mulai dari main).
2. `git pull origin main` (Pastikan kode terbaru).
3. `git checkout -b feature/[nama-fitur]` (Buat ruang isolasi).
4. **Eksekusi & Test:** Lakukan coding di branch ini.
5. `git add .` -> `git commit -m "feat: deskripsi"` -> `git push origin feature/[nama-fitur]`.
6. **Merge:** Jika sudah 100% stabil, baru gabungkan ke `main`.

### B. Titik Stabil (Stable Tagging):
Gunakan tag untuk menandai versi yang siap rilis:
- `git tag -a v1.0.0 -m "Versi stabil pertama"`
- `git push origin v1.0.0`

---

## 4. Prosedur Pemulihan (Emergency Recovery SOP)
Jika terjadi error total setelah update, AI/Developer harus:

1. **Gunakan Revert (Jika hanya 1-2 commit salah):**
   `git revert [commit-hash]`
2. **Gunakan Mesin Waktu (Jika hancur total):**
   Balikkan ke tag stabil terakhir:
   `git checkout -b recovery-version v1.0.0`
3. **Emergency Stop:**
   Jika error di production, segera "Halt Rollout" di Play Store/App Store Console.

---

## 5. Catatan Teknis untuk Roocode
- **DB Migration:** Jika ada penambahan kolom (Streak/Reminder), wajib gunakan Database Migration script. Jangan asal ganti skema.
- **State Management:** Pastikan data di Profile terupdate otomatis saat Home dicentang.

---
*Generated as a safe development reference.*
