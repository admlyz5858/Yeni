# Pomodoro Uygulamasi

Vite + React + TypeScript ile gelistirilmis modern bir Pomodoro web uygulamasi.

## Baslangic

```bash
cd app
npm install
npm run dev
```

Uygulama varsayilan olarak `http://localhost:5173` adresinde calisir.

## Komutlar

- `npm run dev`: Gelistirme sunucusunu baslatir
- `npm run build`: TypeScript kontrolu yapar ve production build olusturur
- `npm run preview`: Production build'i yerelde onizler

## Pomodoro Ozellikleri

- 25 dk odak, 5 dk kisa mola, 15 dk uzun mola
- Baslat / durdur ve sifirlama kontrolleri
- Modlar arasi manuel gecis (odak, kisa mola, uzun mola)
- Tamamlanan pomodoro sayisi takibi
- Her 4 odaktan sonra otomatik uzun mola gecisi

## Proje Yapisi

```
app/
├── index.html
├── src/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── vite.config.ts
└── package.json
```
