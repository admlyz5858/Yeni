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
const ACCENT = '#059669';

type Props = {
  onRegister: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  onGoLogin: () => void;
};

export default function RegisterScreen({ onRegister, onGoLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password || !name.trim()) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    const result = await onRegister(email.trim(), password, name.trim());
    setLoading(false);
    if (result.ok && result.error === 'EMAIL_CONFIRM') {
      Alert.alert(
        'E-posta Doğrulaması',
        'Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edip hesabınızı aktifleştirin, ardından giriş yapın.'
      );
      onGoLogin();
      return;
    }
    if (!result.ok) {
      Alert.alert('Kayıt Başarısız', result.error || 'Bir hata oluştu.');
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>📚</Text>
            </View>
            <Text style={styles.appName}>Çalışma Asistanı</Text>
          </View>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Kayıt Ol</Text>
          <Text style={styles.welcomeSub}>Yeni hesap oluşturun ve çalışmaya başlayın</Text>
        </View>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            placeholderTextColor={TEXT_MUTED}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor={TEXT_MUTED}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre (min 6 karakter)"
            placeholderTextColor={TEXT_MUTED}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.pill} onPress={onGoLogin}>
          <Text style={styles.pillIcon}>←</Text>
          <Text style={styles.pillText}>Zaten hesabınız var? Giriş yapın</Text>
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
  welcomeCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  welcomeTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_WHITE, marginBottom: 4 },
  welcomeSub: { fontSize: 14, color: TEXT_MUTED },
  formCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
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
  registerBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  registerBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  btnDisabled: { opacity: 0.7 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    gap: 8,
  },
  pillIcon: { fontSize: 16, color: TEXT_WHITE },
  pillText: { fontSize: 14, color: TEXT_WHITE, fontWeight: '500' },
});
