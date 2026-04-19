/**
 * Ambiance sahneleri. Tüm video ve ses varlıkları Mixkit'ten (Mixkit License —
 * ticari kullanım serbest, atıf gerektirmez).
 *
 * Video URL şablonu: https://assets.mixkit.co/videos/{id}/{id}-720.mp4
 * Ses URL şablonu:   https://assets.mixkit.co/active_storage/sfx/{id}/{id}-preview.mp3
 */

export interface Ambiance {
  id: string;
  title: string;
  subtitle: string;
  category:
    | 'nature'
    | 'water'
    | 'weather'
    | 'urban'
    | 'cozy'
    | 'abstract';
  emoji: string;
  accent: string;
  videoId: number;
  /** 0 = sessiz, 1 = yüksek */
  defaultVolume: number;
  /** Birden fazla ses kullanılıyorsa (örn. yağmur + gök gürültüsü) */
  audioIds: number[];
  poster?: string;
}

function videoUrl(id: number): string {
  return `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
}

function audioUrl(id: number): string {
  return `https://assets.mixkit.co/active_storage/sfx/${id}/${id}-preview.mp3`;
}

export const ambiances: Ambiance[] = [
  {
    id: 'forest-sunlight',
    title: 'Güneşli Orman',
    subtitle: 'Ağaç yaprakları ve kuş sesleri',
    category: 'nature',
    emoji: '🌳',
    accent: '#10b981',
    videoId: 50847,
    defaultVolume: 0.45,
    audioIds: [1213, 1210],
  },
  {
    id: 'forest-rain',
    title: 'Yağmurlu Orman',
    subtitle: 'Yapraklara vuran damlalar',
    category: 'weather',
    emoji: '🌧️',
    accent: '#22c55e',
    videoId: 22728,
    defaultVolume: 0.6,
    audioIds: [1242, 1260],
  },
  {
    id: 'forest-stream',
    title: 'Orman Deresi',
    subtitle: 'Akan su ve ağaçlar arasında',
    category: 'water',
    emoji: '🍃',
    accent: '#14b8a6',
    videoId: 529,
    defaultVolume: 0.55,
    audioIds: [2450, 1216],
  },
  {
    id: 'waterfall',
    title: 'Orman Şelalesi',
    subtitle: 'Derin su akışı',
    category: 'water',
    emoji: '💧',
    accent: '#0ea5e9',
    videoId: 2213,
    defaultVolume: 0.55,
    audioIds: [2456, 2450],
  },
  {
    id: 'river-raft',
    title: 'Dere Kenarı',
    subtitle: 'Yavaşça akan sular',
    category: 'water',
    emoji: '🛶',
    accent: '#06b6d4',
    videoId: 1218,
    defaultVolume: 0.5,
    audioIds: [1216, 2450],
  },
  {
    id: 'sea-waves',
    title: 'Deniz',
    subtitle: 'Kıyıya vuran dalgalar',
    category: 'water',
    emoji: '🌊',
    accent: '#3b82f6',
    videoId: 5016,
    defaultVolume: 0.55,
    audioIds: [1189, 1194],
  },
  {
    id: 'sea-sunset',
    title: 'Gün Batımı Sahili',
    subtitle: 'Sakin dalgalar, turuncu gökyüzü',
    category: 'water',
    emoji: '🏝️',
    accent: '#f97316',
    videoId: 2168,
    defaultVolume: 0.5,
    audioIds: [1194, 1262],
  },
  {
    id: 'sea-cove',
    title: 'Koyda Sabah',
    subtitle: 'Yüksekten küçük bir koy',
    category: 'water',
    emoji: '⛰️',
    accent: '#0891b2',
    videoId: 1954,
    defaultVolume: 0.5,
    audioIds: [1194, 69],
  },
  {
    id: 'fireplace',
    title: 'Şömine',
    subtitle: 'Çıtırdayan odun, sıcak alev',
    category: 'cozy',
    emoji: '🔥',
    accent: '#f59e0b',
    videoId: 1243,
    defaultVolume: 0.5,
    audioIds: [1330, 1329],
  },
  {
    id: 'snow-forest',
    title: 'Karlı Orman',
    subtitle: 'Pembe gökyüzü ve ay',
    category: 'weather',
    emoji: '❄️',
    accent: '#93c5fd',
    videoId: 3350,
    defaultVolume: 0.45,
    audioIds: [1162, 1267],
  },
  {
    id: 'snow-mountain',
    title: 'Karlı Dağlar',
    subtitle: 'Yumuşak bulutlar arasında',
    category: 'weather',
    emoji: '🏔️',
    accent: '#bfdbfe',
    videoId: 3371,
    defaultVolume: 0.4,
    audioIds: [1162, 1275],
  },
  {
    id: 'rainy-forest',
    title: 'Sisli Yağmur',
    subtitle: 'Kasvetli ama huzurlu',
    category: 'weather',
    emoji: '☁️',
    accent: '#94a3b8',
    videoId: 22729,
    defaultVolume: 0.6,
    audioIds: [1242, 1248],
  },
  {
    id: 'pier',
    title: 'Ahşap İskele',
    subtitle: 'Martılar ve hafif dalga',
    category: 'water',
    emoji: '🚤',
    accent: '#38bdf8',
    videoId: 1197,
    defaultVolume: 0.45,
    audioIds: [1194, 69],
  },
  {
    id: 'coast-aerial',
    title: 'Kıyı Manzarası',
    subtitle: 'Yukarıdan kumsal',
    category: 'water',
    emoji: '🏖️',
    accent: '#2dd4bf',
    videoId: 1082,
    defaultVolume: 0.5,
    audioIds: [1194, 1195],
  },
  {
    id: 'sunset-field',
    title: 'Kırlarda Gün Batımı',
    subtitle: 'Rüzgarda sallanan otlar',
    category: 'nature',
    emoji: '🌾',
    accent: '#eab308',
    videoId: 42864,
    defaultVolume: 0.4,
    audioIds: [1200, 1234],
  },
  {
    id: 'silent',
    title: 'Sessiz Mod',
    subtitle: 'Video ve ses kapalı',
    category: 'abstract',
    emoji: '🌙',
    accent: '#6366f1',
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
