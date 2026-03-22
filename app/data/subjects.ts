export type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: string[];
};

export const SUBJECTS: Subject[] = [
  {
    id: 'turkce',
    name: 'Türkçe',
    icon: '📝',
    color: '#2563eb',
    topics: ['Sözcükte Anlam', 'Cümlede Anlam', 'Ses Bilgisi', 'Yazım Kuralları', 'Noktalama', 'Söz Sanatları', 'Anlatım Bozuklukları'],
  },
  {
    id: 'matematik',
    name: 'Matematik',
    icon: '🔢',
    color: '#059669',
    topics: ['Temel Kavramlar', 'Bölünebilme', 'Ondalık Kesirler', 'Oran-Orantı', 'Denklemler', 'Geometri', 'İstatistik'],
  },
  {
    id: 'tarih',
    name: 'Tarih',
    icon: '📜',
    color: '#dc2626',
    topics: ['İlk ve Orta Çağ', 'Osmanlı Tarihi', 'Türk İnkılabı', 'Atatürk İlkeleri', 'Çağdaş Türk Tarihi'],
  },
  {
    id: 'cografya',
    name: 'Coğrafya',
    icon: '🌍',
    color: '#7c3aed',
    topics: ['Fiziki Coğrafya', 'Beşeri Coğrafya', 'Türkiye Coğrafyası', 'Ekonomik Coğrafya', 'Harita Bilgisi'],
  },
  {
    id: 'vatandaslik',
    name: 'Vatandaşlık',
    icon: '⚖️',
    color: '#d97706',
    topics: ['Temel Kavramlar', 'Devlet', 'Anayasa', 'Yasama-Yürütme-Yargı', 'Temel Haklar', 'Uluslararası Kuruluşlar'],
  },
  {
    id: 'guncel',
    name: 'Güncel Konular',
    icon: '📰',
    color: '#0891b2',
    topics: ['Ekonomi', 'Eğitim', 'Sağlık', 'Teknoloji', 'Çevre', 'Spor', 'Kültür-Sanat'],
  },
];
