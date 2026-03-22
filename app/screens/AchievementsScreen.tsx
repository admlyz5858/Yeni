import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useGamification } from '../context/GamificationContext';
import { useGame } from '../context/GameContext';

type Props = {
  navigation: any;
};

export default function AchievementsScreen({ navigation }: Props) {
  const { xp, level, levelProgress, achievements } = useGamification();
  const { titles, equippedTitleId, setEquippedTitle } = useGame();
  const unlocked = achievements.filter((a) => a.unlockedAt).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>Seviye {level}</Text>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${levelProgress.percent}%` }]} />
        </View>
        <Text style={styles.xpText}>{levelProgress.current} / {levelProgress.needed} XP</Text>
        <Text style={styles.totalXp}>{xp} toplam XP</Text>
      </View>

      <Text style={styles.sectionTitle}>🏷️ Ünvanlar</Text>
      <View style={styles.titlesRow}>
        {titles.map((t) => {
          const canUse = level >= t.minLevel;
          const isEquipped = equippedTitleId === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.titleChip, canUse && styles.titleChipUnlocked, isEquipped && styles.titleChipEquipped]}
              onPress={() => canUse && setEquippedTitle(t.id)}
              disabled={!canUse}
            >
              <Text style={[styles.titleChipText, !canUse && styles.titleChipLocked]}>
                {t.name} {!canUse && `(Sev.${t.minLevel})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>🌟 Rozetler ({unlocked}/{achievements.length})</Text>
      {achievements.map((a) => (
        <View
          key={a.id}
          style={[
            styles.achievementCard,
            !a.unlockedAt && styles.achievementLocked,
            a.premium && styles.achievementPremium,
          ]}
        >
          <Text style={styles.achievementIcon}>{a.icon}</Text>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementTitle, !a.unlockedAt && styles.textMuted]}>{a.title}</Text>
            <Text style={[styles.achievementDesc, !a.unlockedAt && styles.textMuted]}>{a.desc}</Text>
            {a.unlockedAt && (
              <Text style={styles.achievementDate}>
                {new Date(a.unlockedAt).toLocaleDateString('tr-TR')}
              </Text>
            )}
          </View>
          <View style={[styles.xpBadge, !a.unlockedAt && styles.xpBadgeLocked]}>
            <Text style={styles.xpBadgeText}>+{a.xp}</Text>
          </View>
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
  levelCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  levelLabel: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  xpBar: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  xpFill: { height: '100%', backgroundColor: '#fff', borderRadius: 6 },
  xpText: { fontSize: 14, color: '#fff' },
  totalXp: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 12 },
  titlesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  titleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  titleChipUnlocked: { backgroundColor: '#e0e7ff' },
  titleChipEquipped: { backgroundColor: '#7c3aed' },
  titleChipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  titleChipLocked: { color: '#94a3b8' },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementLocked: { opacity: 0.6 },
  achievementPremium: { borderWidth: 2, borderColor: '#f59e0b' },
  achievementIcon: { fontSize: 36, marginRight: 16 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b' },
  achievementDesc: { fontSize: 14, color: '#64748b' },
  achievementDate: { fontSize: 12, color: '#059669', marginTop: 4 },
  textMuted: { color: '#94a3b8' },
  xpBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  xpBadgeLocked: { backgroundColor: '#f1f5f9' },
  xpBadgeText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
});
