# KPSS Planlama Uygulaması

KPSS sınavına hazırlık için gelişmiş planlama uygulaması.

**Özellikler:**
- 📅 Sınav geri sayımı
- 📊 Çalışma istatistikleri (seri, haftalık/bugünkü saat)
- 📋 Konu ilerleme + **konu notları**
- 📝 Çalışma günlüğü (günlük saat kaydı)
- ⏱️ **Pomodoro zamanlayıcı** (25 dk odaklanma, 5 dk mola)
- 📆 Haftalık program (günlere ders ekleme/çıkarma)
- 🎯 Hedef belirleme (sınav tarihi, günlük hedef)
- 🌙 **Koyu/Açık tema**
- 👋 **Hoş geldin ekranı** (onboarding)
- ⚙️ Ayarlar (tema, onboarding tekrar)
- 💾 Veriler cihazda saklanır (AsyncStorage)

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
