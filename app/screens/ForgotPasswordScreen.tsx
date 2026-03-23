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
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  onReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  onGoLogin: () => void;
};

export default function ForgotPasswordScreen({ onReset, onGoLogin }: Props) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'E-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    const result = await onReset(email.trim());
    setLoading(false);
    if (result.ok) {
      setSent(true);
      Alert.alert(
        'E-posta Gönderildi',
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.'
      );
    } else {
      Alert.alert('Hata', result.error || 'Bir sorun oluştu.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={[styles.logoCircle, { backgroundColor: theme.accent }]}>
              <Text style={styles.logoEmoji}>🔑</Text>
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>Şifremi Unuttum</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.welcomeSub, { color: theme.textSecondary }]}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
            placeholder="E-posta"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!sent}
          />
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.accent }, (loading || sent) && styles.btnDisabled]}
            onPress={handleReset}
            disabled={loading || sent}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{sent ? 'Gönderildi ✓' : 'Bağlantı Gönder'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.pill, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} onPress={onGoLogin}>
          <Text style={[styles.pillText, { color: theme.text }]}>← Giriş ekranına dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 24 },
  appName: { fontSize: 22, fontWeight: '600' },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  welcomeSub: { fontSize: 14, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  btn: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  pillText: { fontSize: 14, fontWeight: '500' },
});
