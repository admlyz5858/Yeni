# Google Play Mağaza Listeleme Rehberi

## Uygulama Bilgileri

**Paket adı:** com.calismaasistani.app  
**Mevcut sürüm:** 1.0.0 (versionCode: 1)

---

## Kısa Açıklama (80 karakter max)
```
Odaklan, planla, rozetler kazan! Pomodoro, çalışma günlüğü, sıralama ve daha fazlası.
```

## Uzun Açıklama (4000 karakter max)
```
Çalışma Asistanı ile çalışma planlarınızı yönetin, odaklanın ve başarılarınızı kutlayın!

📚 KENDİ DERSLERİNİZ
• Matematik, Türkçe, Fen veya istediğiniz dersi ekleyin
• Konu konu ilerleme takibi
• Konu notları

🎯 ODAKLANMA
• Pomodoro zamanlayıcısı (25/5, 50/10, 90/20)
• Odak serisi takibi
• Odaklanma istatistikleri

🏆 OYUNLAŞTIRMA
• 38 rozet ve başarı
• XP, seviye, ünvanlar
• Haftalık sıralama
• Çalışma grupları
• Haftalık görevler ve güçlendirmeler

📊 PLANLAMA
• Sınav tarihi geri sayımı
• Haftalık program
• Akıllı plan oluşturucu
• Çalışma günlüğü ve heatmap

📇 KARTLAR
• Aralıklı tekrar (SM-2)
• Flashcard koleksiyonu

🌙 EK ÖZELLIKLER
• Açık/Koyu tema
• Günlük çalışma hatırlatmaları
• Giriş bonusu ve seri ödülleri

Her sınava hazırlanın. Ücretsiz indirin!
```

---

## Gerekli Görseller

### Uygulama İkonu
- 512x512 PNG (Play Console otomatik boyutlandırır)
- `app/assets/icon.png` kullanılabilir

### Öne Çıkan Grafik (Feature Graphic)
- **Boyut:** 1024 x 500 px
- **Format:** PNG veya JPEG
- Örnek metin: "Çalışma Asistanı - Odaklan, Planla, Kazan!"

### Ekran Görüntüleri
- **Telefon:** En az 2, en fazla 8 adet
- **Önerilen:** 1080 x 1920 veya 1080 x 2340
- Ana sayfa, Odaklanma, Rozetler, Plan ekranlarından alın

---

## Kategoriler
**Ana kategori:** Eğitim  
**Etiketler:** çalışma, planlama, pomodoro, sınav, KPSS, YKS, öğrenci

---

## İçerik Derecelendirmesi
- Hedef kitle: Tüm yaşlar
- Şiddet, cinsellik: Yok
- Reklam: Uygulama reklamsız (ücretsiz)

---

## Veri Güvenliği (Play Console)
- **Veri toplanıyor mu?** Hayır (veriler yalnızca cihazda)
- **Veri paylaşılıyor mu?** Hayır
- **Veri güvenliği uygulaması:** Veriler cihazda şifrelenmemiş saklanır
- Gizlilik politikası URL: https://github.com/admlyz5858/Yeni/blob/main/PRIVACY_POLICY.md

---

## APK/AAB Derleme

### APK (Test / Doğrudan dağıtım için)
```bash
cd app
npm run build:apk
```
Çıktı: `app/android/app/build/outputs/apk/release/app-release.apk`

### AAB (Google Play için önerilen)
```bash
cd app
expo prebuild --platform android --clean
cd android
./gradlew bundleRelease
```
Çıktı: `app/android/app/build/outputs/bundle/release/app-release.aab`

---

## İmzalama (Release Build)

Google Play için AAB/APK imzalamanız gerekir. İlk kez:

```bash
# Keystore oluştur (bir kerelik)
keytool -genkeypair -v -storetype PKCS12 -keystore calismaasistani.keystore -alias calismaasistani -keyalg RSA -keysize 2048 -validity 10000
```

Ardından `android/app/build.gradle` içinde signingConfigs tanımlayın. Veya EAS Build kullanın (expo build --platform android) - otomatik imzalama sağlar.

**Google Play App Signing:** Yüklerken "App signing by Google Play" seçerseniz, upload key ile imzalı AAB yükleyebilirsiniz; Google kendi anahtarıyla yeniden imzalar.

## Yayınlama Adımları
1. Google Play Console'da developer hesabı oluşturun ($25 bir kerelik)
2. Yeni uygulama ekleyin
3. Mağaza listesini doldurun (yukarıdaki metinleri kullanın)
4. Görselleri yükleyin
5. Gizlilik politikası URL'sini ekleyin
6. İçerik derecelendirmesi anketini tamamlayın
7. AAB derlemeden önce `app/.env` ile Supabase bilgilerini tanımlayın
8. AAB dosyasını yükleyin
9. İncelemeye gönderin
