/**
 * Ambiance sahneleri.
 *
 * Video varlıkları: Mixkit (https://mixkit.co) — Mixkit License, ticari kullanım serbest.
 * Video URL: https://assets.mixkit.co/videos/{id}/{id}-720.mp4
 * Ses URL:   https://assets.mixkit.co/active_storage/sfx/{id}/{id}-preview.mp3
 */

export type AmbianceCategory =
  | 'calisma'   // Çalışma ortamları (kafe, kütüphane, masa)
  | 'gece'      // Gece atmosferleri (şehir, yıldızlar, yağmur)
  | 'doga'      // Doğa (orman, dağ, gün batımı)
  | 'su'        // Su (deniz, şelale, yağmur)
  | 'sicak'     // Sıcak & huzurlu (şömine, mum, gün batımı)
  | 'sessiz';   // Video / ses kapalı

export interface Ambiance {
  id: string;
  title: string;
  subtitle: string;
  category: AmbianceCategory;
  emoji: string;
  accent: string;
  videoId: number;
  defaultVolume: number;
  audioIds: number[];
}

function videoUrl(id: number): string {
  return `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
}

function audioUrl(id: number): string {
  return `https://assets.mixkit.co/active_storage/sfx/${id}/${id}-preview.mp3`;
}

export const CATEGORY_META: Record<
  AmbianceCategory,
  { label: string; emoji: string; accent: string }
> = {
  calisma: { label: 'Çalışma', emoji: '📚', accent: '#6366f1' },
  gece:    { label: 'Gece',    emoji: '🌙', accent: '#818cf8' },
  doga:    { label: 'Doğa',    emoji: '🌿', accent: '#10b981' },
  su:      { label: 'Su',      emoji: '💧', accent: '#38bdf8' },
  sicak:   { label: 'Sıcak',   emoji: '🔥', accent: '#f59e0b' },
  sessiz:  { label: 'Sessiz',  emoji: '🤫', accent: '#64748b' },
};

