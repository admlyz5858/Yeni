export const MOTIVATIONAL_QUOTES = [
  { text: 'Başarı, küçük çabaların günlük tekrarlanmasıdır.', author: 'Robert Collier' },
  { text: 'Bugünün işini yarına bırakma.', author: 'Benjamin Franklin' },
  { text: 'Öğrenmek bir hazinedir; her yerde sahibini takip eder.', author: 'Çin Atasözü' },
  { text: 'Disiplin, motivasyon ile arasındaki köprüdür.', author: 'Jim Rohn' },
  { text: 'Zor işler, onu yapmaya cesaret edenlere aittir.', author: 'Jackie Joyner' },
  { text: 'Küçük adımlar, büyük hedeflere götürür.', author: 'Anonim' },
  { text: 'Sınava hazırlanırken her gün sayılır.', author: 'Anonim' },
  { text: 'Pes etmediğin sürece kaybetmiş sayılmazsın.', author: 'Anonim' },
  { text: 'Çalışkanlık, yeteneği geçer.', author: 'Anonim' },
  { text: 'Bugün çalış, yarın başarılı ol.', author: 'Anonim' },
];

export const STUDY_TIPS = [
  'Pomodoro tekniği ile 25 dakika odaklan, 5 dakika mola ver.',
  'Sabah erken saatlerde çalışmak verimliliği artırır.',
  'Konu notları almak hatırlamayı %40 artırır.',
  'Aralıklı tekrar, uzun süreli hafıza için en etkili yöntemdir.',
  'Farklı konuları dönüşümlü çalış, monotonluktan kaçın.',
  'Hedefleri küçük parçalara böl, her gün ulaşılabilir hedefler koy.',
  'Uyku düzeni, öğrenme performansını doğrudan etkiler.',
  'Çalışma ortamını düzenli tut, dikkat dağıtıcıları kaldır.',
  'Özet çıkarmak yerine kendi cümlelerinle açıkla.',
  'Test çözmek, pasif okumadan daha etkilidir.',
  'Konu tekrarı, yeni öğrenmeden önce yapılmalı.',
  'Fiziksel aktivite, beyin performansını artırır.',
];

export const DAILY_CHALLENGE_TYPES = [
  { id: 'study_1', type: 'hours', target: 1, xp: 30, title: '1 Saat Çalış', icon: '⏱️' },
  { id: 'study_2', type: 'hours', target: 2, xp: 60, title: '2 Saat Çalış', icon: '📚' },
  { id: 'study_3', type: 'hours', target: 3, xp: 100, title: '3 Saat Çalış', icon: '🎯' },
  { id: 'topic_1', type: 'topics', target: 1, xp: 40, title: '1 Konu Tamamla', icon: '✅' },
  { id: 'topic_2', type: 'topics', target: 2, xp: 80, title: '2 Konu Tamamla', icon: '📋' },
  { id: 'pomodoro_2', type: 'pomodoro', target: 2, xp: 50, title: '2 Pomodoro Yap', icon: '🍅' },
  { id: 'pomodoro_4', type: 'pomodoro', target: 4, xp: 120, title: '4 Pomodoro Yap', icon: '🔥' },
  { id: 'flashcard_5', type: 'flashcards', target: 5, xp: 45, title: '5 Kart Tekrarla', icon: '📇' },
  { id: 'note_1', type: 'notes', target: 1, xp: 25, title: '1 Konu Notu Yaz', icon: '📝' },
  { id: 'early_study', type: 'early', target: 1, xp: 50, title: 'Sabah 8\'den Önce Başla', icon: '🌅' },
];

export function getDailyChallenge(seed: number) {
  const dayOfYear = Math.floor(seed / (1000 * 60 * 60 * 24));
  return DAILY_CHALLENGE_TYPES[dayOfYear % DAILY_CHALLENGE_TYPES.length];
}

export function getQuoteOfDay(seed: number) {
  const dayOfYear = Math.floor(seed / (1000 * 60 * 60 * 24));
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

export function getTipOfDay(seed: number) {
  const dayOfYear = Math.floor(seed / (1000 * 60 * 60 * 24));
  return STUDY_TIPS[dayOfYear % STUDY_TIPS.length];
}
