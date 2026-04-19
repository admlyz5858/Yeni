export const focusStartMessages = [
  'Odaklan. Sen buraya boşuna gelmedin.',
  'Bir domates, bir adım — hedefe yaklaşıyorsun.',
  'Bu 25 dakika sadece senin. Elini telefondan çek.',
  'Küçük seanslar, büyük sonuçlar doğurur.',
  'Bugünkü halin yarının başarısını kuracak.',
  'Dikkatini şu anda topla. Gerisi otomatik gelir.',
  'En iyi adaylar da böyle başladı.',
  'Konuyu küçük parçalara böl, her birine ayrı zaman ver.',
];

export const focusCompleteMessages = [
  'Güzel seans! Derin bir nefes al.',
  'Bir tomato daha düştü. Devam.',
  'İşte bu! Beynin teşekkür ediyor.',
  'Odaklanma kasın büyüyor.',
  'Tamamlanan her seans sınav günü sana güç olacak.',
];

export const breakStartMessages = [
  'Molanı hak ettin. Gözlerini kapatmayı dene.',
  'Kısa bir yürüyüş zihni temizler.',
  'Su iç, birkaç derin nefes al.',
  'Telefondan uzak dur, beynine de mola ver.',
  'Gerinme, esneme, omuzlarını gevşet.',
];

export const longBreakMessages = [
  'Uzun mola zamanı! Atıştırmalık + hareket harika olur.',
  '4 seans yaptın. Şimdi biraz dışarı çık.',
  'Beyin kimyanı yenile: 15 dakikalık gerçek bir mola.',
];

export const longBreakCompleteMessages = [
  'Harikaydın! Yeni sete başlamaya hazır mısın?',
  'Büyük bir döngüyü bitirdin. Tempo düşmesin!',
];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
