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
import { useGame } from '../context/GameContext';
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
    xp,
  } = useGamification();
  const {
    weeklyQuests,
    weeklyQuestProgress,
    weeklyCompleted,
    claimWeeklyQuest,
    powerUps,
    activatePowerUp,
  } = useGame();

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

      <Text style={styles.sectionTitle}>📋 Haftalık Görevler</Text>
      {weeklyQuests.map((q) => {
        const prog = weeklyQuestProgress[q.id] ?? 0;
        const done = prog >= q.target;
        const alreadyClaimed = weeklyCompleted[q.id];
        const canClaim = done && !alreadyClaimed;
        return (
          <View key={q.id} style={[styles.questCard, done && styles.questCardDone]}>
            <Text style={styles.questIcon}>{q.icon}</Text>
            <View style={styles.questInfo}>
              <Text style={styles.questTitle}>{q.title}</Text>
              <Text style={styles.questProgress}>
                {Math.min(prog, q.target)} / {q.target} • +{q.xp} XP
              </Text>
              <View style={styles.questBar}>
                <View style={[styles.questBarFill, { width: `${Math.min(100, (prog / q.target) * 100)}%` }]} />
              </View>
            </View>
            {canClaim ? (
              <TouchableOpacity
                style={styles.claimBtn}
                onPress={() => {
                  const earned = claimWeeklyQuest(q.id);
                  if (earned > 0) Alert.alert('Tebrikler!', `+${earned} XP kazandınız!`);
                }}
              >
                <Text style={styles.claimBtnText}>Al</Text>
              </TouchableOpacity>
            ) : alreadyClaimed ? (
              <View style={styles.claimedBadge}>
                <Text style={styles.claimedText}>✓ Alındı</Text>
              </View>
            ) : null}
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>⚡ Güçlendirmeler</Text>
      {powerUps.map((pu) => (
        <TouchableOpacity
          key={pu.id}
          style={[styles.powerUpCard, xp < pu.costXp && styles.powerUpDisabled]}
          onPress={() => {
            if (xp < pu.costXp) return;
            const ok = activatePowerUp(pu.id);
            if (ok) Alert.alert('Aktif!', `${pu.name} kullanıldı. ${pu.desc}`);
          }}
          disabled={xp < pu.costXp}
        >
          <Text style={styles.powerUpIcon}>{pu.icon}</Text>
          <View style={styles.powerUpInfo}>
            <Text style={styles.powerUpName}>{pu.name}</Text>
            <Text style={styles.powerUpDesc}>{pu.desc}</Text>
          </View>
          <Text style={styles.powerUpCost}>{pu.costXp} XP</Text>
        </TouchableOpacity>
      ))}

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
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 12, marginTop: 8 },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  questCardDone: { backgroundColor: '#ecfdf5', borderWidth: 2, borderColor: '#059669' },
  questIcon: { fontSize: 28, marginRight: 12 },
  questInfo: { flex: 1 },
  questTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  questProgress: { fontSize: 13, color: '#64748b', marginTop: 4 },
  questBar: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  questBarFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 3 },
  claimBtn: { backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  claimBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  claimedBadge: { paddingHorizontal: 12, paddingVertical: 6 },
  claimedText: { fontSize: 14, color: '#059669', fontWeight: '600' },
  powerUpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  powerUpDisabled: { opacity: 0.6, borderColor: '#d1d5db' },
  powerUpIcon: { fontSize: 28, marginRight: 12 },
  powerUpInfo: { flex: 1 },
  powerUpName: { fontSize: 16, fontWeight: '600', color: '#92400e' },
  powerUpDesc: { fontSize: 13, color: '#b45309', marginTop: 2 },
  powerUpCost: { fontSize: 14, fontWeight: '700', color: '#b45309' },
  tipCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  tipIcon: { fontSize: 24, marginBottom: 8 },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#166534' },
  tipText: { fontSize: 15, color: '#15803d', lineHeight: 24 },
});
