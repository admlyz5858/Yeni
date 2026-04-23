import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

interface Props {
  navigation: any;
}

export const ResetPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    const { error: e } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);
    if (e) {
      setError(e.message);
      return;
    }
    Alert.alert('Tamam', 'Yeni şifren kaydedildi.', [
      { text: 'Giriş Yap', onPress: () => navigation.replace('SignIn') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.brand}>
            <Text style={styles.title}>Yeni Şifre</Text>
            <Text style={styles.subtitle}>
              E-postadan geldiğin bu sayfada yeni şifreni belirle.
            </Text>
          </View>

          <Card>
            <Text style={styles.label}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="En az 6 karakter"
              placeholderTextColor={colors.textDim}
            />

            <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Tekrar gir"
              placeholderTextColor={colors.textDim}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              title={loading ? 'Kaydediliyor...' : 'Şifreyi Kaydet'}
              onPress={submit}
              loading={loading}
              disabled={loading}
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
});
