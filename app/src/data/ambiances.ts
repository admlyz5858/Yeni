/**
 * Ambiance sahneleri. Her sahne bir veya birkaç animasyon katmanı
 * (gradyan arka plan + yumuşak parçacıklar) ile oluşturulur. Video yok:
 * animasyonlar yerel, GPU üzerinde çalışan React Native Animated ve SVG
 * ile render edilir. Böylece kesintisiz ve offline bir deneyim sağlanır.
 *
 * Ses varlıkları Mixkit'ten (ticari kullanım serbest).
 */

export type SceneType =
  | 'sunny_forest'
  | 'rainy_forest'
  | 'forest_stream'
  | 'waterfall'
  | 'river_raft'
  | 'sea_waves'
  | 'sunset_beach'
  | 'sea_cove'
  | 'fireplace'
  | 'snow_forest'
  | 'snow_mountain'
  | 'misty_rain'
  | 'pier'
  | 'coast'
  | 'sunset_field'
  | 'silent_night';

export interface Ambiance {
  id: string;
  title: string;
  subtitle: string;
  category: 'nature' | 'water' | 'weather' | 'urban' | 'cozy' | 'abstract';
  emoji: string;
  accent: string;
  scene: SceneType;
  /** Üst-alt degrade (background gradient). */
  gradient: [string, string, ...string[]];
  /** Opsiyonel ufuk silueti: dağ/tepe/orman */
  horizon?: 'trees' | 'mountains' | 'hills' | 'waves' | 'dunes' | 'none';
  horizonColor?: string;
  defaultVolume: number;
  audioIds: number[];
}

function audioUrl(id: number): string {
  return `https://assets.mixkit.co/active_storage/sfx/${id}/${id}-preview.mp3`;
}

