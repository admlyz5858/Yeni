import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type Props = { navigation: any };

export default function ChangePasswordScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user, resetPassword } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'E-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);
    if (result.ok) {
      Alert.alert('Gönderildi', 'E-posta adresinize şifre sıfırlama bağlantısı gönderildi.');
      navigation.goBack();
    } else {
      Alert.alert('Hata', result.error || 'Bir sorun oluştu.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Şifreyi Değiştir</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          E-posta adresinize şifre sıfırlama linki göndereceğiz
        </Text>
      </View>
      <View style={styles.content}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
          placeholder="E-posta"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.accent }]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Link Gönder</Text>}
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
  input: { borderWidth: 2, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  btn: { padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
