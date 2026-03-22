import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'KPSS Planlama',
    desc: 'Sınavınıza planlı çalışın. Konuları takip edin, hedeflerinizi belirleyin.',
    icon: '📚',
  },
  {
    title: 'Pomodoro Zamanlayıcı',
    desc: '25 dakika odaklanma, 5 dakika mola. Verimli çalışma seansları.',
    icon: '⏱️',
  },
  {
    title: 'Çalışma Günlüğü',
    desc: 'Her gün çalıştığınız saatleri kaydedin. Serinizi kırma!',
    icon: '📊',
  },
];

type Props = {
  onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  return (
    <View style={styles.container}>
      <View style={styles.slide}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.buttons}>
        {index < SLIDES.length - 1 ? (
          <>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={onComplete}
            >
              <Text style={styles.skipText}>Atla</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => setIndex((i) => i + 1)}
            >
              <Text style={styles.nextText}>İleri</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.startBtn} onPress={onComplete}>
            <Text style={styles.startText}>Başla</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 24,
  },
  slide: { alignItems: 'center', marginBottom: 48 },
  icon: { fontSize: 80, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: 16 },
  desc: { fontSize: 17, color: '#64748b', textAlign: 'center', lineHeight: 26, paddingHorizontal: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 48 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#cbd5e1' },
  dotActive: { backgroundColor: '#2563eb', width: 24 },
  buttons: { gap: 12 },
  skipBtn: { padding: 16, alignItems: 'center' },
  skipText: { color: '#64748b', fontSize: 16 },
  nextBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  startBtn: {
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  startText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
