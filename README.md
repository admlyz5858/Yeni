# KPSS Çalışma Uygulaması

KPSS sınavına hazırlık için test çözme uygulaması. Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık ve Güncel Konular kategorilerinde sorular içerir.

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
├── screens/          # Ana Sayfa, Quiz, Sonuç ekranları
├── data/
│   └── questions.ts  # KPSS soruları (kategorilere göre)
├── app.json          # Expo yapılandırması
├── assets/           # Görseller ve ikonlar
├── eas.json          # EAS Build yapılandırması
└── package.json
```
