import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useGamification } from '../context/GamificationContext';
import { getQuoteOfDay, getTipOfDay } from '../data/activities';

type Props = {
  navigation: any;
};

export default function DailyActivityScreen({ navigation }: Props) {
  const {
    dailyChallenge,
    dailyChallengeProgress,
    dailyChallengeCompleted,
    dailyLoginBonus,
    claimDailyLogin,
    loginStreak,
  } = useGamification();

  const handleClaimBonus = () => {
    const bonus = claimDailyLogin();
    if (bonus > 0) Alert.alert('Tebrikler!', `+${bonus} XP kazandınız! (${loginStreak} günlük seri)`);
  };

  const quote = getQuoteOfDay(Date.now());
  const tip = getTipOfDay(Date.now());
  const progressPercent = Math.min(100, (dailyChallengeProgress / dailyChallenge.target) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Günlük Aktivite</Text>

      {dailyLoginBonus > 0 && (
        <TouchableOpacity style={styles.loginBonusCard} onPress={handleClaimBonus}>
          <Text style={styles.bonusIcon}>🎁</Text>
          <Text style={styles.bonusTitle}>Giriş Bonusu</Text>
          <Text style={styles.bonusValue}>+{dailyLoginBonus} XP</Text>
          <Text style={styles.bonusSub}>Almak için dokun ({loginStreak} günlük seri)</Text>
        </TouchableOpacity>
      )}

      <View style={styles.challengeCard}>
        <Text style={styles.challengeLabel}>Günün Görevi</Text>
        <Text style={styles.challengeIcon}>{dailyChallenge.icon}</Text>
        <Text style={styles.challengeTitle}>{dailyChallenge.title}</Text>
        <Text style={styles.challengeXp}>+{dailyChallenge.xp} XP</Text>
        {dailyChallengeCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✅ Tamamlandı!</Text>
          </View>
        ) : (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        )}
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteIcon}>💬</Text>
        <Text style={styles.quoteText}>"{quote.text}"</Text>
        <Text style={styles.quoteAuthor}>— {quote.author}</Text>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipTitle}>Günün İpucu</Text>
        <Text style={styles.tipText}>{tip}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { padding: 8, marginBottom: 16 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 24 },
  loginBonusCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  bonusIcon: { fontSize: 48, marginBottom: 8 },
  bonusTitle: { fontSize: 18, fontWeight: '600', color: '#92400e' },
  bonusValue: { fontSize: 24, fontWeight: 'bold', color: '#b45309' },
  bonusSub: { fontSize: 14, color: '#a16207', marginTop: 4 },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  challengeLabel: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  challengeIcon: { fontSize: 48, marginBottom: 8 },
  challengeTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  challengeXp: { fontSize: 16, color: '#059669', marginBottom: 16 },
  completedBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  completedText: { fontSize: 16, fontWeight: '600', color: '#059669' },
  progressBar: { width: '100%', height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 5 },
  quoteCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  quoteIcon: { fontSize: 24, marginBottom: 8 },
  quoteText: { fontSize: 16, fontStyle: 'italic', color: '#1e40af', lineHeight: 24 },
  quoteAuthor: { fontSize: 14, color: '#64748b', marginTop: 8 },
  tipCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
  },
  tipIcon: { fontSize: 24, marginBottom: 8 },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#166534' },
  tipText: { fontSize: 15, color: '#15803d', lineHeight: 24 },
});
