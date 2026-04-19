export type KpssTrack = 'lisans' | 'onlisans' | 'ortaogretim' | 'egitim';

export interface KpssTopic {
  id: string;
  title: string;
  subtopics?: string[];
}

export interface KpssSubject {
  id: string;
  title: string;
  icon: string;
  color: string;
  topics: KpssTopic[];
}

export interface KpssSection {
  id: string;
  title: string;
  description: string;
  subjects: KpssSubject[];
}

export const genelYetenek: KpssSection = {
  id: 'gy',
  title: 'Genel Yetenek',
  description: 'Türkçe ve Matematik konuları',
  subjects: [
    {
      id: 'turkce',
      title: 'Türkçe',
      icon: 'T',
      color: '#6366f1',
      topics: [
        { id: 't-ses', title: 'Ses Bilgisi' },
        { id: 't-yazim', title: 'Yazım Kuralları' },
        { id: 't-noktalama', title: 'Noktalama İşaretleri' },
        { id: 't-sozcuk', title: 'Sözcükte Anlam' },
        { id: 't-cumle', title: 'Cümlede Anlam' },
        { id: 't-paragraf', title: 'Paragraf' },
        { id: 't-sozcuk-yapisi', title: 'Sözcük Yapısı' },
        { id: 't-sozcuk-turu', title: 'Sözcük Türleri' },
        { id: 't-cumle-ogeleri', title: 'Cümlenin Ögeleri' },
        { id: 't-cumle-turleri', title: 'Cümle Türleri' },
        { id: 't-anlatim', title: 'Anlatım Bozuklukları' },
      ],
    },
    {
      id: 'matematik',
      title: 'Matematik',
      icon: 'M',
      color: '#22d3ee',
      topics: [
        { id: 'm-temel', title: 'Temel Kavramlar' },
        { id: 'm-sayilar', title: 'Sayı Basamakları' },
        { id: 'm-bolme', title: 'Bölme ve Bölünebilme' },
        { id: 'm-obeb', title: 'OBEB - OKEK' },
        { id: 'm-rasyonel', title: 'Rasyonel Sayılar' },
        { id: 'm-ondalik', title: 'Ondalık Sayılar' },
        { id: 'm-basit-eşitsizlik', title: 'Basit Eşitsizlikler' },
        { id: 'm-mutlak', title: 'Mutlak Değer' },
        { id: 'm-uslu', title: 'Üslü Sayılar' },
        { id: 'm-koklu', title: 'Köklü Sayılar' },
        { id: 'm-carpanlara', title: 'Çarpanlara Ayırma' },
        { id: 'm-oran', title: 'Oran - Orantı' },
        { id: 'm-denklem', title: 'Denklem Çözme' },
        { id: 'm-problem', title: 'Problemler' },
        { id: 'm-kume', title: 'Kümeler' },
        { id: 'm-fonksiyon', title: 'Fonksiyonlar' },
        { id: 'm-islem', title: 'İşlem - Modüler Aritmetik' },
        { id: 'm-permutasyon', title: 'Permütasyon - Kombinasyon' },
        { id: 'm-olasilik', title: 'Olasılık' },
        { id: 'm-istatistik', title: 'İstatistik' },
        { id: 'm-sayi-dizileri', title: 'Sayı Dizileri' },
      ],
    },
    {
      id: 'geometri',
      title: 'Geometri',
      icon: 'G',
      color: '#f59e0b',
      topics: [
        { id: 'g-acilar', title: 'Doğruda ve Üçgende Açılar' },
        { id: 'g-ucgen', title: 'Üçgenler' },
        { id: 'g-dik-ucgen', title: 'Dik Üçgen ve Trigonometri' },
        { id: 'g-ikizkenar', title: 'İkizkenar ve Eşkenar Üçgen' },
        { id: 'g-benzerlik', title: 'Üçgende Benzerlik' },
        { id: 'g-alan', title: 'Üçgende Alan' },
        { id: 'g-dortgen', title: 'Dörtgenler' },
        { id: 'g-cember', title: 'Çember ve Daire' },
        { id: 'g-katiler', title: 'Katı Cisimler' },
        { id: 'g-analitik', title: 'Analitik Geometri' },
      ],
    },
  ],
};

