# KPSS Planlayıcı

KPSS müfredat takip ve odaklanma uygulaması. Expo (React Native) + Supabase ile yazılmış; iOS, Android ve Web üzerinde çalışır. E-posta ile kayıt / giriş, Google ile giriş ve iOS'ta "Apple ile Giriş" desteği vardır. Tüm kullanıcı verileri Supabase üzerinde senkronize tutulur, çevrimdışı için cihazda da saklanır.

## Özellikler

### Ürün
- **Müfredat Takibi**: Genel Yetenek (Türkçe, Matematik, Geometri), Genel Kültür (Tarih, Coğrafya, Vatandaşlık, Güncel) ve Eğitim Bilimleri (Gelişim, Öğrenme, Rehberlik, Ölçme, Program, Öğretim İlke-Yöntem, Teknoloji, Sınıf Yönetimi) konularının tam listesi.
- **Konu Durumu**: Başlanmadı / Çalışılıyor / Tekrar / Tamamlandı.
- **Soru Sayacı**: Konu bazında çözülen soru, doğru sayısı, otomatik başarı yüzdesi.
- **Not Alma**: Her konuya kısa notlar.
- **Odaklanma (Pomodoro)**: Özelleştirilebilir odak + mola süreleri, konu seçerek odaklanma, titreşim geri bildirimi.
- **Günlük Hedef**: Günlük dakika hedefi, seri gün sayacı, haftalık grafik, bölüm bazlı ilerleme.
- **KPSS Türü**: Lisans, Önlisans, Ortaöğretim, Eğitim Bilimleri.

### Backend & Auth
- **Supabase Backend**: `profiles`, `topic_progress`, `study_sessions` tabloları, RLS politikaları, yeni kullanıcı trigger'ı.
- **E-posta ile Kayıt & Giriş**: Doğrulamalı kayıt ve şifre sıfırlama akışı.
- **Google ile Giriş**: iOS / Android / Web için OAuth 2.0 (id_token + nonce).
- **Apple ile Giriş**: iOS'ta `expo-apple-authentication` üzerinden.
- **Offline-first Sync**: Değişiklikler önce cihaza (`AsyncStorage`), sonra Supabase'e yazılır. Oturum açıldığında remote'tan veri çekilir.

## Supabase Şeması

```
public.profiles (RLS: yalnızca sahip)
  id uuid PK (-> auth.users.id)
  first_name text, email text
  track text CHECK lisans/onlisans/ortaogretim/egitim
  daily_goal_minutes int, focus_minutes int, break_minutes int
  haptics_enabled bool, onboarding_completed bool, updated_at timestamptz

public.topic_progress (RLS: yalnızca sahip)
  PK (user_id, topic_id)
  status, questions_solved, correct_answers, notes, study_seconds, last_studied_at

public.study_sessions (RLS: yalnızca sahip)
  id uuid PK, user_id, topic_id, subject_id,
  duration_seconds, mode (focus|manual),
  start_time, end_time, focus_score, created_at
```

`on_auth_user_created` trigger'ı yeni Supabase kullanıcısını `public.profiles`'a ekler ve e-posta/ad meta verisini kopyalar.

## Ortam Değişkenleri

`app/.env.example` dosyasını `app/.env` olarak kopyala ve doldur:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxmlumvbvmcbrklqzsma.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# Google OAuth (opsiyonel, olmazsa buton uyarı verir)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
```

Supabase URL/anon key Cloud Agent sırasında `app.config.ts` içinde varsayılan olarak set edildi; yerel Supabase projen varsa `.env` ile geçersiz kılabilirsin.

## Kurulum & Çalıştırma

```bash
cd app
npm install
npm start
```

- **Android**: `a` tuşu veya `npm run android`
- **iOS**: `i` tuşu veya `npm run ios` (macOS + Xcode gerekir)
- **Web**: `w` tuşu veya `npm run web`

Telefonda test için [Expo Go](https://expo.dev/client) + QR.

### Google ile Giriş için Kurulum

Supabase Dashboard → Authentication → Providers → Google'ı aç ve **Client IDs** listesine şu client ID'leri ekle:

1. **Web Client ID** (web ve varsayılan fallback)
2. **iOS Client ID** (`com.yeniuygulama.app` bundle id ile)
3. **Android Client ID** (SHA-1 fingerprint ile)

`Skip nonce check` kapalı kalsın (uygulamada nonce + hash kullanılıyor). Kimlikleri `.env` dosyasına ekle; uygulama giriş ekranındaki Google butonu otomatik etkinleşir.

### Apple ile Giriş için Kurulum

- Supabase Dashboard → Authentication → Providers → Apple'ı aç.
- Apple Developer'da Services ID ekleyip Supabase'in verdiği callback'i yaz: `https://xxmlumvbvmcbrklqzsma.supabase.co/auth/v1/callback`
- `app.config.ts` zaten `usesAppleSignIn: true` ayarlı. Gerçek cihazda test edilmelidir.

## APK Derleme

```bash
cd app
npm run build:apk
```

APK çıktısı: `app/android/app/build/outputs/apk/release/app-release.apk`  
Gereksinimler: Android SDK (`ANDROID_HOME`) ve Java 17+.

## Proje Yapısı

```
app/
├── App.tsx
├── app.config.ts
├── src/
│   ├── components/             # Card, Button, ProgressBar, Header, StatusPill
│   ├── context/
│   │   ├── AuthContext.tsx     # Supabase auth (email, Google, Apple)
│   │   └── AppContext.tsx      # Global durum + offline + Supabase sync
│   ├── data/curriculum.ts      # KPSS müfredat verisi
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client + AsyncStorage
│   │   ├── remote.ts           # Supabase CRUD (profile, topic_progress, sessions)
│   │   └── googleConfig.ts     # OAuth client id'leri
│   ├── navigation/             # Auth stack + Main tabs (Bottom + Stack)
│   ├── screens/
│   │   ├── auth/               # SignIn, SignUp, ForgotPassword
│   │   └── (dashboard, curriculum, subject, topic, focus, stats, settings)
│   ├── storage/                # AsyncStorage katmanı
│   ├── theme/                  # Renk ve boşluk sabitleri
│   └── utils/                  # format, stats
└── package.json
```

## Superpowers Notu

`obra/superpowers` Cursor/Claude/Codex gibi **kodlama asistanları için bir eklentidir**, uygulamaya entegre edilebilen bir kütüphane değildir. Editörüne kurmak için Cursor Agent chat'e `/add-plugin superpowers` yazman yeterli. Bu projede **superpowers metodolojisi** (önce tasarım, küçük modüler parçalar, doğrulama, sync katmanı ayrı) izlenerek backend + auth eklendi.
