import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CYAN = '#06b6d4';
const GREEN = '#10b981';
const ORANGE = '#f97316';
const PURPLE = '#8b5cf6';
const BLUE = '#3b82f6';

const SLIDES = [
  {
    id: 'intro',
    title: 'Selam! Ben Bilge Baykuş',
    desc: 'Sınav maratonunda sadece bir uygulama değil, seni başarıya taşıyacak yol arkadaşınım. Zirveye giden yolda motivasyonun ve stratejin benden sorulur!',
    icon: '🦉',
    gradient: ['#e0e7ff', '#f5f3ff'] as [string, string],
  },
  {
    id: 'plan',
    title: 'Haftalık Plan',
    desc: 'Senin hızına, eksiklerine ve boş günlerine göre hazırlanan nokta atışı ders programı. Neyi ne zaman çalışacağını dert etme, rotanı ben çizerim.',
    icon: '📅',
    gradient: ['#e0f2f1', '#b2dfdb'] as [string, string],
  },
  {
    id: 'soru',
    title: 'Soru Çözücü',
    desc: 'Takıldığın sorunun fotoğrafını çek, saniyeler içinde çözümünü ve mantığını anlatayım. Sadece cevabı değil, işin sırrını öğren. Özel ders artık cebinde!',
    icon: '📷✨',
    gradient: ['#fff7ed', '#ffedd5'] as [string, string],
    btnColor: ORANGE,
  },
  {
    id: 'etut',
    title: 'Etüt Odası',
    desc: 'Sıkıcı testleri unut! Soruları Reels kaydırır gibi çöz, eksik konularını eğlenceli bir alışkanlığa dönüştür. Zayıf noktalarını tespit edip özel içeriklerle seni ustalaştırırım.',
    icon: '📖',
    gradient: ['#ede9fe', '#e9d5ff'] as [string, string],
    btnColor: PURPLE,
  },
  {
    id: 'donusturucu',
    title: 'Dönüştürücü',
    desc: 'Ders notlarını veya kitap sayfalarını yükle; senin için anında özetler, bilgi kartları ve testler hazırlayayım. Verimli çalışmanın en teknolojik hali.',
    icon: '⚡',
    gradient: ['#e0f2fe', '#bae6fd'] as [string, string],
    btnColor: BLUE,
  },
  {
    id: 'zihin',
    title: 'Zihin Haritası',
    desc: 'Karmaşık konuları görselleştirerek hafızana kazıyorum. Bilgiyi senin için organize edip büyük resmi gösteriyor, öğrenmeyi kalıcı hale getiriyorum.',
    icon: '🧠',
    gradient: ['#e0e7ff', '#c7d2fe'] as [string, string],
    btnColor: BLUE,
  },
  {
    id: 'analiz',
    title: 'Akıllı Analiz Sistemi',
    desc: 'Gelişimini adım adım takip ederim. Deneme sonuçlarını analiz eder, hangi konuda ne kadar ilerlediğini raporlarım. Başarı tesadüf değildir!',
    icon: '📊',
    gradient: ['#e0f2fe', '#bae6fd'] as [string, string],
    btnColor: CYAN,
  },
  {
    id: 'oyunlar',
    title: 'Taktik Oyunları',
    desc: 'Sınavına özel oyunlarla öğren! Oyna, puan kazan ve rekabette yerini al.',
    icon: '🎮',
    gradient: ['#ede9fe', '#e9d5ff'] as [string, string],
    btnColor: PURPLE,
    isLast: true,
  },
];

type Props = {
  onComplete: () => void;
  onExamSelect?: (examId: string) => void;
  examSelectionStep?: React.ReactNode;
};

export default function OnboardingScreen({
  onComplete,
  onExamSelect,
  examSelectionStep,
}: Props) {
  const [index, setIndex] = useState(0);
  const [showExamStep, setShowExamStep] = useState(false);

  const totalSteps = examSelectionStep ? SLIDES.length + 1 : SLIDES.length;
  const isExamStep = examSelectionStep && index === SLIDES.length;
  const currentSlide = SLIDES[index];
  const isLastSlide = index === SLIDES.length - 1 && !examSelectionStep;
  const isLastBeforeExam = examSelectionStep && index === SLIDES.length - 1;
  const isGamesSlide = currentSlide?.id === 'oyunlar';

  const handleNext = () => {
    if (isExamStep) {
      onComplete();
      return;
    }
    if (examSelectionStep && index === SLIDES.length - 1) {
      setShowExamStep(true);
      setIndex(SLIDES.length);
      return;
    }
    if (index < SLIDES.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (showExamStep) {
      onComplete();
    } else {
      onComplete();
    }
  };

  const btnColor = (currentSlide as any)?.btnColor;
  const isLastScreen = isGamesSlide && examSelectionStep;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Atla</Text>
      </TouchableOpacity>

      {isExamStep && examSelectionStep ? (
        <View style={styles.examStep}>
          {examSelectionStep}
        </View>
      ) : currentSlide ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.slide}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={currentSlide.gradient}
            style={styles.card}
          >
            <Text style={styles.icon}>{currentSlide.icon}</Text>
          </LinearGradient>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.desc}>{currentSlide.desc}</Text>
        </ScrollView>
      ) : null}

      <View style={styles.dots}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index ? (isExamStep ? styles.dotGreen : styles.dotActive) : undefined,
              i === index && btnColor ? { backgroundColor: btnColor } : undefined,
            ]}
          />
        ))}
      </View>

      {!isExamStep && (
        <TouchableOpacity
          style={[
            styles.nextBtn,
            (isLastSlide || isLastBeforeExam) ? styles.nextBtnGreen : undefined,
            isLastScreen ? styles.nextBtnPurple : undefined,
            btnColor && !isLastScreen && !isLastSlide && !isLastBeforeExam ? { backgroundColor: btnColor } : undefined,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {isLastScreen ? 'Başlayalım 🚀' : isLastBeforeExam ? 'Devam Et' : isLastSlide ? 'Hazırım! →' : 'Devam Et →'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    paddingTop: 48,
  },
  skipBtn: { alignSelf: 'flex-end', padding: 16, marginBottom: 8 },
  skipText: { color: '#64748b', fontSize: 16 },
  scroll: { flex: 1 },
  slide: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 24 },
  card: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: { fontSize: 100 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  desc: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  dotActive: {
    width: 24,
    backgroundColor: CYAN,
  },
  dotGreen: { backgroundColor: GREEN },
  nextBtn: {
    backgroundColor: CYAN,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  nextBtnGreen: { backgroundColor: GREEN },
  nextBtnPurple: { backgroundColor: PURPLE },
  nextText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  examStep: { flex: 1 },
});
