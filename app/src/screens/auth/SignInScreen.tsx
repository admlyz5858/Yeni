import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

interface Props {
  navigation: any;
}

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const {
    signInWithEmail,
    signInWithApple,
    continueAsGuest,
    appleAvailable,
    googleAvailable,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorMsg('E-posta ve şifre gerekli.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) setErrorMsg(error);
  };

  const onApple = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithApple();
    setLoading(false);
    if (error) setErrorMsg(error);
  };

  const onGuest = async () => {
    setLoading(true);
    setErrorMsg(null);
    await continueAsGuest();
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>KP</Text>
            </View>
            <Text style={styles.title}>KPSS Planlayıcı</Text>
            <Text style={styles.subtitle}>
              Giriş yap, hedeflerini her cihazda takip et.
            </Text>
          </View>

          <Card>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@mail.com"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textDim}
              secureTextEntry
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ alignSelf: 'flex-end', marginBottom: spacing.sm }}
            >
              <Text style={styles.link}>Şifremi unuttum</Text>
            </Pressable>

            {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

            <Button
              title={loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              onPress={onSubmit}
              loading={loading}
              disabled={loading}
              fullWidth
            />
          </Card>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          {googleAvailable ? (
            <GoogleSignInButton
              disabled={loading}
              onStart={() => {
                setLoading(true);
                setErrorMsg(null);
              }}
              onFinish={() => setLoading(false)}
              onError={(msg) => setErrorMsg(msg)}
            />
          ) : (
            <Button
              title="Google (yapılandırılmadı)"
              variant="secondary"
              onPress={() =>
                Alert.alert(
                  'Google Giriş',
                  'Google OAuth istemci kimlikleri eklenmemiş. .env dosyasına kimlikleri yaz ve uygulamayı yeniden derle.',
                )
              }
              disabled={loading}
              fullWidth
            />
          )}

          {appleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              }
              cornerRadius={radius.md}
              style={styles.appleButton}
              onPress={onApple}
            />
          )}

          <View style={styles.guestWrap}>
            <Button
              title="Hesapsız Dene (Demo)"
              variant="ghost"
              onPress={onGuest}
              disabled={loading}
              fullWidth
            />
            <Text style={styles.guestHint}>
              Veriler sadece bu cihazda tutulur. İstediğinde hesap oluşturup
              senkronize edebilirsin.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu?</Text>
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.link, { marginLeft: 4 }]}>Kayıt ol</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  brand: { alignItems: 'center', marginVertical: spacing.lg, gap: spacing.sm },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.white, fontWeight: '800', fontSize: 22 },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bgSoft,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: spacing.sm,
    fontSize: 15,
  },
  link: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 12 },
  appleButton: { width: '100%', height: 48 },
  guestWrap: {
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  guestHint: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: { color: colors.textMuted },
});
