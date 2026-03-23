import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { usePremium } from '../context/PremiumContext';
import { useGamification } from '../context/GamificationContext';

const XP_NEEDED = 5000;

type Props = {
  navigation: any;
};

export default function PremiumScreen({ navigation }: Props) {
  const { isPremium, setPremium, unlockWithXp, features } = usePremium();
  const { xp } = useGamification();

  const handleUnlockWithXp = () => {
    if (unlockWithXp(xp)) {
      Alert.alert('Tebrikler!', 'Premium paket açıldı! 5000 XP ile kilidi açtınız.');
    } else {
      Alert.alert('Yetersiz XP', `Premium için ${XP_NEEDED - xp} XP daha gerekli.`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.title}>Premium</Text>
        <Text style={styles.subtitle}>
          {isPremium ? 'Tüm özelliklere sahipsiniz!' : 'Sınırsız özelliklerin kilidini açın'}
        </Text>
      </View>

      {!isPremium && (
        <View style={styles.unlockCard}>
          <Text style={styles.unlockTitle}>5000 XP ile Aç</Text>
          <Text style={styles.unlockSub}>XP kazanmak için çalışın ve rozetler açın</Text>
          <Text style={styles.unlockProgress}>{xp} / 5000 XP</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${Math.min(100, (xp / XP_NEEDED) * 100)}%` }]} />
          </View>
          <TouchableOpacity
            style={[styles.unlockBtn, xp < XP_NEEDED && styles.unlockBtnDisabled]}
            onPress={handleUnlockWithXp}
          >
            <Text style={styles.unlockBtnText}>
              {xp >= XP_NEEDED ? 'Premium Aç' : 'XP Toplamaya Devam Et'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isPremium && (
        <TouchableOpacity
          style={styles.demoPremiumBtn}
          onPress={() => {
            Alert.alert('Demo', 'Gerçek uygulamada satın alma ile açılır. Demo için Premium\'u açmak ister misiniz?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Aç', onPress: () => setPremium(true) },
            ]);
          }}
        >
          <Text style={styles.demoBtnText}>🎮 Demo: Premium\'u Aç</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.featuresTitle}>Premium Özellikler</Text>
      {features.map((f) => (
        <View key={f.id} style={styles.featureRow}>
          <Text style={styles.featureIcon}>{f.icon}</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureName}>{f.name}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
          {isPremium && <Text style={styles.check}>✓</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { padding: 8, marginBottom: 16 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  header: { alignItems: 'center', marginBottom: 24 },
  crown: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 8 },
  unlockCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  unlockTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  unlockSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  unlockProgress: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 12 },
  xpBar: { width: '100%', height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5, overflow: 'hidden', marginTop: 8 },
  xpFill: { height: '100%', backgroundColor: '#fff', borderRadius: 5 },
  unlockBtn: { marginTop: 16, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#fff', borderRadius: 12 },
  unlockBtnDisabled: { opacity: 0.7 },
  unlockBtnText: { color: '#7c3aed', fontWeight: '700' },
  demoPremiumBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  demoBtnText: { fontSize: 16, color: '#64748b' },
  featuresTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8 },
  featureIcon: { fontSize: 24, marginRight: 12 },
  featureInfo: { flex: 1 },
  featureName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  featureDesc: { fontSize: 13, color: '#64748b' },
  check: { fontSize: 20, color: '#059669', fontWeight: 'bold' },
});
