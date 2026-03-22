# Çalışma Asistanı

Her sınava hazırlık için genel çalışma planlama uygulaması.

**Özellikler:**

**Üye Paneli:**
- 📚 **Derslerim:** Kendi ders ve konularınızı ekleyin/düzenleyin
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

**Kimlik Doğrulama (Supabase):**
- Gerçek kullanıcı kayıt ve giriş
- Şifremi unuttum (e-posta ile sıfırlama)
- Rol tabanlı erişim (admin / üye)
- Supabase yapılandırması gereklidir (.env)

Expo (React Native) ile oluşturulmuş cross-platform mobil uygulama. iOS ve Android'de çalışır.

## Supabase Kurulumu (Zorunlu)

Gerçek kullanıcı girişi için Supabase gereklidir:

1. [supabase.com](https://supabase.com) → Yeni proje oluştur
2. **Settings → API** → `URL` ve `anon public` key'i kopyala
3. **SQL Editor** → `supabase/migrations/20250321000001_profiles.sql` içeriğini yapıştır ve çalıştır
4. **Authentication → Providers** → Email açık olduğundan emin ol
5. Proje kökünde `.env` oluştur (`.env.example`'dan kopyala) ve değerleri yapıştır
6. İlk admin: SQL Editor'da `UPDATE public.profiles SET role = 'admin' WHERE email = 'sizin@email.com';`

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

**Play Store için AAB:** `npm run build:aab` → `android/app/build/outputs/bundle/release/app-release.aab`

**Gereksinimler:** Android SDK (ANDROID_HOME) ve Java 17+

## Google Play Store

Uygulama mağaza yayınına hazırdır:
- **Hakkında ekranı:** Sürüm, puanla, paylaş, gizlilik politikası, geri bildirim
- **In-app review:** Uygulamayı Puanla (native Store Review API)
- **Gizlilik politikası:** [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- **Mağaza listeleme rehberi:** [STORE_LISTING.md](STORE_LISTING.md)

## Proje Yapısı

```
app/
├── App.tsx           # Ana uygulama + navigasyon
├── context/
│   ├── PlanContext    # State + AsyncStorage persistence
│   └── SubjectsContext # Kullanıcı tanımlı ders/konular
├── screens/           # Home, Plan, Schedule, Goals, StudyLog, Subjects, ...
├── app.json          # Expo yapılandırması
├── assets/           # Görseller
├── eas.json          # EAS Build
└── package.json
```