export const genelKultur: KpssSection = {
  id: 'gk',
  title: 'Genel Kültür',
  description: 'Tarih, Coğrafya, Vatandaşlık, Güncel',
  subjects: [
    {
      id: 'tarih',
      title: 'Tarih',
      icon: 'T',
      color: '#ef4444',
      topics: [
        { id: 'tr-islam-oncesi', title: 'İslamiyet Öncesi Türk Tarihi' },
        { id: 'tr-ilk-turk-islam', title: 'İlk Türk İslam Devletleri' },
        { id: 'tr-anadolu-selcuklu', title: 'Türkiye Selçuklu Devleti' },
        { id: 'tr-beylikler', title: 'Beylikler Dönemi' },
        { id: 'tr-osmanli-kurulus', title: 'Osmanlı Kuruluş Dönemi' },
        { id: 'tr-osmanli-yukselme', title: 'Osmanlı Yükselme Dönemi' },
        { id: 'tr-osmanli-duraklama', title: 'Osmanlı Duraklama' },
        { id: 'tr-osmanli-gerileme', title: 'Osmanlı Gerileme' },
        { id: 'tr-osmanli-dagilma', title: 'Osmanlı Dağılma' },
        { id: 'tr-osmanli-kultur', title: 'Osmanlı Kültür ve Medeniyeti' },
        { id: 'tr-1.dunya', title: 'I. Dünya Savaşı' },
        { id: 'tr-mondros', title: 'Mondros ve Cemiyetler' },
        { id: 'tr-kurtulus', title: 'Kurtuluş Savaşı' },
        { id: 'tr-lozan', title: 'Lozan Antlaşması' },
        { id: 'tr-inkilaplar', title: 'Atatürk İnkılapları' },
        { id: 'tr-ilkeler', title: 'Atatürk İlkeleri' },
        { id: 'tr-dis-politika', title: 'Atatürk Dönemi Dış Politika' },
        { id: 'tr-cagdas', title: 'Çağdaş Türk ve Dünya Tarihi' },
      ],
    },
    {
      id: 'cografya',
      title: 'Coğrafya',
      icon: 'C',
      color: '#10b981',
      topics: [
        { id: 'c-turkiye-konum', title: "Türkiye'nin Coğrafi Konumu" },
        { id: 'c-yerşekilleri', title: "Türkiye'nin Yer Şekilleri" },
        { id: 'c-iklim', title: "Türkiye'nin İklimi" },
        { id: 'c-nufus', title: "Türkiye'de Nüfus ve Yerleşme" },
        { id: 'c-tarim', title: 'Tarım, Hayvancılık, Ormancılık' },
        { id: 'c-madenler', title: 'Madenler ve Enerji Kaynakları' },
        { id: 'c-sanayi', title: 'Sanayi' },
        { id: 'c-ulasim', title: 'Ulaşım, Ticaret ve Turizm' },
        { id: 'c-bolgeler', title: 'Türkiye Bölgeler Coğrafyası' },
      ],
    },
    {
      id: 'vatandaslik',
      title: 'Vatandaşlık',
      icon: 'V',
      color: '#8b5cf6',
      topics: [
        { id: 'v-hukuk', title: 'Hukuk Başlangıcı' },
        { id: 'v-devlet', title: 'Devlet Biçimleri' },
        { id: 'v-anayasa-temel', title: 'Anayasa Hukukuna Giriş' },
        { id: 'v-osmanli-anayasa', title: 'Osmanlı Anayasal Hareketleri' },
        { id: 'v-1982', title: '1982 Anayasası Genel Esaslar' },
        { id: 'v-temel-haklar', title: 'Temel Hak ve Hürriyetler' },
        { id: 'v-yasama', title: 'Yasama' },
        { id: 'v-yurutme', title: 'Yürütme' },
        { id: 'v-yargi', title: 'Yargı' },
        { id: 'v-idare', title: 'İdare Hukuku' },
      ],
    },
    {
      id: 'guncel',
      title: 'Güncel Bilgiler',
      icon: 'G',
      color: '#06b6d4',
      topics: [
        { id: 'gn-turkiye', title: 'Türkiye Güncel Olaylar' },
        { id: 'gn-dunya', title: 'Dünya Güncel Olaylar' },
        { id: 'gn-spor', title: 'Spor - Kültür - Sanat' },
        { id: 'gn-uluslararasi', title: 'Uluslararası Kuruluşlar' },
      ],
    },
  ],
};

