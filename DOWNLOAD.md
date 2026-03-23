# APK İndirme

## Yerel Derleme (Bu workspace'te)

APK derlendikten sonra şu konumda bulunur:

- **Workspace kökü:** `CalismaAsistani-v1.0.0.apk`
- **Gradle çıktısı:** `app/android/app/build/outputs/apk/release/app-release.apk`

Cursor’da dosyaya sağ tıklayıp **Download** ile indirebilirsiniz.

## GitHub Actions ile

Kod `cursor/yeni-uygulama-05d1` branch’ine push edildiğinde GitHub Actions APK derler.

1. **[GitHub Actions](https://github.com/admlyz5858/Yeni/actions)** sayfasına gidin
2. En son **Build APK** workflow çalışmasını açın
3. Sayfanın altındaki **Artifacts** bölümünden **app-release-apk** dosyasını indirin

## Tekrar derlemek için

```bash
cd app
npm run build:apk
```

APK: `app/android/app/build/outputs/apk/release/app-release.apk`
