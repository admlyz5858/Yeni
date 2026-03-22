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

const BG_DARK = '#1e293b';
const CARD_DARK = '#334155';
const CARD_BORDER = '#475569';
const TEXT_WHITE = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const ACCENT = '#3b82f6';

type Props = {
  onReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  onGoLogin: () => void;
};

export default function ForgotPasswordScreen({ onReset, onGoLogin }: Props) {
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🔑</Text>
            </View>
            <Text style={styles.appName}>Şifremi Unuttum</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.welcomeSub}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor={TEXT_MUTED}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!sent}
          />
          <TouchableOpacity
            style={[styles.btn, (loading || sent) && styles.btnDisabled]}
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

        <TouchableOpacity style={styles.pill} onPress={onGoLogin}>
          <Text style={styles.pillText}>← Giriş ekranına dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 24 },
  appName: { fontSize: 22, fontWeight: '600', color: TEXT_WHITE },
  card: {
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  welcomeSub: { fontSize: 14, color: TEXT_MUTED, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#1e293b',
    color: TEXT_WHITE,
  },
  btn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  pillText: { fontSize: 14, color: TEXT_WHITE, fontWeight: '500' },
});