export const ambiances: Ambiance[] = [
  {
    id: 'forest-sunlight',
    title: 'Güneşli Orman',
    subtitle: 'Işık hüzmeleri, uçuşan yapraklar',
    category: 'nature',
    emoji: '🌳',
    accent: '#34d399',
    scene: 'sunny_forest',
    gradient: ['#13351f', '#1f5a3a', '#3d8f5b'],
    horizon: 'trees',
    horizonColor: '#0d2317',
    defaultVolume: 0.45,
    audioIds: [1213, 1210],
  },
  {
    id: 'forest-rain',
    title: 'Yağmurlu Orman',
    subtitle: 'Yumuşak yağmur damlaları',
    category: 'weather',
    emoji: '🌧️',
    accent: '#4ade80',
    scene: 'rainy_forest',
    gradient: ['#0f1f22', '#1f3a3d', '#355d57'],
    horizon: 'trees',
    horizonColor: '#081619',
    defaultVolume: 0.6,
    audioIds: [1242, 1260],
  },
  {
    id: 'forest-stream',
    title: 'Orman Deresi',
    subtitle: 'Akan sular, gölgelik ağaçlar',
    category: 'water',
    emoji: '🍃',
    accent: '#14b8a6',
    scene: 'forest_stream',
    gradient: ['#0b2723', '#174a41', '#2e8277'],
    horizon: 'trees',
    horizonColor: '#061b18',
    defaultVolume: 0.55,
    audioIds: [2450, 1216],
  },
  {
    id: 'waterfall',
    title: 'Orman Şelalesi',
    subtitle: 'Aşağı akan beyaz perde',
    category: 'water',
    emoji: '💧',
    accent: '#38bdf8',
    scene: 'waterfall',
    gradient: ['#0b1c3a', '#17406c', '#5394c7'],
    horizon: 'hills',
    horizonColor: '#091a30',
    defaultVolume: 0.55,
    audioIds: [2456, 2450],
  },
  {
    id: 'river-raft',
    title: 'Dere Kenarı',
    subtitle: 'Serin esinti, hafif akıntı',
    category: 'water',
    emoji: '🛶',
    accent: '#22d3ee',
    scene: 'river_raft',
    gradient: ['#0a2a33', '#154a57', '#2a8ba1'],
    horizon: 'trees',
    horizonColor: '#061a20',
    defaultVolume: 0.5,
    audioIds: [1216, 2450],
  },
  {
    id: 'sea-waves',
    title: 'Deniz',
    subtitle: 'Kıyıya vuran dalgalar',
    category: 'water',
    emoji: '🌊',
    accent: '#60a5fa',
    scene: 'sea_waves',
    gradient: ['#082045', '#144079', '#3a7ac0'],
    horizon: 'waves',
    horizonColor: '#051632',
    defaultVolume: 0.55,
    audioIds: [1189, 1194],
  },
  {
    id: 'sea-sunset',
    title: 'Gün Batımı Sahili',
    subtitle: 'Turuncu gökyüzü, yavaş dalga',
    category: 'water',
    emoji: '🏝️',
    accent: '#fb923c',
    scene: 'sunset_beach',
    gradient: ['#3c1a3a', '#a0445a', '#f59e63', '#fbd08b'],
    horizon: 'waves',
    horizonColor: '#1a0d21',
    defaultVolume: 0.5,
    audioIds: [1194, 1262],
  },
  {
    id: 'sea-cove',
    title: 'Koyda Sabah',
    subtitle: 'Tepelerle çevrili koy',
    category: 'water',
    emoji: '⛰️',
    accent: '#22d3ee',
    scene: 'sea_cove',
    gradient: ['#0d3043', '#1f607a', '#4aa5c2', '#a6dff3'],
    horizon: 'mountains',
    horizonColor: '#061a25',
    defaultVolume: 0.5,
    audioIds: [1194, 69],
  },
  {
    id: 'fireplace',
    title: 'Şömine',
    subtitle: 'Çıtırdayan odun, dans eden alev',
    category: 'cozy',
    emoji: '🔥',
    accent: '#f59e0b',
    scene: 'fireplace',
    gradient: ['#140704', '#3b160a', '#863413'],
    horizon: 'none',
    defaultVolume: 0.5,
    audioIds: [1330, 1329],
  },
  {
    id: 'snow-forest',
    title: 'Karlı Orman',
    subtitle: 'Yumuşak kar yağışı',
    category: 'weather',
    emoji: '❄️',
    accent: '#bfdbfe',
    scene: 'snow_forest',
    gradient: ['#0f1d34', '#2a3b63', '#6c86b8'],
    horizon: 'trees',
    horizonColor: '#0a132a',
    defaultVolume: 0.45,
    audioIds: [1162, 1267],
  },
  {
    id: 'snow-mountain',
    title: 'Karlı Dağlar',
    subtitle: 'Bulutların arasında zirveler',
    category: 'weather',
    emoji: '🏔️',
    accent: '#e0f2fe',
    scene: 'snow_mountain',
    gradient: ['#132640', '#3a5377', '#a6b7d4', '#e6eef8'],
    horizon: 'mountains',
    horizonColor: '#9fb0ce',
    defaultVolume: 0.4,
    audioIds: [1162, 1275],
  },
  {
    id: 'rainy-forest',
    title: 'Sisli Yağmur',
    subtitle: 'Puslu havada sakin yağmur',
    category: 'weather',
    emoji: '☁️',
    accent: '#94a3b8',
    scene: 'misty_rain',
    gradient: ['#1a2230', '#2c3a4d', '#546578'],
    horizon: 'trees',
    horizonColor: '#0e1420',
    defaultVolume: 0.6,
    audioIds: [1242, 1248],
  },
  {
    id: 'pier',
    title: 'Ahşap İskele',
    subtitle: 'Martı sesleri, yavaş dalga',
    category: 'water',
    emoji: '🚤',
    accent: '#38bdf8',
    scene: 'pier',
    gradient: ['#0b2540', '#1e5282', '#5ba0cc'],
    horizon: 'waves',
    horizonColor: '#05162a',
    defaultVolume: 0.45,
    audioIds: [1194, 69],
  },
  {
    id: 'coast-aerial',
    title: 'Kıyı Manzarası',
    subtitle: 'Dağların kıyıya uzandığı koy',
    category: 'water',
    emoji: '🏖️',
    accent: '#2dd4bf',
    scene: 'coast',
    gradient: ['#093a3a', '#117373', '#3dbfb7', '#9fecec'],
    horizon: 'dunes',
    horizonColor: '#062a2a',
    defaultVolume: 0.5,
    audioIds: [1194, 1195],
  },
  {
    id: 'sunset-field',
    title: 'Kırlarda Gün Batımı',
    subtitle: 'Rüzgarda salınan otlar',
    category: 'nature',
    emoji: '🌾',
    accent: '#fbbf24',
    scene: 'sunset_field',
    gradient: ['#3a1d34', '#8a3f3d', '#d97c3e', '#fbd679'],
    horizon: 'hills',
    horizonColor: '#2a1428',
    defaultVolume: 0.4,
    audioIds: [1200, 1234],
  },
  {
    id: 'silent',
    title: 'Sessiz Gece',
    subtitle: 'Yıldızlarla dolu gökyüzü',
    category: 'abstract',
    emoji: '🌙',
    accent: '#a5b4fc',
    scene: 'silent_night',
    gradient: ['#03061a', '#0a1030', '#18244e'],
    horizon: 'none',
    defaultVolume: 0,
    audioIds: [],
  },
];

export function getAmbianceById(id: string): Ambiance | null {
  return ambiances.find((a) => a.id === id) ?? null;
}

export function getAudioUrls(a: Ambiance): string[] {
  return a.audioIds.map(audioUrl);
}
