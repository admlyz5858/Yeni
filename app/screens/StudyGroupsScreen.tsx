import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { usePlan } from '../context/PlanContext';

type Props = {
  navigation: any;
};

function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function StudyGroupsScreen({ navigation }: Props) {
  const { studyGroups, myGroupId, joinGroup, leaveGroup } = useGame();
  const { studyLog } = usePlan();
  const weekDates = getWeekDates();
  const myWeekHours = weekDates.reduce((a, d) => a + (studyLog[d] || 0), 0);

  const handleJoin = (groupId: string) => {
    if (myGroupId === groupId) return;
    joinGroup(groupId);
    Alert.alert('Gruba Katıldın!', 'Grup hedeflerine ulaşmak için birlikte çalışalım! 🎉');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>👥 Çalışma Grupları</Text>
      <Text style={styles.subtitle}>
        Bir gruba katıl, hedeflere birlikte ulaş! Bu hafta: {myWeekHours.toFixed(1)} saat
      </Text>

      {myGroupId && (
        <TouchableOpacity style={styles.leaveBtn} onPress={() => leaveGroup()}>
          <Text style={styles.leaveBtnText}>Gruptan Ayrıl</Text>
        </TouchableOpacity>
      )}

      {studyGroups.map((g) => {
        const isJoined = myGroupId === g.id;
        const progress = Math.min(100, (myWeekHours / g.weeklyGoal) * 100);
        return (
          <TouchableOpacity
            key={g.id}
            style={[styles.groupCard, isJoined && styles.groupCardJoined]}
            onPress={() => handleJoin(g.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.groupIconWrap, { backgroundColor: g.color + '20' }]}>
              <Text style={styles.groupIcon}>{g.icon}</Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{g.name}</Text>
              <Text style={styles.groupMeta}>
                Haftalık hedef: {g.weeklyGoal} saat • {g.members} üye
              </Text>
              {isJoined && (
                <View style={styles.progressWrap}>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: g.color }]} />
                  </View>
                  <Text style={styles.progressText}>
                    Senin ilerleme: {myWeekHours.toFixed(1)} / {g.weeklyGoal} saat
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.joinBadge, isJoined && styles.joinBadgeDone]}>
              <Text style={styles.joinBadgeText}>{isJoined ? '✓' : 'Katıl'}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { padding: 8, marginBottom: 16 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#64748b', marginBottom: 20 },
  leaveBtn: { alignSelf: 'flex-end', padding: 8, marginBottom: 16 },
  leaveBtnText: { fontSize: 14, color: '#dc2626' },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  groupCardJoined: { borderWidth: 2, borderColor: '#7c3aed' },
  groupIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupIcon: { fontSize: 28 },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
  groupMeta: { fontSize: 14, color: '#64748b', marginTop: 4 },
  progressWrap: { marginTop: 12 },
  progressBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#64748b', marginTop: 4 },
  joinBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinBadgeDone: { backgroundColor: '#059669' },
  joinBadgeText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
