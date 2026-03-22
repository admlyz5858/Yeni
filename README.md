# KPSS Planlama Uygulaması

KPSS sınavına hazırlık için gelişmiş planlama uygulaması.

**Özellikler:**

**Üye Paneli (KPSS Planlama):**
- 📅 Sınav geri sayımı
- 📊 Çalışma istatistikleri (seri, haftalık/bugünkü saat)
- 📋 Konu ilerleme + konu notları
- 📝 Çalışma günlüğü, ⏱️ Pomodoro
- 📆 Haftalık program, 🎯 Hedefler
- 🌙 Koyu/Açık tema
- **🏆 Gamification:** XP, seviye, 12 rozet
- **📊 Study Heatmap:** GitHub tarzı çalışma aktivitesi
- **🤖 Akıllı Plan:** Hedeflere göre otomatik program
- **📇 Flashcards:** Aralıklı tekrar (SM-2 algoritması)
- **🔔 Bildirimler:** Günlük çalışma hatırlatması
- **👑 Premium:** 5000 XP ile kilidi aç, 9 premium özellik
- **📌 Günlük Aktivite:** Günün görevi, söz, ipucu, giriş bonusu
- **38 Rozet:** Geniş başarı sistemi
- **⏱️ 3 Zamanlayıcı:** 25/5, 50/10, 90/20 dakika
- **Ücretsiz 20 kart** limiti, premium'da sınırsız

**Admin Paneli:**
- 📊 Dashboard (üye sayısı, konu/çalışma istatistikleri)
- 👥 Üye yönetimi (kullanıcı listesi)

**Kimlik Doğrulama:**
- Giriş / Kayıt ekranları
- Rol tabanlı erişim (admin / üye)
- Demo mod: Supabase olmadan çalışır
- admin@admin.com / admin123 (Admin)
- uye@uygulama.com / uyari123 (Üye)

Expo (React Native) ile oluşturulmuş cross-platform mobil uygulama. iOS ve Android'de çalışır.

## Başlangıç

```bash
cd app
npm start
```

Ardından:
- **Android:** `a` tuşuna basın veya `npm run android`
- **iOS:** `i` tuşuna basın veya `npm run ios` (macOS gerekir)
- **Web:** `w` tuşuna basın veya `npm run web`

## Gereksinimler

- Node.js 18+
- Android Studio (Android emulator için) veya fiziksel cihaz
- Expo Go uygulaması (fiziksel cihazda test için)

## APK Derleme

```bash
cd app
npm run build:apk
```

APK dosyası: `app/android/app/build/outputs/apk/release/app-release.apk`

**Gereksinimler:** Android SDK (ANDROID_HOME) ve Java 17+

## Proje Yapısı

```
app/
├── App.tsx           # Ana uygulama + navigasyon
├── context/
│   └── PlanContext   # State + AsyncStorage persistence
├── screens/          # Home, Plan, Schedule, Goals, StudyLog
├── data/
│   └── subjects.ts  # KPSS konuları
├── app.json          # Expo yapılandırması
├── assets/           # Görseller
├── eas.json          # EAS Build
└── package.json
```
