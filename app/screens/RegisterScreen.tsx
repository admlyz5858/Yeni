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
import { LinearGradient } from 'expo-linear-gradient';

const CYAN = '#06b6d4';
const BG_LIGHT = '#e0f7fa';
const BG_WHITE = '#ffffff';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#64748b';
const BORDER = '#e2e8f0';

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
    <LinearGradient colors={[BG_LIGHT, BG_WHITE]} style={styles.gradient}>
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
            <View style={styles.logoCard}>
              <Text style={styles.logoEmoji}>🦉</Text>
            </View>
            <Text style={styles.welcomeTitle}>Kayıt Ol</Text>
            <Text style={styles.welcomeSub}>Bilge Baykuş ile çalışmaya başla</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                placeholderTextColor={TEXT_MUTED}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>@</Text>
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor={TEXT_MUTED}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifre (min 6 karakter)"
                placeholderTextColor={TEXT_MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
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

          <TouchableOpacity style={styles.footer} onPress={onGoLogin}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <Text style={styles.footerLink}>Giriş yap</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#0e7490',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: { fontSize: 44 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 8 },
  welcomeSub: { fontSize: 15, color: TEXT_MUTED },
  card: {
    backgroundColor: BG_WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  inputIcon: { fontSize: 18, marginRight: 12, color: TEXT_MUTED },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: TEXT_DARK },
  registerBtn: {
    backgroundColor: CYAN,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  registerBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  btnDisabled: { opacity: 0.7 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  footerText: { fontSize: 15, color: TEXT_MUTED },
  footerLink: { fontSize: 15, color: CYAN, fontWeight: '600' },
});
