export type Question = {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export const CATEGORIES = [
  { id: 'turkce', name: 'Türkçe', icon: '📝', color: '#2563eb' },
  { id: 'matematik', name: 'Matematik', icon: '🔢', color: '#059669' },
  { id: 'tarih', name: 'Tarih', icon: '📜', color: '#dc2626' },
  { id: 'cografya', name: 'Coğrafya', icon: '🌍', color: '#7c3aed' },
  { id: 'vatandaslik', name: 'Vatandaşlık', icon: '⚖️', color: '#d97706' },
  { id: 'guncel', name: 'Güncel Konular', icon: '📰', color: '#0891b2' },
] as const;

export const QUESTIONS: Record<string, Question[]> = {
  turkce: [
    {
      id: 't1',
      category: 'turkce',
      question: '"Sözcüklerin anlamını kavrayabilmek için cümle içindeki kullanımlarına bakmak gerekir." Bu cümlede altı çizili sözle anlatılmak istenen nedir?',
      options: [
        'Bağlam',
        'Yapı',
        'Biçim',
        'İçerik',
      ],
      correctIndex: 0,
    },
    {
      id: 't2',
      category: 'turkce',
      question: 'Aşağıdakilerden hangisi öznel bir yargı içermektedir?',
      options: [
        'Ankara Türkiye\'nin başkentidir.',
        'Bu roman edebiyatımızın en güzel eserlerinden biridir.',
        'Su 100 derecede kaynar.',
        'Dünya Güneş\'in etrafında döner.',
      ],
      correctIndex: 1,
    },
    {
      id: 't3',
      category: 'turkce',
      question: '"Dil, toplumsal bir kurumdur." cümlesinde dilin hangi özelliği vurgulanmaktadır?',
      options: [
        'Bireysel olması',
        'Toplum tarafından oluşturulması',
        'Değişmez olması',
        'Evrensel olması',
      ],
      correctIndex: 1,
    },
  ],
  matematik: [
    {
      id: 'm1',
      category: 'matematik',
      question: 'Bir sayının 3 katının 5 fazlası 26 ise bu sayı kaçtır?',
      options: ['5', '6', '7', '8'],
      correctIndex: 2,
    },
    {
      id: 'm2',
      category: 'matematik',
      question: '30\'un %40\'ı kaçtır?',
      options: ['10', '12', '15', '18'],
      correctIndex: 1,
    },
    {
      id: 'm3',
      category: 'matematik',
      question: '2x + 8 = 20 ise x kaçtır?',
      options: ['4', '5', '6', '7'],
      correctIndex: 2,
    },
  ],
  tarih: [
    {
      id: 'h1',
      category: 'tarih',
      question: 'Türkiye Cumhuriyeti hangi tarihte ilan edilmiştir?',
      options: ['29 Ekim 1922', '29 Ekim 1923', '23 Nisan 1920', '30 Ağustos 1922'],
      correctIndex: 1,
    },
    {
      id: 'h2',
      category: 'tarih',
      question: 'TBMM ilk kez hangi tarihte açılmıştır?',
      options: ['23 Nisan 1920', '29 Ekim 1923', '30 Ağustos 1922', '19 Mayıs 1919'],
      correctIndex: 0,
    },
    {
      id: 'h3',
      category: 'tarih',
      question: 'Lozan Antlaşması hangi tarihte imzalanmıştır?',
      options: ['1920', '1921', '1922', '1923'],
      correctIndex: 3,
    },
  ],
  cografya: [
    {
      id: 'g1',
      category: 'cografya',
      question: 'Türkiye\'nin yüz ölçümü yaklaşık kaç km²\'dir?',
      options: ['750.000', '780.000', '814.000', '850.000'],
      correctIndex: 2,
    },
    {
      id: 'g2',
      category: 'cografya',
      question: 'Türkiye\'nin en uzun nehri hangisidir?',
      options: ['Kızılırmak', 'Sakarya', 'Fırat', 'Dicle'],
      correctIndex: 0,
    },
    {
      id: 'g3',
      category: 'cografya',
      question: 'Türkiye\'nin en büyük gölü hangisidir?',
      options: ['Tuz Gölü', 'Van Gölü', 'Eğirdir Gölü', 'Beyşehir Gölü'],
      correctIndex: 1,
    },
  ],
  vatandaslik: [
    {
      id: 'v1',
      category: 'vatandaslik',
      question: 'Türkiye Cumhuriyeti Anayasası\'na göre egemenlik kayıtsız şartsız kime aittir?',
      options: ['TBMM\'ye', 'Cumhurbaşkanına', 'Millet', 'Hükümete'],
      correctIndex: 2,
    },
    {
      id: 'v2',
      category: 'vatandaslik',
      question: 'Türkiye\'de yasama organı hangisidir?',
      options: ['Cumhurbaşkanı', 'Bakanlar Kurulu', 'TBMM', 'Anayasa Mahkemesi'],
      correctIndex: 2,
    },
    {
      id: 'v3',
      category: 'vatandaslik',
      question: 'Anayasanın değiştirilemez maddeleri nelerdir?',
      options: [
        'Türkiye Devleti\'nin cumhuriyet, demokrasi ve laiklik nitelikleri',
        'Sadece cumhuriyet',
        'Sadece demokrasi',
        'Hiçbiri',
      ],
      correctIndex: 0,
    },
  ],
  guncel: [
    {
      id: 'u1',
      category: 'guncel',
      question: 'Türkiye\'nin para birimi nedir?',
      options: ['Dolar', 'Euro', 'Türk Lirası', 'Sterlin'],
      correctIndex: 2,
    },
    {
      id: 'u2',
      category: 'guncel',
      question: 'Türkiye\'nin nüfusu 2024 itibarıyla yaklaşık kaç milyondur?',
      options: ['80', '85', '90', '95'],
      correctIndex: 2,
    },
    {
      id: 'u3',
      category: 'guncel',
      question: 'Türkiye\'nin başkenti neresidir?',
      options: ['İstanbul', 'İzmir', 'Ankara', 'Bursa'],
      correctIndex: 2,
    },
  ],
};
