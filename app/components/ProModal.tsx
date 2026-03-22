import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FEATURES = [
  { icon: '💬', name: 'Bire Bir Koçluk' },
  { icon: '📷', name: 'Soru Çözücü' },
  { icon: '📅', name: 'Haftalık Plan' },
  { icon: '📖', name: 'Etüt Odası' },
  { icon: '🧠', name: 'Zihin Haritası' },
  { icon: '🔄', name: 'Dönüştürücü' },
];

type Props = {
  visible: boolean;
  onStart: () => void;
  onLater: () => void;
};

export default function ProModal({ visible, onStart, onLater }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.mascotWrap}>
              <Text style={styles.mascot}>🦉</Text>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Bilge Baykuş</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Kişisel sınav koçun seni bekliyor.</Text>
          </View>

          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <View key={f.name} style={styles.featureItem}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureName}>{f.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.trialBar}>
            <Text style={styles.trialCheck}>✓</Text>
            <Text style={styles.trialText}>Ücretsiz dene, istediğin zaman iptal et</Text>
          </View>

          <TouchableOpacity style={styles.ctaWrap} onPress={onStart}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaText}>Şimdi Ücretsiz Başla</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtn} onPress={onLater}>
            <Text style={styles.laterText}>Daha Sonra</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 24 },
  mascotWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mascot: { fontSize: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  proBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  proText: { fontSize: 14, fontWeight: '800', color: '#b45309' },
  subtitle: { fontSize: 15, color: '#64748b' },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    width: '30%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureName: { fontSize: 12, fontWeight: '600', color: '#334155', textAlign: 'center' },
  trialBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  trialCheck: { fontSize: 18, color: '#10b981' },
  trialText: { fontSize: 14, color: '#5b21b6', fontWeight: '500' },
  ctaWrap: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  ctaBtn: { padding: 20, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  laterBtn: { alignItems: 'center' },
  laterText: { fontSize: 15, color: '#64748b' },
});
