import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { usePlan } from '../context/PlanContext';

function getStreak(studyLog: Record<string, number>): number {
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  const d = new Date(today);
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if ((studyLog[key] || 0) >= 0.5) streak++;
    else if (key !== today) break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

type Props = { navigation: any };

export default function ProfileScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { xp, level, levelProgress } = useGamification();
  const { studyLog, completedTopics } = usePlan();

  const streak = getStreak(studyLog);
  const doneCount = Object.values(completedTopics).reduce(
    (acc, subj) => acc + Object.values(subj).filter(Boolean).length,
    0
  );
  const xpToNext = Math.min(500, Math.max(0, 500 - (xp % 500)));
  const xpProgress = (xp % 500) / 500;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profilim</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.card }]}
            onPress={() => (navigation.getParent() as any)?.getParent()?.openDrawer?.()}
          >
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.card }]}>
            <Text style={styles.iconText}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.card }]}
            onPress={() => navigation.getParent()?.navigate('Settings')}
          >
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatarGlow, { borderColor: '#22d3ee' }]}>
            <View style={[styles.avatar, { backgroundColor: theme.accentLight }]}>
              <Text style={styles.avatarEmoji}>📚</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Kullanıcı'}</Text>
        <View style={[styles.rankBadge, { backgroundColor: theme.accentLight }]}>
          <Text style={styles.rankIcon}>🧭</Text>
          <Text style={[styles.rankText, { color: theme.accent }]}>Acemi Kâşif</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: theme.text }]}>⚡ Taktik Puanı</Text>
            <Text style={[styles.progressValue, { color: theme.textSecondary }]}>
              {xp % 500} / 500
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: theme.cardBorder }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${xpProgress * 100}%`, backgroundColor: '#22d3ee' },
              ]}
            />
          </View>
        </View>

        <View style={[styles.statsGrid, { backgroundColor: theme.bg }]}>
          <View style={[styles.statCell, { borderRightWidth: 1, borderBottomWidth: 1, borderColor: theme.cardBorder }]}>
            <Text style={styles.statIcon}>🏅</Text>
            <Text style={[styles.statVal, { color: theme.text }]}>0/15</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Madalyalar</Text>
          </View>
          <View style={[styles.statCell, { borderBottomWidth: 1, borderColor: theme.cardBorder }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={[styles.statVal, { color: theme.text }]}>{level}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Seviye</Text>
          </View>
          <View style={[styles.statCell, { borderRightWidth: 1, borderColor: theme.cardBorder }]}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={[styles.statVal, { color: theme.text }]}>{doneCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Konu</Text>
          </View>
          <View style={[styles.statCell, { borderColor: theme.cardBorder }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statVal, { color: theme.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Seri</Text>
          </View>
        </View>

        <View style={styles.socialRow}>
          <View style={[styles.socialCard, { backgroundColor: theme.accentLight }]}>
            <Text style={[styles.socialVal, { color: theme.accent }]}>0</Text>
            <Text style={[styles.socialLabel, { color: theme.textSecondary }]}>Takipçi</Text>
          </View>
          <View style={[styles.socialCard, { backgroundColor: theme.accentLight }]}>
            <Text style={[styles.socialVal, { color: theme.accent }]}>0</Text>
            <Text style={[styles.socialLabel, { color: theme.textSecondary }]}>Takip</Text>
          </View>
        </View>

        <View style={styles.branding}>
          <Text style={styles.brandIcon}>📖</Text>
          <Text style={[styles.brandText, { color: theme.accent }]}>Çalışma Asistanı</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 18 },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  avatarWrap: { marginBottom: 16 },
  avatarGlow: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 40 },
  userName: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 24,
  },
  rankIcon: { fontSize: 16 },
  rankText: { fontSize: 14, fontWeight: '600' },
  progressSection: { width: '100%', marginBottom: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600' },
  progressValue: { fontSize: 14 },
  progressBarBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  statCell: {
    width: '50%',
    padding: 20,
    alignItems: 'center',
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statVal: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 13, marginTop: 4 },
  socialRow: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 20 },
  socialCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  socialVal: { fontSize: 28, fontWeight: 'bold' },
  socialLabel: { fontSize: 14, marginTop: 4 },
  branding: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { fontSize: 24 },
  brandText: { fontSize: 16, fontWeight: '600' },
});
