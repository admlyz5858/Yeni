import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';

type Props = {
  navigation: any;
};

type UserItem = { id: string; email: string; name: string; role: UserRole };

export default function AdminUsersScreen({ navigation }: Props) {
  const { getUsers } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Üye Yönetimi</Text>
        <Text style={styles.subtitle}>{users.length} kayıtlı kullanıcı</Text>
      </View>

      {users.map((u) => (
        <View key={u.id} style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{u.name}</Text>
            <Text style={styles.userEmail}>{u.email}</Text>
          </View>
          <View style={[styles.roleBadge, u.role === 'admin' ? styles.roleAdmin : styles.roleMember]}>
            <Text style={styles.roleText}>{u.role === 'admin' ? 'Admin' : 'Üye'}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { padding: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#64748b' },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  userEmail: { fontSize: 14, color: '#64748b' },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleAdmin: { backgroundColor: '#fef3c7' },
  roleMember: { backgroundColor: '#dbeafe' },
  roleText: { fontSize: 12, fontWeight: '600', color: '#1e293b' },
});
