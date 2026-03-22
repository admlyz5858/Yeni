import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { usePlan } from '../../context/PlanContext';
import { SUBJECTS } from '../../data/subjects';

type Props = {
  navigation: any;
};

export default function AdminDashboard({ navigation }: Props) {
  const { user, logout, getUsers } = useAuth();
  const { completedTopics, studyLog } = usePlan();
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    getUsers().then((users) => setUserCount(users.length));
  }, []);

  const totalTopics = SUBJECTS.reduce((acc, s) => acc + s.topics.length, 0);
  const totalCompleted = Object.values(completedTopics).reduce(
    (acc, subj) => acc + Object.values(subj).filter(Boolean).length,
    0
  );
  const totalStudyHours = Object.values(studyLog).reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hoş geldiniz, {user?.name}</Text>
          <Text style={styles.role}>Yönetici Paneli</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardIcon}>👥</Text>
        <Text style={styles.cardValue}>{userCount}</Text>
        <Text style={styles.cardLabel}>Kayıtlı Üye</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardIcon}>📋</Text>
        <Text style={styles.cardValue}>{totalCompleted} / {totalTopics}</Text>
        <Text style={styles.cardLabel}>Toplam Tamamlanan Konu</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardIcon}>⏱️</Text>
        <Text style={styles.cardValue}>{totalStudyHours.toFixed(1)}</Text>
        <Text style={styles.cardLabel}>Toplam Çalışma Saati</Text>
      </View>

      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => navigation.navigate('AdminUsers')}
      >
        <Text style={styles.menuIcon}>👥</Text>
        <Text style={styles.menuTitle}>Üye Yönetimi</Text>
        <Text style={styles.menuSub}>Kayıtlı kullanıcıları görüntüle</Text>
        <Text style={styles.menuArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  greeting: { fontSize: 20, fontWeight: '600', color: '#0f172a' },
  role: { fontSize: 14, color: '#64748b' },
  logoutBtn: { padding: 12, backgroundColor: '#fef2f2', borderRadius: 12 },
  logoutText: { color: '#dc2626', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIcon: { fontSize: 36, marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  cardLabel: { fontSize: 14, color: '#64748b' },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIcon: { fontSize: 28, marginRight: 16 },
  menuTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', flex: 1 },
  menuSub: { fontSize: 14, color: '#64748b', position: 'absolute', left: 56, top: 42 },
  menuArrow: { fontSize: 20, color: '#64748b' },
});
