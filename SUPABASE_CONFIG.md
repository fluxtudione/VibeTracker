# Konfigurasi Supabase untuk VibeTracker

## Problem: Email Konfirmasi Redirect ke localhost:3000

### Solusi: Konfigurasi Redirect URLs di Supabase Dashboard

1. **Buka Supabase Dashboard**
   - Pergi ke: https://supabase.com/dashboard
   - Pilih project: `tenjxchuwlakecinmqle`

2. **Konfigurasi Site URL dan Redirect URLs**
   - Pergi ke: **Authentication** → **URL Configuration**
   
3. **Update Site URL**
   - Ubah Site URL menjadi: `vibetracker://`
   
4. **Tambahkan Redirect URLs**
   Tambahkan URLs berikut di bagian **Redirect URLs**:
   ```
   vibetracker://*
   exp://localhost:8081/*
   exp://192.168.x.x:8081/*
   ```
   *(Ganti 192.168.x.x dengan IP lokal Anda jika perlu testing di device fisik)*

5. **Save Changes**

## Penjelasan URL Scheme

- `vibetracker://` - Custom URL scheme yang didefinisikan di `app.json`
- Deep link ini akan membuka aplikasi Anda setelah email konfirmasi diklik
- Expo Router secara otomatis menangani routing dari deep link

## Testing Email Verification

Setelah konfigurasi:
1. Sign up dengan email baru
2. Cek inbox email Anda
3. Klik link konfirmasi di email
4. Aplikasi VibeTracker akan terbuka otomatis
5. User akan di-redirect ke halaman home

## Troubleshooting

Jika masih redirect ke localhost:
- Pastikan Anda sudah save configuration di Supabase Dashboard
- Rebuild aplikasi: tekan `r` di Expo terminal
- Clear cache: `npx expo start --clear`