export const ambiances: Ambiance[] = [
  // ── ÇALIŞMA ──────────────────────────────────────────────────
  {
    id: 'cafe-study',
    title: 'Çalışma Kafesi',
    subtitle: 'Laptop, kahve ve hafif gürültü',
    category: 'calisma',
    emoji: '☕',
    accent: '#a78bfa',
    videoId: 253,       // Two people work in a coffee shop
    defaultVolume: 0.45,
    audioIds: [1386, 1390],  // cafe ambience
  },
  {
    id: 'writing-notes',
    title: 'Not Masası',
    subtitle: 'Kalem sesi, odaklanma ortamı',
    category: 'calisma',
    emoji: '✏️',
    accent: '#818cf8',
    videoId: 1737,      // Writing notes at a cafe
    defaultVolume: 0.4,
    audioIds: [1386, 1162],
  },
  {
    id: 'library',
    title: 'Kütüphane',
    subtitle: 'Sessiz, konsantre, kitap kokusu',
    category: 'calisma',
    emoji: '📖',
    accent: '#6366f1',
    videoId: 9011,      // Girl studies late in library
    defaultVolume: 0.3,
    audioIds: [1162, 1267],
  },

  // ── GECE ─────────────────────────────────────────────────────
  {
    id: 'city-rain-night',
    title: 'Şehir Yağmuru',
    subtitle: 'Gece ışıkları, yağmur damlası',
    category: 'gece',
    emoji: '🌃',
    accent: '#60a5fa',
    videoId: 20727,     // Rain falling during the night
    defaultVolume: 0.6,
    audioIds: [1242, 1248],
  },
  {
    id: 'city-traffic-night',
    title: 'Gece Şehri',
    subtitle: 'Havadan trafik ışıkları',
    category: 'gece',
    emoji: '🏙️',
    accent: '#f472b6',
    videoId: 11,        // Aerial view of city traffic at night
    defaultVolume: 0.35,
    audioIds: [1386, 1390],
  },
  {
    id: 'starry-lake',
    title: 'Yıldızlı Göl',
    subtitle: 'Sakin su ve yıldızlı gökyüzü',
    category: 'gece',
    emoji: '✨',
    accent: '#c4b5fd',
    videoId: 1704,      // Night sky with stars at a calm lake
    defaultVolume: 0.35,
    audioIds: [1216, 1267],
  },
  {
    id: 'milky-way',
    title: 'Samanyolu',
    subtitle: 'Sonsuz gece, parlak yıldızlar',
    category: 'gece',
    emoji: '🌌',
    accent: '#818cf8',
    videoId: 4148,      // Milky way seen at night
    defaultVolume: 0.3,
    audioIds: [1162, 1275],
  },

  // ── DOĞA ─────────────────────────────────────────────────────
  {
    id: 'forest-morning',
    title: 'Sabah Ormanı',
    subtitle: 'Kuş sesleri, taze hava',
    category: 'doga',
    emoji: '🌳',
    accent: '#10b981',
    videoId: 50847,     // Forest sunlight
    defaultVolume: 0.45,
    audioIds: [1213, 1210],
  },
  {
    id: 'sunset-field',
    title: 'Kırlarda Gün Batımı',
    subtitle: 'Rüzgarda sallanan otlar',
    category: 'doga',
    emoji: '🌾',
    accent: '#eab308',
    videoId: 42864,
    defaultVolume: 0.4,
    audioIds: [1200, 1234],
  },
  {
    id: 'snow-mountain',
    title: 'Karlı Dağlar',
    subtitle: 'Sessiz ve berrak dağ havası',
    category: 'doga',
    emoji: '🏔️',
    accent: '#bfdbfe',
    videoId: 3371,
    defaultVolume: 0.4,
    audioIds: [1162, 1275],
  },

  // ── SU ───────────────────────────────────────────────────────
  {
    id: 'ocean-waves',
    title: 'Okyanus',
    subtitle: 'Derin ve güçlü dalgalar',
    category: 'su',
    emoji: '🌊',
    accent: '#0ea5e9',
    videoId: 5016,
    defaultVolume: 0.55,
    audioIds: [1189, 1194],
  },
  {
    id: 'forest-stream',
    title: 'Orman Deresi',
    subtitle: 'Hafifçe akan berrak su',
    category: 'su',
    emoji: '🍃',
    accent: '#14b8a6',
    videoId: 529,
    defaultVolume: 0.55,
    audioIds: [2450, 1216],
  },
  {
    id: 'rain-forest',
    title: 'Yağmurlu Orman',
    subtitle: 'Yapraklara vuran damlalar',
    category: 'su',
    emoji: '🌧️',
    accent: '#22c55e',
    videoId: 22728,
    defaultVolume: 0.6,
    audioIds: [1242, 1260],
  },

  // ── SICAK ────────────────────────────────────────────────────
  {
    id: 'fireplace',
    title: 'Şömine',
    subtitle: 'Çıtırdayan odun, turuncu alev',
    category: 'sicak',
    emoji: '🔥',
    accent: '#f59e0b',
    videoId: 1243,
    defaultVolume: 0.5,
    audioIds: [1330, 1329],
  },
  {
    id: 'sea-sunset',
    title: 'Gün Batımı Sahili',
    subtitle: 'Turuncu gökyüzü, sakin dalgalar',
    category: 'sicak',
    emoji: '🏝️',
    accent: '#f97316',
    videoId: 2168,
    defaultVolume: 0.5,
    audioIds: [1194, 1262],
  },

  // ── SESSİZ ───────────────────────────────────────────────────
  {
    id: 'silent',
    title: 'Sessiz Mod',
    subtitle: 'Video ve ses kapalı, saf odak',
    category: 'sessiz',
    emoji: '🤫',
    accent: '#64748b',
    videoId: 0,
    defaultVolume: 0,
    audioIds: [],
  },
];

export function getAmbianceById(id: string): Ambiance | null {
  return ambiances.find((a) => a.id === id) ?? null;
}

export function getVideoUrl(a: Ambiance): string | null {
  if (!a.videoId) return null;
  return videoUrl(a.videoId);
}

export function getAudioUrls(a: Ambiance): string[] {
  return a.audioIds.map(audioUrl);
}
