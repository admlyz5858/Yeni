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
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

interface Props {
  navigation: any;
}

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { signUpWithEmail } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async () => {
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('E-posta ve şifre gerekli.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMsg('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    const { error, needsConfirmation } = await signUpWithEmail({
      email: email.trim(),
      password,
      firstName: firstName.trim() || undefined,
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error);
      return;
    }
    if (needsConfirmation) {
      Alert.alert(
        'E-posta Doğrulama',
        'Hesabını etkinleştirmek için e-posta kutunu kontrol et. Link doğrulandıktan sonra giriş yapabilirsin.',
        [{ text: 'Tamam', onPress: () => navigation.navigate('SignIn') }],
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.brand}>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>
              Hedeflerini belirlemeye birkaç adım kaldı.
            </Text>
          </View>

          <Card>
            <Text style={styles.label}>Ad</Text>
            <TextInput
              style={styles.input}
              placeholder="Adın"
              placeholderTextColor={colors.textDim}
              value={firstName}
              onChangeText={setFirstName}
              editable={!loading}
            />

            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@mail.com"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="En az 6 karakter"
              placeholderTextColor={colors.textDim}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <Text style={styles.label}>Şifre (Tekrar)</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifreni tekrar gir"
              placeholderTextColor={colors.textDim}
              secureTextEntry
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              editable={!loading}
            />

            {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

            <Button
              title={loading ? 'Oluşturuluyor...' : 'Kayıt Ol'}
              onPress={onSubmit}
              loading={loading}
              disabled={loading}
              fullWidth
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten bir hesabın var mı?</Text>
            <Pressable onPress={() => navigation.navigate('SignIn')}>
              <Text style={[styles.link, { marginLeft: 4 }]}>Giriş yap</Text>
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
  brand: { alignItems: 'center', marginVertical: spacing.lg, gap: spacing.xs },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: colors.textMuted, textAlign: 'center' },
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
  error: { color: colors.danger, marginBottom: spacing.sm, fontSize: 13 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: { color: colors.textMuted },
});
