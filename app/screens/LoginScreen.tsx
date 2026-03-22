import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';

type Props = {
  onLogin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onGoRegister: () => void;
};

export default function LoginScreen({ onLogin, onGoRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Hata', 'E-posta ve şifre girin.');
      return;
    }
    setLoading(true);
    const result = await onLogin(email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      Alert.alert('Giriş Başarısız', result.error || 'Bir hata oluştu.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Çalışma Asistanı</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={onGoRegister}>
          <Text style={styles.linkText}>Hesabınız yok mu? Kayıt olun</Text>
        </TouchableOpacity>

        <View style={styles.demo}>
          <Text style={styles.demoText}>Demo: admin@admin.com / admin123</Text>
          <Text style={styles.demoText}>Üye: uye@uygulama.com / uyari123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  link: { padding: 16, alignItems: 'center' },
  linkText: { color: '#2563eb', fontSize: 16 },
  demo: { marginTop: 32, padding: 16, backgroundColor: '#f1f5f9', borderRadius: 12 },
  demoText: { fontSize: 13, color: '#64748b', textAlign: 'center' },
});