export const egitimBilimleri: KpssSection = {
  id: 'eb',
  title: 'Eğitim Bilimleri',
  description: 'Öğretmen adayları için',
  subjects: [
    {
      id: 'gelisim',
      title: 'Gelişim Psikolojisi',
      icon: 'G',
      color: '#6366f1',
      topics: [
        { id: 'gp-temel', title: 'Gelişim Temel Kavramlar' },
        { id: 'gp-bedensel', title: 'Bedensel ve Motor Gelişim' },
        { id: 'gp-bilissel', title: 'Bilişsel Gelişim (Piaget)' },
        { id: 'gp-dil', title: 'Dil Gelişimi' },
        { id: 'gp-ahlak', title: 'Ahlak Gelişimi (Kohlberg - Piaget)' },
        { id: 'gp-kisilik', title: 'Kişilik Gelişimi (Freud - Erikson)' },
        { id: 'gp-sosyal', title: 'Sosyal Gelişim' },
      ],
    },
    {
      id: 'ogrenme',
      title: 'Öğrenme Psikolojisi',
      icon: 'Ö',
      color: '#22d3ee',
      topics: [
        { id: 'op-temel', title: 'Öğrenme Temel Kavramlar' },
        { id: 'op-davranisci', title: 'Davranışçı Kuramlar' },
        { id: 'op-bilissel', title: 'Bilişsel Kuramlar' },
        { id: 'op-gestalt', title: 'Gestalt Kuramı' },
        { id: 'op-bilgi-isleme', title: 'Bilgi İşleme Kuramı' },
        { id: 'op-yapisalci', title: 'Yapılandırmacılık' },
        { id: 'op-bellek', title: 'Bellek ve Unutma' },
        { id: 'op-transfer', title: 'Transfer ve Güdülenme' },
      ],
    },
    {
      id: 'rehberlik',
      title: 'Rehberlik',
      icon: 'R',
      color: '#f59e0b',
      topics: [
        { id: 'r-temel', title: 'Rehberlik Temel Kavramları' },
        { id: 'r-turleri', title: 'Rehberlik Türleri' },
        { id: 'r-hizmetler', title: 'Rehberlik Hizmetleri' },
        { id: 'r-teknikler', title: 'Bireyi Tanıma Teknikleri' },
        { id: 'r-danisma', title: 'Psikolojik Danışma Kuramları' },
      ],
    },
    {
      id: 'olcme',
      title: 'Ölçme ve Değerlendirme',
      icon: 'Ö',
      color: '#10b981',
      topics: [
        { id: 'od-temel', title: 'Temel Kavramlar' },
        { id: 'od-olcek', title: 'Ölçek Türleri' },
        { id: 'od-gecerlik', title: 'Geçerlik - Güvenirlik' },
        { id: 'od-soru', title: 'Soru Türleri' },
        { id: 'od-madde', title: 'Madde Analizi' },
        { id: 'od-istatistik', title: 'İstatistik İşlemleri' },
        { id: 'od-notlama', title: 'Notlama Türleri' },
      ],
    },
    {
      id: 'program',
      title: 'Program Geliştirme',
      icon: 'P',
      color: '#ef4444',
      topics: [
        { id: 'pg-temel', title: 'Temel Kavramlar' },
        { id: 'pg-tasarim', title: 'Program Tasarım Yaklaşımları' },
        { id: 'pg-modeller', title: 'Program Geliştirme Modelleri' },
        { id: 'pg-hedef', title: 'Hedef - İçerik - Yaşantı' },
        { id: 'pg-degerlendirme', title: 'Programın Değerlendirilmesi' },
      ],
    },
    {
      id: 'ogretim',
      title: 'Öğretim İlke ve Yöntemleri',
      icon: 'Ö',
      color: '#8b5cf6',
      topics: [
        { id: 'oy-temel', title: 'Temel Kavramlar' },
        { id: 'oy-ilkeler', title: 'Öğretim İlkeleri' },
        { id: 'oy-yaklasim', title: 'Öğretim Yaklaşımları' },
        { id: 'oy-strateji', title: 'Öğretim Stratejileri' },
        { id: 'oy-yontem', title: 'Öğretim Yöntemleri' },
        { id: 'oy-teknik', title: 'Öğretim Teknikleri' },
        { id: 'oy-plan', title: 'Öğretim Planları ve Materyal' },
      ],
    },
    {
      id: 'teknoloji',
      title: 'Öğretim Teknolojileri',
      icon: 'T',
      color: '#06b6d4',
      topics: [
        { id: 'tm-temel', title: 'Temel Kavramlar' },
        { id: 'tm-iletisim', title: 'İletişim ve Öğretim' },
        { id: 'tm-materyal', title: 'Materyal Tasarımı' },
        { id: 'tm-teknoloji', title: 'Eğitim Teknolojileri' },
      ],
    },
    {
      id: 'sinif',
      title: 'Sınıf Yönetimi',
      icon: 'S',
      color: '#eab308',
      topics: [
        { id: 'sy-temel', title: 'Temel Kavramlar' },
        { id: 'sy-ortam', title: 'Sınıf Ortamı' },
        { id: 'sy-ilişkiler', title: 'Sınıf İçi İlişkiler' },
        { id: 'sy-disiplin', title: 'İstenmeyen Davranışlar' },
        { id: 'sy-zaman', title: 'Zaman ve Süreç Yönetimi' },
      ],
    },
  ],
};

export const sections: KpssSection[] = [genelYetenek, genelKultur, egitimBilimleri];

export const getSectionById = (id: string) => sections.find((s) => s.id === id);

export const getSubjectById = (subjectId: string) => {
  for (const section of sections) {
    const subject = section.subjects.find((s) => s.id === subjectId);
    if (subject) return { section, subject };
  }
  return null;
};

export const getTopicById = (topicId: string) => {
  for (const section of sections) {
    for (const subject of section.subjects) {
      const topic = subject.topics.find((t) => t.id === topicId);
      if (topic) return { section, subject, topic };
    }
  }
  return null;
};

export const countTopics = (section: KpssSection) =>
  section.subjects.reduce((acc, s) => acc + s.topics.length, 0);

export const countAllTopics = () =>
  sections.reduce((acc, s) => acc + countTopics(s), 0);

export const getSectionsForTrack = (track: KpssTrack): KpssSection[] => {
  if (track === 'egitim') return sections;
  return [genelYetenek, genelKultur];
};
