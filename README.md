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
3. **SQL Editor** → Aşağıdaki migration dosyalarını sırayla çalıştırın:
   - `supabase/migrations/20250321000001_profiles.sql`
   - `supabase/migrations/20250322000002_backend.sql`
4. **Authentication → Providers** → Email açık olduğundan emin ol
5. `app/` klasöründe `.env` oluştur (`.env.example`'dan kopyala) ve değerleri yapıştır
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

**GitHub Actions:** APK otomatik derlenir. Supabase ile derleme için repo Secrets'a `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_ANON_KEY` ekleyin.

## Google Play Store

Uygulama mağaza yayınına hazırdır:
- **Hakkında ekranı:** Sürüm, puanla, paylaş, gizlilik politikası, geri bildirim
- **In-app review:** Uygulamayı Puanla (native Store Review API)
- **Gizlilik politikası:** [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- **Mağaza listeleme rehberi:** [STORE_LISTING.md](STORE_LISTING.md)

## Proje Yapısı

```
app/
├── App.tsx            # Ana uygulama + navigasyon
├── context/           # Auth, Plan, Theme, Gamification, Game, Premium, Subjects, Flashcard
├── screens/           # Home, Plan, Schedule, Goals, StudyLog, Subjects, Focus, ...
├── constants/
│   └── store.ts       # PLAY_STORE_URL, PRIVACY_POLICY_URL, FEEDBACK_EMAIL (yayın öncesi güncelle)
├── app.json           # Expo yapılandırması
├── assets/            # Görseller
└── package.json
```

## Yayın Öncesi Kontrol

- `app/constants/store.ts`: `FEEDBACK_EMAIL` ve `PRIVACY_POLICY_URL` güncelleyin
- Sıralama ve Çalışma Grupları: Şu an simüle veri kullanır (gerçek backend için Supabase tabloları eklenebilir)
