# KPSS Planlayıcı

KPSS müfredat takip ve odaklanma uygulaması. Expo (React Native) ile yazılmış, iOS, Android ve Web üzerinde çalışır.

## Özellikler

- **Müfredat Takibi**: Genel Yetenek (Türkçe, Matematik, Geometri), Genel Kültür (Tarih, Coğrafya, Vatandaşlık, Güncel) ve Eğitim Bilimleri (Gelişim, Öğrenme, Rehberlik, Ölçme, Program, Öğretim İlke-Yöntem, Teknoloji, Sınıf Yönetimi) konularının tam listesi.
- **Konu Durumu**: Her konu için Başlanmadı / Çalışılıyor / Tekrar / Tamamlandı durumları.
- **Soru Sayacı**: Konu bazında çözülen soru ve doğru sayısı, başarı yüzdesi.
- **Not Alma**: Her konuya kısa notlar ekleyebilme.
- **Odaklanma (Pomodoro)**: Özelleştirilebilir odak + mola süreleri, konu seçerek odaklanma, titreşim geri bildirimi.
- **Günlük Hedef**: Günlük çalışma dakikası hedefi ve ilerleme çubuğu.
- **İstatistikler**: Bugün, hafta, toplam süre, seri gün, haftalık çalışma grafiği, bölüme göre ilerleme.
- **KPSS Türü**: Lisans, Önlisans, Ortaöğretim ve Eğitim Bilimleri seçenekleri.
- **Tamamen Yerel**: Tüm veriler cihazda (AsyncStorage) saklanır.

## Hakkında obra/superpowers

Kullanıcının istediği [`obra/superpowers`](https://github.com/obra/superpowers) deposu Cursor/Claude/Codex gibi **kodlama asistanları** için bir **eklenti (plugin)** sağlar; cihazda kurulup çalışan bir kütüphane değildir. Bu nedenle uygulamaya doğrudan entegre edilemez; ancak Cursor içinden `/add-plugin superpowers` ile editörüne ekleyebilirsin. Bu depoda **metodolojisi** (önce tasarım, test-sürümlü geliştirme, küçük taşınabilir parçalar halinde çalışma) izlenerek uygulama baştan sona inşa edilmiştir.

## Başlangıç

```bash
cd app
npm install
npm start
```

Ardından:

- **Android**: `a` tuşu veya `npm run android`
- **iOS**: `i` tuşu veya `npm run ios` (macOS gerekir)
- **Web**: `w` tuşu veya `npm run web`

Telefonunda test etmek için [Expo Go](https://expo.dev/client) uygulamasını indir ve QR kodu okut.

## APK Derleme

```bash
cd app
npm run build:apk
```

APK çıktısı: `app/android/app/build/outputs/apk/release/app-release.apk`

Gereksinimler: Android SDK (`ANDROID_HOME`) ve Java 17+

## Proje Yapısı

```
app/
├── App.tsx                     # Kök bileşen
├── src/
│   ├── components/             # Card, Button, ProgressBar, Header, StatusPill
│   ├── context/AppContext.tsx  # Global durum (reducer + AsyncStorage)
│   ├── data/curriculum.ts      # KPSS müfredat verisi
│   ├── navigation/             # Bottom Tabs + Stack
│   ├── screens/                # Dashboard, Curriculum, Subject, Topic, Focus, Stats, Settings
│   ├── storage/                # AsyncStorage katmanı
│   ├── theme/                  # Renk ve boşluk sabitleri
│   └── utils/                  # Format yardımcıları, istatistikler
├── app.json
├── eas.json
└── package.json
```
