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

export default function LeaderboardScreen({ navigation }: Props) {
  const { xp, level } = useGamification();
  const { leaderboard, equippedTitleId, titles } = useGame();
  const myRank = leaderboard.find((r) => r.isUser)?.rank ?? 0;
  const myTitle = titles.find((t) => t.id === equippedTitleId)?.name ?? '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🏆 Haftalık Sıralama</Text>
      <Text style={styles.subtitle}>Bu haftanın en çalışkanları</Text>

      <View style={styles.rankCard}>
        <Text style={styles.rankLabel}>Senin Sıralaman</Text>
        <View style={styles.rankRow}>
          <View style={[styles.rankBadge, myRank <= 3 && styles.rankTop3]}>
            <Text style={styles.rankNum}>#{myRank}</Text>
          </View>
          <View style={styles.rankInfo}>
            <Text style={styles.rankName}>{myTitle} • Sen</Text>
            <Text style={styles.rankXp}>{xp} XP • Seviye {level}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.listTitle}>Liderler</Text>
      {leaderboard.map((r) => (
        <View
          key={r.rank + r.name}
          style={[styles.row, r.isUser && styles.rowHighlight]}
        >
          <View style={[styles.rankBox, r.rank <= 3 && styles.rankBoxTop]}>
            <Text style={styles.rankBoxText}>
              {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`}
            </Text>
          </View>
          <Text style={[styles.rowName, r.isUser && styles.rowNameBold]} numberOfLines={1}>
            {r.name}
          </Text>
          <Text style={styles.rowXp}>{r.xp} XP</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#64748b', marginBottom: 24 },
  rankCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  rankLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  rankRow: { flexDirection: 'row', alignItems: 'center' },
  rankBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankTop3: { backgroundColor: '#fbbf24' },
  rankNum: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  rankXp: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  listTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowHighlight: { backgroundColor: '#ede9fe', borderWidth: 2, borderColor: '#7c3aed' },
  rankBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBoxTop: { backgroundColor: '#fef3c7' },
  rankBoxText: { fontSize: 14, fontWeight: '700' },
  rowName: { flex: 1, fontSize: 16, color: '#334155' },
  rowNameBold: { fontWeight: '700', color: '#7c3aed' },
  rowXp: { fontSize: 15, fontWeight: '600', color: '#64748b' },
});
