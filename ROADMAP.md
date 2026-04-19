# KPSS Planlayıcı — Geliştirme Yol Haritası

Bu belge, şu ana kadar tamamlanan işleri özetler ve uygulamanın **kamuya hazır (production-ready)** bir ürüne dönüşmesi için yapılması gerekenleri sıralar. Her faz; teknik detayları, bağımlılıkları, kabul kriterlerini (DoD — Definition of Done) ve ilgili dosyaları içerir.

---

## İçindekiler

1. [Durum Özeti](#durum-özeti)
2. [Faz 0 — Temel (Tamamlandı)](#faz-0--temel-tamamlandı)
3. [Faz 1 — Kimlik & Onboarding Cilalama](#faz-1--kimlik--onboarding-cilalama)
4. [Faz 2 — Müfredat & Plan Motoru](#faz-2--müfredat--plan-motoru)
5. [Faz 3 — Odaklanma Deneyimi Geliştirmeleri](#faz-3--odaklanma-deneyimi-geliştirmeleri)
6. [Faz 4 — İstatistik & Görselleştirme](#faz-4--istatistik--görselleştirme)
7. [Faz 5 — Bildirimler & Hatırlatmalar](#faz-5--bildirimler--hatırlatmalar)
8. [Faz 6 — Soru Bankası & Quiz Modu](#faz-6--soru-bankası--quiz-modu)
9. [Faz 7 — AI Yardımcı (Opsiyonel)](#faz-7--ai-yardımcı-opsiyonel)
10. [Faz 8 — Sosyal & Motivasyon](#faz-8--sosyal--motivasyon)
11. [Faz 9 — Çevrimdışı & Senkronizasyon Sağlamlaştırma](#faz-9--çevrimdışı--senkronizasyon-sağlamlaştırma)
12. [Faz 10 — Güvenlik & KVKK](#faz-10--güvenlik--kvkk)
13. [Faz 11 — Kalite: Test, CI/CD, Gözlemlenebilirlik](#faz-11--kalite-test-cicd-gözlemlenebilirlik)
14. [Faz 12 — Yayınlama (App Store, Play Store, Web)](#faz-12--yayınlama-app-store-play-store-web)
15. [Uzun Vade Fikirler](#uzun-vade-fikirler)
16. [Bağımlılıklar & Riskler](#bağımlılıklar--riskler)

---

## Durum Özeti

| Alan | Durum |
| --- | --- |
| Expo (RN) iskeleti | Hazır |
| KPSS müfredat verisi (GY, GK, EB) | Hazır |
| Konu durumu, notlar, soru sayacı | Hazır |
| Pomodoro odaklanma | Hazır (temel) |
| İstatistikler (günlük/haftalık) | Hazır (temel) |
| Supabase backend (profiles, topic_progress, study_sessions, RLS, trigger) | Hazır |
| E-posta ile kayıt/giriş + şifre sıfırlama | Hazır |
| Google ile giriş (id_token + nonce) | Hazır (Google Cloud istemci ID'leri gerekiyor) |
| Apple ile giriş (iOS) | Hazır (Apple Developer + Supabase provider ayarı gerekiyor) |
| Offline-first local cache | Hazır (AsyncStorage) |
| Supabase sync (profil, topic_progress, session) | Hazır |

---

## Faz 0 — Temel (Tamamlandı)

Mevcut durum. Referans olarak:

- `app/src/context/AuthContext.tsx`, `AppContext.tsx`
- `app/src/lib/{supabase,remote,googleConfig}.ts`
- `app/src/screens/auth/*`, `app/src/screens/*`
- Supabase migration: `kpss_app_schema_extensions`

Bu fazın kalan küçük borçları:

- [ ] `app/.env.example` dosyasından gerçek `.env` üretilmeli (ekip için iletişim kanalı oluştur).
- [ ] Supabase **leaked password protection** aç (advisor uyarısı): Dashboard → Authentication → Providers → Email → "Leaked password protection".
- [ ] Supabase Auth e-posta şablonları Türkçeleştir (doğrulama + şifre sıfırlama).

---

## Faz 1 — Kimlik & Onboarding Cilalama

**Amaç:** Yeni kullanıcının uygulamaya girdiği ilk dakikada değer görmesi.

### 1.1 Onboarding akışı
- [ ] `app/src/screens/onboarding/*` altında 3–4 adımlık onboarding (karşılama, KPSS türü seçimi, günlük hedef, odak/mola süreleri).
- [ ] `profiles.onboarding_completed = true` yapıldığında tab navigasyonu açılır; aksi hâlde yeni kullanıcı onboarding'e yönlendirilir.
- [ ] Skip butonu; atlayan kullanıcıya Ayarlar'dan tekrar başlatma seçeneği.

### 1.2 Profil yönetimi
- [ ] Ayarlar → "Profilimi düzenle" ekranı: `first_name`, hedef sınav tarihi (`exam_date date` kolonu eklenecek), avatar (Supabase Storage).
- [ ] `avatar_url` kolonu ve `avatars` bucket'ı; `RLS: insert/update/delete owner-only`.
- [ ] Şifre değiştirme akışı (mevcut şifre + yeni şifre, `supabase.auth.updateUser`).

### 1.3 Auth UX
- [ ] E-posta doğrulama geri dönüş (deep link) → uygulama otomatik oturum açar.
- [ ] Şifre sıfırlama linkine tıklayınca açılan "Yeni Şifre Belirle" ekranı (deep link `kpssplanlayici://reset`).
- [ ] Sosyal giriş başarısızlıklarında okunabilir hata mesajları (özellikle nonce uyumsuzluğu).
- [ ] iOS "Sign in with Apple" gizlilik maili kullanıldığında `first_name` credential ilk girişte alınır → profile yazılır.

**DoD:** Sıfırdan bir kullanıcı hesap açıp onboarding'i tamamlıyor, profil fotoğrafı yüklüyor, şifresini değiştirebiliyor.

---

## Faz 2 — Müfredat & Plan Motoru

**Amaç:** Uygulama sadece takip değil, **kişiselleştirilmiş çalışma planı** üretsin.

### 2.1 Konu meta verisi
- [ ] `curriculum.ts` içindeki her konuya ekle: `estimatedMinutes`, `difficulty (1-5)`, `examWeight (int)`, `prerequisites: string[]`.
- [ ] Konu içerik referansı: `resourceLinks: { title, url, type: 'video'|'pdf'|'article' }[]`.

### 2.2 Sınav tarihi odaklı plan
- [ ] Ayarlar/Profil → hedef sınav tarihi.
- [ ] `src/lib/planner.ts`: kalan gün sayısı, toplam konu yükü ve `examWeight`'a göre haftalık plan üret.
- [ ] Ana ekranda "Bu hafta" kartı: önerilen 3–5 konu + kalan süreler.

### 2.3 Günlük plan & görev listesi
- [ ] Yeni tablo: `public.daily_tasks (id, user_id, date, topic_id, target_minutes, status, created_at)`; RLS owner-only.
- [ ] "Bugünün planı" ekranı: işaretlenip tamamlanabilen görevler.
- [ ] Plan otomatik olarak her gece UTC 00:00 civarı yenilenir (Supabase Edge Function + pg_cron).

### 2.4 Manuel plan düzenleme
- [ ] Kullanıcı kendi konusunu ekleyebilsin (kişisel konu — sadece kendi profilinde).
- [ ] `public.custom_topics (id, user_id, subject_id, title, notes)`.

**DoD:** Kullanıcı sınav tarihini girince haftalık + günlük plan otomatik oluşur; plan ekranından konuya tıklayıp odaklanmaya başlayabilir.

---

## Faz 3 — Odaklanma Deneyimi Geliştirmeleri

### 3.1 Arkaplan & kilit ekranı
- [ ] Expo **Background Tasks** + notification live activity (iOS) ile zamanlayıcı arkaplanda doğru ilerler.
- [ ] Android için "Foreground service" (expo notification) → zamanlayıcı bildirimi.

### 3.2 Ses & ambiance
- [ ] `expo-av` ile odak müziği (yağmur, beyaz gürültü, lofi) — 3–5 hazır track.
- [ ] Ses sesi ayarı; fade-in/out.

### 3.3 Konsantrasyon modları
- [ ] "Derin Odak" modu: bildirimleri sustur (sadece iOS Focus API önerisi), uygulama içinden çıkış zorlu (onay).
- [ ] Pomodoro preset'leri: 25/5, 50/10, 90/20; kullanıcı kendi preset'ini kaydedebilir.
- [ ] Sayısal odak puanı: seansın bölünmesi (pause/stop sıklığı) puanı düşürür.

### 3.4 Oturum raporu
- [ ] Odak bitince "Bu seans özeti": süre, odak puanı, çözülen soru, not alma alanı.
- [ ] Oturum sonrası otomatik 1–2 soru tekrar önerisi (Faz 2 planlayıcı ile).

**DoD:** Kullanıcı telefonunu başka bir uygulamaya aldığında veya ekran kapandığında zamanlayıcı kaybolmaz; bitişte güzel bir özet kartı görünür.

---

## Faz 4 — İstatistik & Görselleştirme

### 4.1 Gelişmiş grafikler
- [ ] `victory-native` veya `react-native-svg` ile:
  - Günlük süre heatmap (GitHub-style contribution grid, 12 haftalık).
  - Bölümlere göre radar chart (GY/GK/EB).
  - Konu bazlı soru başarı trendi (çizgi grafik).
- [ ] `src/screens/StatsScreen.tsx` → tab'lı yapı: Süre / Başarı / Dağılım.

### 4.2 Döneme göre karşılaştırma
- [ ] Bu hafta vs geçen hafta süre, geliştirme yüzdesi.
- [ ] En çok ihmal edilen 3 konu listesi.
- [ ] Güçlü / zayıf konu analizi (başarı < %50 olanlar).

### 4.3 PDF/CSV dışa aktarım
- [ ] Kullanıcı tüm verisini indirebilsin (KVKK yükümlülüğü).
- [ ] Supabase Edge Function veya istemci tarafı `expo-file-system` + `expo-sharing`.

**DoD:** Kullanıcı performansını tek bakışta anlar; en az 3 farklı grafik tipi vardır.

---

## Faz 5 — Bildirimler & Hatırlatmalar

### 5.1 Yerel bildirim
- [ ] `expo-notifications` kurulumu + izin akışı.
- [ ] Günlük hedef hatırlatması (kullanıcı saat seçer).
- [ ] Odak seansı bitti/mola bitti bildirimi.
- [ ] Sınava kalan gün hatırlatması (haftada bir).

### 5.2 Push bildirim
- [ ] Expo Push token → `public.push_tokens (user_id, token, platform, updated_at)`.
- [ ] Supabase Edge Function (Deno): günlük hedef veya tekrar günü geldiğinde push.
- [ ] Kampanya bildirimi için opt-in switch (profil ayarı `marketing_opt_in`).

### 5.3 Akıllı tekrar aralıkları
- [ ] `completed` olan konu için 3/7/21 günlük **spaced repetition** hatırlatıcı.
- [ ] `topic_progress.next_review_at` kolonu.

**DoD:** Kullanıcı mola bittiğinde ekran kapalıyken de uyarılır; tekrar günü gelen konular dashboard'da rozet gösterir.

---

## Faz 6 — Soru Bankası & Quiz Modu

**Amaç:** Uygulama sadece takip değil, pratik de yaptırsın.

### 6.1 Veri modeli
- [ ] `public.questions (id uuid PK, topic_id text, text text, options jsonb, correct_index int, difficulty int, explanation text, source text, created_at)`.
- [ ] `public.question_attempts (id, user_id, question_id, selected_index, is_correct, seconds_taken, session_id, created_at)`, RLS owner-only.
- [ ] Başlangıç veri seti (deneme soruları) seed'i veya admin editör.

### 6.2 Quiz ekranları
- [ ] "Konu Quiz'i": seçilen konudan 10/20 soru.
- [ ] "Mini Test": rastgele 20 karışık soru, süre limiti.
- [ ] "Deneme Sınavı": 120 soru / 135 dk (gerçek KPSS benzeri), sonuç raporu.

### 6.3 Raporlama
- [ ] Quiz sonu: doğru/yanlış/boş, konuya göre başarı dağılımı, yanlışlar listesi + doğru cevap + açıklama.
- [ ] Yanlışları "review" olarak işaretle (otomatik).

### 6.4 İçerik yönetimi
- [ ] Admin panel (Next.js + Supabase) ya da Supabase Studio üzerinden içerik girişi.
- [ ] Topluluk katkısı için moderasyon akışı (opsiyonel).

**DoD:** Kullanıcı bir konudan quiz çözüp sonuç raporunu görebiliyor; yanlışlar otomatik tekrar listesine düşüyor.

---

## Faz 7 — AI Yardımcı (Opsiyonel)

**Amaç:** AI, kullanıcıya açıklama ve özel sorular sunsun.

### 7.1 Konu özeti & soru açıklaması
- [ ] Supabase Edge Function: `openai/anthropic` istemcisi (API key **sunucu tarafında**, asla istemcide değil).
- [ ] Konu detay ekranında "AI Özet" butonu: konuyu 5 maddede özetler.
- [ ] Quiz yanlış cevap ekranında "Neden?" → AI açıklama.

### 7.2 Soru üretici
- [ ] Edge Function: konu + zorluk → 5 yeni soru önerisi (ama moderasyondan geçmeden `questions` tablosuna INSERT etme).

### 7.3 Konuşma modu
- [ ] "KPSS koçu" chat: kullanıcıya konu anlatan, strateji öneren.
- [ ] Kotalar + rate limiting (`user_id` başına günlük sayaç tablosu).

### 7.4 Maliyet & gizlilik
- [ ] Kullanıcıya hangi verinin AI'a gönderildiği şeffaf gösterilmeli.
- [ ] Opt-in kaydı (`profiles.ai_opt_in`).

**DoD:** Kullanıcı bir konuya AI özeti ister ve saniyeler içinde alır; API anahtarları asla istemciye düşmez.

---

## Faz 8 — Sosyal & Motivasyon

### 8.1 Rozetler
- [ ] `public.achievements` ve `public.user_achievements` tabloları.
- [ ] Rozet örnekleri: 7 gün streak, ilk 100 soru, bir bölümü %100 bitirme, ilk deneme sınavı.

### 8.2 Liderlik tablosu (opsiyonel, gizlilik odaklı)
- [ ] Haftalık dakika/soru sıralaması; kullanıcı görünürlük opt-in'i.
- [ ] Anonim takma ad (`profiles.display_name`).

### 8.3 Çalışma grupları
- [ ] `public.groups`, `public.group_members`; gruba özel günlük hedef ve pano.
- [ ] Davet linki (UUID).

### 8.4 Motivasyon
- [ ] Ana ekran dinamik motivasyon mesajı (hafif; kullanıcı adını kullanan).
- [ ] Streak kırılma uyarısı ("1 gün daha dayan!").

**DoD:** Kullanıcı rozet kazanıyor, kazanılan rozetler profilde görünüyor; liderlik tablosu opt-in'li çalışıyor.

---

## Faz 9 — Çevrimdışı & Senkronizasyon Sağlamlaştırma

### 9.1 Queue & retry
- [ ] Yerel bir **mutation queue** tut (AsyncStorage). Network off ise kuyruğa ekle, tekrar online olunca gönder.
- [ ] Sırayla gönderim; başarısızsa exponential backoff.

### 9.2 Çatışma çözümü
- [ ] `updated_at` tabanlı last-write-wins; uzak daha yeniyse yerel üzerine yaz.
- [ ] Session çakışmaları: `id` (uuid) zaten tekil → `ON CONFLICT DO NOTHING`.

### 9.3 Realtime
- [ ] `supabase.channel('user:{id}')` üzerinden başka cihazda yapılan değişiklikler anında yansır.
- [ ] Oturum açılışında tam senkron, sonra sadece delta.

### 9.4 Depolama sınırı
- [ ] Local cache'i 500 session ile sınırla (zaten öyle), eski ay verisini arşivle (Supabase'e bırak).

**DoD:** Uçak modunda yapılan değişiklikler tekrar online olunca otomatik yansır; iki farklı cihazda veriler senkron kalır.

---

## Faz 10 — Güvenlik & KVKK

### 10.1 Veri koruma
- [ ] Tüm tablolar için RLS açık ve test edilmiş (mevcut ✅, ancak yeni tablolar eklendikçe tekrar denetlenmeli).
- [ ] Kritik endpoint'ler için `service_role` asla istemciye geçmez (halihazırda değil).
- [ ] Supabase advisor: leaked password protection açılmalı.

### 10.2 KVKK / GDPR
- [ ] Aydınlatma metni + açık rıza ekranı (ilk açılışta).
- [ ] Hesap silme akışı: `supabase.rpc('delete_user_data')` + `auth.admin.deleteUser` (server-side edge function).
- [ ] Veri indirme (Faz 4.3).

### 10.3 Güvenlik başlıkları & TLS
- [ ] Web deploy (Vercel/Netlify) için CSP, HSTS, X-Frame-Options.
- [ ] OAuth redirect domain whitelist Supabase Dashboard'da.

### 10.4 Rate limit
- [ ] Özellikle AI ve push endpoint'lerinde Edge Function seviyesinde rate-limit (`kv` veya Postgres sayacı).

**DoD:** Kullanıcı kendi verisini indirebiliyor, hesabını tek tıkla silebiliyor; tüm tablolar için RLS testleri vardır.

---

## Faz 11 — Kalite: Test, CI/CD, Gözlemlenebilirlik

### 11.1 Test
- [ ] **Unit**: `vitest` veya `jest` — `src/lib/*`, reducer'lar, `src/utils/stats.ts`.
- [ ] **Component**: `@testing-library/react-native` — Card, Button, ProgressBar, StatusPill.
- [ ] **E2E**: `Maestro` veya `Detox` — kayıt → giriş → onboarding → odak → konu güncelleme.
- [ ] Hedef kapsama: `lib/` ≥ %80.

### 11.2 Lint & format
- [ ] `eslint` + `@react-native-community/eslint-config`.
- [ ] `prettier` + pre-commit hook (`husky` + `lint-staged`).

### 11.3 CI
- [ ] GitHub Actions: lint, tsc --noEmit, test, `expo export --platform web` (PR kontrolü).
- [ ] Supabase migration doğrulama: `supabase db lint`.

### 11.4 Gözlemlenebilirlik
- [ ] **Sentry** (ücretsiz tier) ile crash + error tracking.
- [ ] Supabase logs bilgilendirici hata mesajları.
- [ ] `src/lib/logger.ts` — dev'de console, prod'da Sentry'e.

**DoD:** PR açıldığında GitHub Actions yeşil yanmadan merge edilemez; kritik hatalar Sentry'e düşer.

---

## Faz 12 — Yayınlama (App Store, Play Store, Web)

### 12.1 Ön hazırlık
- [ ] Lansmana uygun **ikon seti** ve **splash** (1024x1024 ana ikon, adaptive icon).
- [ ] App store açıklamaları (TR/EN), ekran görüntüleri (iPhone 6.7", 5.5", iPad; Android Phone + 7"/10" tablet).
- [ ] Gizlilik politikası + kullanım şartları (statik sayfa).

### 12.2 EAS Build
- [ ] `eas.json` prod profil; `eas build --platform all --profile production`.
- [ ] iOS: App Store Connect → kayıt, TestFlight.
- [ ] Android: Google Play Console → internal test → production.

### 12.3 OTA güncellemeler
- [ ] `expo-updates` kurulu mu? (Bugün `expo` ile geliyor, yapılandırılmalı.)
- [ ] Kanal stratejisi: `preview`, `production`.

### 12.4 Web deploy
- [ ] `npx expo export --platform web` → Vercel.
- [ ] Supabase → Authentication → URL yapılandırması: prod web URL'ini ekle.

**DoD:** iOS ve Android'de mağaza incelemesini geçen, TestFlight ve Play Internal Test'te çalışan bir build var.

---

## Uzun Vade Fikirler

- **KPSS dışı sınavlar**: ALES, YDS, DGS modülleri (müfredat veri seti genişletilir).
- **Canlı ders**: Discord/Jitsi entegrasyonu ile grup çalışma odaları.
- **Takvim entegrasyonu**: Google/Apple Calendar'a çalışma planı yazma.
- **Widget**: iOS/Android ana ekran widget'ı (günlük ilerleme).
- **Watch OS**: Pomodoro zamanlayıcı saat uygulaması.
- **Offline-first PWA**: Web'de service worker + IndexedDB.

---

## Bağımlılıklar & Riskler

| Risk | Etki | Azaltma |
| --- | --- | --- |
| Apple ile giriş için Apple Developer hesabı gerekir | Orta | Önce Android + Web + E-posta ile yayına çık, iOS ilerde. |
| Google OAuth istemci ID'leri eksik | Düşük | Buton kullanıcıya uyarı veriyor; eksikse gizlenebilir. |
| AI maliyetleri | Orta | Ücretsiz kota + rate limit + kullanıcı opt-in. |
| Soru bankası telif | Yüksek | Özgün soru üret / açık kaynak sorular / editörle sözleşme. |
| KVKK uyumu | Yüksek | Faz 10 tamamlanmadan mağazaya çıkma. |

---

## Nasıl Katkı Sağlarım?

- Yeni bir faz işine başlamadan önce ilgili bölümü GitHub issue'ya taşı.
- Her iş için ayrı branch: `cursor/<faz-ismi>-1baf` veya `feature/<short-desc>`.
- PR'ı mümkün olduğunca küçük tut; 400 satırdan uzun diff'leri ikiye böl.
- Test yazmadan merge yok (Faz 11'den sonra zorunlu).
