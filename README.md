# KPSS Planlayıcı

KPSS müfredat takip ve odaklanma uygulaması. Expo (React Native) + Supabase ile yazılmıştır; iOS, Android ve Web üzerinde çalışır.

- 🎯 Müfredat takibi (GY, GK, Eğitim Bilimleri)
- ⏱️ Pomodoro tarzı odaklanma
- 📊 İstatistik ve günlük hedefler
- 🔐 E-posta, Google ve Apple ile giriş
- ☁️ Supabase backend + RLS + senkronizasyon
- 📱 Offline-first (AsyncStorage)

Ayrıntılı geliştirme planı için → [`ROADMAP.md`](./ROADMAP.md)

---

## İçindekiler

- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Supabase Şeması](#supabase-şeması)
- [Auth Akışı](#auth-akışı)
- [Komutlar](#komutlar)
- [Yapılacaklar (Kapsamlı Liste)](#yapılacaklar-kapsamlı-liste)
- [Katkı](#katkı)
- [Lisans](#lisans)

---

## Hızlı Başlangıç

```bash
# 1) Bağımlılıklar
cd app
npm install

# 2) Ortam değişkenleri
cp .env.example .env
# .env dosyasını kendi Supabase ve Google OAuth değerlerinle doldur

# 3) Geliştirme sunucusu
npm start

# Seçenekler
# a = Android   i = iOS   w = Web
```

Telefonda test: [Expo Go](https://expo.dev/client) → QR kod.

---

## Özellikler

### Ürün
- **Müfredat**: Genel Yetenek (Türkçe, Matematik, Geometri), Genel Kültür (Tarih, Coğrafya, Vatandaşlık, Güncel), Eğitim Bilimleri (8 alt ders) — tüm konu listeleriyle.
- **Konu Durumu**: Başlanmadı / Çalışılıyor / Tekrar / Tamamlandı.
- **Soru Sayacı**: Konu başına çözülen, doğru, başarı yüzdesi.
- **Not Alma**: Her konuda serbest not.
- **Pomodoro**: Özelleştirilebilir odak/mola süreleri, konu seçerek çalışma, titreşim geri bildirimi.
- **Günlük Hedef**: Dakika bazlı günlük hedef, ilerleme çubuğu, seri gün sayacı.
- **İstatistikler**: Bugün/hafta/toplam süre, haftalık mini bar grafiği, bölüm bazlı ilerleme.
- **KPSS Türü**: Lisans, Önlisans, Ortaöğretim, Eğitim Bilimleri.

### Kimlik & Senkronizasyon
- **E-posta / Şifre**: Kayıt (e-posta doğrulaması), giriş, şifre sıfırlama.
- **Google ile Giriş**: `expo-auth-session` → id_token + nonce → Supabase.
- **Apple ile Giriş (iOS)**: `expo-apple-authentication` → identity token → Supabase.
- **Offline-first**: Tüm değişiklikler önce `AsyncStorage`'a, sonra Supabase'e yazılır.
- **Çok Cihaz**: Oturum açılan her cihazda aynı veriye erişim.

---

## Teknoloji Yığını

| Katman | Araç |
| --- | --- |
| Framework | Expo (React Native) |
| Dil | TypeScript (strict) |
| UI | React Native + özel tema |
| Navigation | `@react-navigation/bottom-tabs` + `native-stack` |
| Depolama (yerel) | `@react-native-async-storage/async-storage` |
| Backend | Supabase (Postgres + Auth + RLS) |
| OAuth | `expo-auth-session`, `expo-apple-authentication` |
| Haptik | `expo-haptics` |
| Derin Link | `expo-linking` (`kpssplanlayici://`) |

---

## Proje Yapısı

```
.
├── README.md
├── ROADMAP.md
└── app/
    ├── App.tsx                 # AuthProvider > AppProvider > RootNavigator
    ├── app.config.ts           # Expo config (scheme, bundle id, env → extra)
    ├── .env.example            # Ortam değişkenleri örneği
    ├── assets/                 # İkon ve splash görselleri
    └── src/
        ├── components/         # Card, Button, ProgressBar, Header, StatusPill
        ├── context/
        │   ├── AuthContext.tsx # Supabase auth (email, Google, Apple)
        │   └── AppContext.tsx  # Global durum + offline + Supabase sync
        ├── data/
        │   └── curriculum.ts   # KPSS müfredat verisi
        ├── lib/
        │   ├── supabase.ts     # Supabase client + AsyncStorage
        │   ├── remote.ts       # Profil / topic_progress / sessions CRUD
        │   └── googleConfig.ts # Google OAuth client id'leri
        ├── navigation/
        │   └── RootNavigator.tsx  # Auth stack + Main tabs
        ├── screens/
        │   ├── auth/
        │   │   ├── SignInScreen.tsx
        │   │   ├── SignUpScreen.tsx
        │   │   └── ForgotPasswordScreen.tsx
        │   ├── DashboardScreen.tsx
        │   ├── CurriculumScreen.tsx
        │   ├── SubjectDetailScreen.tsx
        │   ├── TopicDetailScreen.tsx
        │   ├── FocusScreen.tsx
        │   ├── StatsScreen.tsx
        │   └── SettingsScreen.tsx
        ├── storage/            # AsyncStorage katmanı + tipler
        ├── theme/              # colors, spacing
        └── utils/              # format, stats
```

---

## Ortam Değişkenleri

`app/.env.example` dosyasını `app/.env` olarak kopyala ve doldur:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxmlumvbvmcbrklqzsma.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# Google OAuth (Google Cloud Console > OAuth 2.0 Client IDs)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

> **Not:** Supabase URL ve anon key `app.config.ts` içinde varsayılan olarak tanımlıdır; kendi Supabase projenle değiştirmek istersen `.env` ile geçersiz kılabilirsin.

### Google ile Giriş Kurulumu

1. Google Cloud Console → OAuth 2.0 Client IDs altında şu üç tipi oluştur:
   - **iOS** (bundle id: `com.yeniuygulama.app`)
   - **Android** (paket adı + SHA-1 fingerprint)
   - **Web** (redirect URI olarak Supabase callback URL'ini ekle: `https://<PROJECT>.supabase.co/auth/v1/callback`)
2. Üç ID'yi `.env` dosyasına yaz.
3. Supabase Dashboard → Authentication → Providers → Google → etkinleştir, yukarıdaki Client ID'leri ekle.
4. **Skip nonce check** kapalı kalsın (uygulama nonce + hash kullanıyor).

### Apple ile Giriş Kurulumu

1. Apple Developer Portal'da Services ID oluştur, Sign in with Apple'ı etkinleştir.
2. Return URL: `https://<PROJECT>.supabase.co/auth/v1/callback`.
3. Supabase Dashboard → Authentication → Providers → Apple → Services ID ve Key bilgilerini gir.
4. `app.config.ts` zaten `usesAppleSignIn: true` ayarlıdır. **Gerçek iOS cihazında** test edilmelidir.

---

## Supabase Şeması

```
public.profiles (RLS: sahip)
  id uuid PK → auth.users.id
  first_name text, email text
  track text CHECK (lisans|onlisans|ortaogretim|egitim)
  daily_goal_minutes int, focus_minutes int, break_minutes int
  haptics_enabled bool, onboarding_completed bool, updated_at timestamptz

public.topic_progress (RLS: sahip)
  PK (user_id, topic_id)
  status, questions_solved, correct_answers, notes, study_seconds, last_studied_at

public.study_sessions (RLS: sahip)
  id uuid PK, user_id, topic_id, subject_id
  duration_seconds, mode (focus|manual)
  start_time, end_time, focus_score, created_at
```

`on_auth_user_created` trigger'ı yeni Supabase kullanıcısını otomatik olarak `public.profiles`'a ekler, `email` ve `first_name` meta verisini kopyalar.

---

## Auth Akışı

```
[Açılış]
   │
   ├── Oturum var mı?  (supabase.auth.getSession)
   │      │                  │
   │      │ Evet              │ Hayır
   │      ▼                  ▼
   │   Main Tabs          Auth Stack
   │                          │
   │                          ├── SignIn  ── (email/password | Google | Apple)
   │                          ├── SignUp  ── (email + doğrulama maili)
   │                          └── ForgotPassword ── (sıfırlama maili)
   │
   └── onAuthStateChange ile dinamik geçiş
```

Oturum açılınca `AppContext` `fetchRemoteState` ile profil + topic_progress + son 500 session çeker, UI'yı hydrate eder. Tüm değişiklikler **önce yerel reducer'a**, sonra Supabase'e yazılır.

---

## Komutlar

```bash
# Geliştirme
npm start                 # Metro + DevTools
npm run android           # Android cihaz/emülatör
npm run ios               # iOS simülatör (macOS)
npm run web               # Web (localhost)

# Tip kontrolü
npx tsc --noEmit

# Android APK
npm run build:apk
# Çıktı: app/android/app/build/outputs/apk/release/app-release.apk
```

---

## Yapılacaklar (Kapsamlı Liste)

> Tam detay ve teknik açıklamalar için → [`ROADMAP.md`](./ROADMAP.md).
> Aşağıda özet kontrol listesi halinde sıralanmıştır.

### ✅ Tamamlananlar (Faz 0)
- [x] Expo (RN) iskeleti, TypeScript strict
- [x] KPSS müfredat verisi (GY / GK / EB)
- [x] Konu durumu, soru sayacı, notlar
- [x] Pomodoro odaklanma (temel)
- [x] İstatistik ekranı (temel grafik)
- [x] Ayarlar (KPSS türü, süreler, hedef)
- [x] Supabase şeması (profiles, topic_progress, study_sessions, RLS, trigger)
- [x] E-posta ile kayıt/giriş + şifre sıfırlama
- [x] Google ile giriş (id_token + nonce)
- [x] Apple ile giriş (iOS)
- [x] Offline-first sync (AsyncStorage ↔ Supabase)

### 🟡 Faz 1 — Kimlik & Onboarding Cilalama
- [ ] 3–4 adımlık onboarding ekranları (KPSS türü, hedef, süreler)
- [ ] `profiles.onboarding_completed` akışı
- [ ] Profil düzenleme ekranı (`first_name`, hedef sınav tarihi, avatar)
- [ ] Supabase Storage `avatars` bucket + RLS
- [ ] Şifre değiştirme ekranı
- [ ] E-posta doğrulama deep link geri dönüş
- [ ] "Yeni Şifre Belirle" deep link ekranı (`kpssplanlayici://reset`)
- [ ] Supabase e-posta şablonları TR
- [ ] Leaked password protection aç (Supabase advisor)

### 🟡 Faz 2 — Müfredat & Plan Motoru
- [ ] Konulara meta veri (`estimatedMinutes`, `difficulty`, `examWeight`, `prerequisites`)
- [ ] Kaynak linkleri (`resourceLinks[]`)
- [ ] Sınav tarihi alanı
- [ ] `src/lib/planner.ts` — haftalık plan üretici
- [ ] "Bu hafta" kartı
- [ ] `public.daily_tasks` tablosu + günlük plan ekranı
- [ ] Plan yenileme cron (Edge Function + pg_cron)
- [ ] `public.custom_topics` (kullanıcı kendi konusu)

### 🟡 Faz 3 — Odaklanma Deneyimi
- [ ] Arkaplan zamanlayıcı (iOS Live Activity, Android Foreground Service)
- [ ] `expo-av` ile odak sesi (yağmur/white noise/lofi)
- [ ] "Derin Odak" modu
- [ ] Pomodoro preset yönetimi
- [ ] Odak puanı (bölünme analizi)
- [ ] Seans sonu özet kartı
- [ ] Otomatik tekrar önerisi

### 🟡 Faz 4 — İstatistik
- [ ] Heatmap (contribution grid)
- [ ] Bölüm radar chart
- [ ] Konu bazlı başarı trendi (line chart)
- [ ] Bu hafta vs geçen hafta karşılaştırma
- [ ] En zayıf / en ihmal edilen konular
- [ ] PDF/CSV veri dışa aktarım

### 🟡 Faz 5 — Bildirimler
- [ ] `expo-notifications` + izin akışı
- [ ] Yerel: günlük hedef, mola bitti, seans bitti, sınava kalan gün
- [ ] Expo push token + `public.push_tokens`
- [ ] Edge Function — push gönderimi
- [ ] Spaced repetition (`next_review_at`) 3/7/21 gün

### 🟡 Faz 6 — Soru Bankası & Quiz
- [ ] `public.questions`, `public.question_attempts` tabloları
- [ ] Konu quiz'i (10/20 soru)
- [ ] Mini test (rastgele 20)
- [ ] Deneme sınavı (120 soru, 135 dk)
- [ ] Sonuç raporu + yanlış tekrarı
- [ ] İçerik yönetimi (admin panel veya Studio)

### 🟡 Faz 7 — AI Yardımcı
- [ ] Supabase Edge Function (OpenAI/Anthropic)
- [ ] Konu AI özeti
- [ ] Quiz yanlış cevap AI açıklaması
- [ ] Soru üretici (moderasyondan geçmek şartıyla)
- [ ] "KPSS koçu" chat
- [ ] Kullanıcı opt-in + rate limit

### 🟡 Faz 8 — Sosyal & Motivasyon
- [ ] Rozet sistemi (`achievements`, `user_achievements`)
- [ ] Haftalık liderlik tablosu (opt-in)
- [ ] Çalışma grupları (`groups`, `group_members`)
- [ ] Streak kırılma uyarıları, motivasyon mesajları

### 🟡 Faz 9 — Çevrimdışı & Senkronizasyon
- [ ] Mutation queue (retry + exponential backoff)
- [ ] `updated_at` tabanlı last-write-wins çatışma çözümü
- [ ] Supabase Realtime ile canlı çok-cihaz senkron
- [ ] Yerel cache sınırlandırma

### 🟡 Faz 10 — Güvenlik & KVKK
- [ ] Tüm yeni tablolar için RLS denetimi
- [ ] Aydınlatma metni + açık rıza ekranı
- [ ] Hesap silme (RPC + Edge Function)
- [ ] Veri indirme (JSON/CSV)
- [ ] Web CSP, HSTS, OAuth redirect whitelist
- [ ] AI/push endpoint rate-limit

### 🟡 Faz 11 — Kalite
- [ ] Unit test (`src/lib`, reducer, `utils/stats`)
- [ ] Component test (`@testing-library/react-native`)
- [ ] E2E (Maestro veya Detox)
- [ ] ESLint + Prettier + Husky + lint-staged
- [ ] GitHub Actions CI (lint + tsc + test + expo export)
- [ ] Sentry entegrasyonu
- [ ] `src/lib/logger.ts`

### 🟡 Faz 12 — Yayınlama
- [ ] App icon + splash (prod kalite)
- [ ] Store açıklamaları ve ekran görüntüleri (TR + EN)
- [ ] Gizlilik politikası + kullanım şartları sayfaları
- [ ] EAS Build profilleri (production)
- [ ] iOS TestFlight
- [ ] Android Play Internal Test
- [ ] `expo-updates` OTA kanalları
- [ ] Web: Vercel/Netlify deploy + Supabase redirect whitelist

### 💡 Uzun Vade
- [ ] ALES, YDS, DGS modülleri
- [ ] Discord/Jitsi çalışma odaları
- [ ] Takvim entegrasyonu (Google/Apple Calendar)
- [ ] iOS/Android ana ekran widget'ı
- [ ] watchOS Pomodoro
- [ ] Offline-first PWA (service worker + IndexedDB)

---

## Katkı

1. Branch oluştur: `git checkout -b feature/<kısa-açıklama>`
2. Komut satırında TypeScript kontrolünü çalıştır: `npx tsc --noEmit`
3. Küçük, odaklanmış PR'lar aç (<400 satır diff).
4. Faz 11 sonrası: test yazmadan merge yok.

Sorun bildirimi için GitHub Issues kullan; yeni özellik için önce `ROADMAP.md`'den ilgili fazı kontrol et.

---

## Lisans

Bu proje özel / eğitim amaçlıdır. Lisans seçimi yapılana kadar tüm hakları saklıdır.
