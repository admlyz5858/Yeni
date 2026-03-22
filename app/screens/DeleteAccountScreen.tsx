import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type Props = { navigation: any };

export default function DeleteAccountScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (confirm !== 'SİL') {
      Alert.alert('Hata', 'Onaylamak için "SİL" yazın.');
      return;
    }
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            logout();
            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Hesabı Sil</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Hesabınızı kalıcı olarak silin
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.warn, { color: theme.danger }]}>
          ⚠️ Bu işlem geri alınamaz. Tüm verileriniz silinecektir.
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
          placeholder="Onaylamak için SİL yazın"
          placeholderTextColor={theme.textSecondary}
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: theme.danger }]}
          onPress={handleDelete}
          disabled={loading}
        >
          <Text style={styles.deleteBtnText}>Hesabı Kalıcı Olarak Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 16 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  sub: { fontSize: 14 },
  content: { padding: 20 },
  warn: { fontSize: 15, marginBottom: 20 },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  deleteBtn: { padding: 18, borderRadius: 12, alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
