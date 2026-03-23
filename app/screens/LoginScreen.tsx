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
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CYAN = '#06b6d4';
const CYAN_DARK = '#0891b2';
const BG_LIGHT = '#e0f7fa';
const BG_WHITE = '#ffffff';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#64748b';
const BORDER = '#e2e8f0';

type Props = {
  onLogin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onGoRegister: () => void;
  onForgotPassword?: () => void;
};

export default function LoginScreen({ onLogin, onGoRegister, onForgotPassword }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          {/* App Icon & Header */}
          <View style={styles.header}>
            <View style={styles.logoCard}>
              <Text style={styles.logoEmoji}>🦉</Text>
            </View>
            <Text style={styles.welcomeTitle}>Hoş Geldin!</Text>
            <Text style={styles.welcomeSub}>
              Hesabına giriş yap ve kaldığın yerden devam et.
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
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
                placeholder="Şifre"
                placeholderTextColor={TEXT_MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            {onForgotPassword && (
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={onForgotPassword}
              >
                <Text style={styles.forgotText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginBtnIcon}>⎘</Text>
                  <Text style={styles.loginBtnText}>Giriş Yap</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>veya</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.socialText}>Google ile Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appleBtn}>
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.appleText}>Apple ile Giriş Yap</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu? </Text>
            <TouchableOpacity style={styles.registerPill} onPress={onGoRegister}>
              <Text style={styles.registerPillText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.legal}>
            Giriş yaparak{' '}
            <Text
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://example.com/terms')}
            >
              Kullanım Sözleşmesi
            </Text>
            {' ve '}
            <Text
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://example.com/privacy')}
            >
              Gizlilik Politikası
            </Text>
            'nı kabul etmiş olursun.
          </Text>
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
  welcomeSub: { fontSize: 15, color: TEXT_MUTED, textAlign: 'center', paddingHorizontal: 20 },
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
  eyeBtn: { padding: 8 },
  eyeIcon: { fontSize: 20 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 14, color: CYAN, fontWeight: '500' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CYAN,
    borderRadius: 14,
    padding: 18,
    gap: 10,
  },
  loginBtnIcon: { fontSize: 20, color: '#fff' },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  btnDisabled: { opacity: 0.7 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: BORDER },
  orText: { fontSize: 14, color: TEXT_MUTED },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG_WHITE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 10,
  },
  googleG: { fontSize: 20, fontWeight: 'bold', color: '#4285F4' },
  socialText: { fontSize: 16, color: TEXT_DARK, fontWeight: '500' },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  appleIcon: { width: 20, height: 20 },
  appleText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  footerText: { fontSize: 15, color: TEXT_MUTED },
  registerPill: {
    backgroundColor: CYAN,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  registerPillText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  legal: { fontSize: 12, color: TEXT_MUTED, textAlign: 'center', lineHeight: 20 },
  legalLink: { color: CYAN, fontWeight: '500' },
});
