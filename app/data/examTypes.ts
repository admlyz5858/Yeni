export type ExamType = 'kpss' | 'dgs' | 'ales' | 'yds';

export type ExamInfo = {
  id: ExamType;
  name: string;
  fullName: string;
  icon: string;
  color: string;
};

export const EXAM_TYPES: ExamInfo[] = [
  { id: 'kpss', name: 'KPSS', fullName: 'Kamu Personeli Seçme Sınavı', icon: '📋', color: '#2563eb' },
  { id: 'dgs', name: 'DGS', fullName: 'Dikey Geçiş Sınavı', icon: '🎓', color: '#059669' },
  { id: 'ales', name: 'ALES', fullName: 'Akademik Personel ve Lisansüstü Eğitimi', icon: '📖', color: '#7c3aed' },
  { id: 'yds', name: 'YDS', fullName: 'Yabancı Dil Bilgisi Seviye Tespit', icon: '🌐', color: '#d97706' },
];
