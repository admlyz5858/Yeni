import React, { useEffect, useState } from 'react';
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
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import {
  googleAndroidClientId,
  googleIosClientId,
  googleWebClientId,
} from '../../lib/googleConfig';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

WebBrowser.maybeCompleteAuthSession();

interface Props {
  navigation: any;
}

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const {
    signInWithEmail,
    signInWithGoogle,
    signInWithGoogleIdToken,
    signInWithApple,
    continueAsGuest,
    appleAvailable,
    googleAvailable,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useIdTokenAuthRequest({
      clientId: googleWebClientId || undefined,
      iosClientId: googleIosClientId || undefined,
      androidClientId: googleAndroidClientId || undefined,
      webClientId: googleWebClientId || undefined,
      scopes: ['openid', 'profile', 'email'],
    });

  useEffect(() => {
    if (!googleResponse) return;
    if (googleResponse.type === 'success') {
      const idToken = (googleResponse.params as any)?.id_token as
        | string
        | undefined;
      const nonce = (googleRequest as any)?.nonce as string | undefined;
      if (!idToken) {
        setErrorMsg('Google id_token alınamadı.');
        setLoading(false);
        return;
      }
      (async () => {
        const { error } = await signInWithGoogleIdToken(idToken, nonce);
        setLoading(false);
        if (error) setErrorMsg(error);
      })();
    } else if (googleResponse.type === 'error') {
      setErrorMsg(
        googleResponse.error?.message ?? 'Google ile giriş başarısız.',
      );
      setLoading(false);
    } else if (
      googleResponse.type === 'dismiss' ||
      googleResponse.type === 'cancel'
    ) {
      setLoading(false);
    }
  }, [googleResponse]);

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

  const onGoogle = async () => {
    setErrorMsg(null);
    if (Platform.OS === 'web') {
      setLoading(true);
      const { error } = await signInWithGoogle();
      setLoading(false);
      if (error) setErrorMsg(error);
      return;
    }
    if (!googleRequest) {
      setErrorMsg('Google istemcisi hazırlanamadı.');
      return;
    }
    setLoading(true);
    try {
      await googlePromptAsync();
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Google ile giriş başarısız.');
      setLoading(false);
    }
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
            <Button
              title="Google ile devam et"
              variant="secondary"
              onPress={onGoogle}
              disabled={loading}
              fullWidth
            />
          ) : (
            <Button
              title="Google (yapılandırılmadı)"
              variant="secondary"
              onPress={() =>
                Alert.alert(
                  'Google Giriş',
                  'Lütfen Google OAuth istemci kimliklerinizi .env dosyasına ekleyin ve uygulamayı yeniden derleyin.',
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
