import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email.trim()) {
      setErrorMsg('Lütfen e-posta adresini gir.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setMessage(null);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) setErrorMsg(error);
    else setMessage('Sıfırlama bağlantısı e-posta kutuna gönderildi.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.brand}>
            <Text style={styles.title}>Şifre Sıfırla</Text>
            <Text style={styles.subtitle}>
              Kayıtlı e-posta adresini gir, sana sıfırlama bağlantısı gönderelim.
            </Text>
          </View>

          <Card>
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

            {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
            {message && <Text style={styles.success}>{message}</Text>}

            <Button
              title={loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              onPress={onSubmit}
              loading={loading}
              disabled={loading}
              fullWidth
            />
            <View style={{ height: spacing.sm }} />
            <Button
              title="Geri"
              variant="ghost"
              onPress={() => navigation.goBack()}
              fullWidth
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  brand: { alignItems: 'center', marginVertical: spacing.lg, gap: spacing.xs },
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
  error: { color: colors.danger, marginBottom: spacing.sm, fontSize: 13 },
  success: { color: colors.success, marginBottom: spacing.sm, fontSize: 13 },
});
