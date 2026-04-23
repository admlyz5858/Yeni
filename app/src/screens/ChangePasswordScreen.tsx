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
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

interface Props {
  navigation: any;
}

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!user?.email) {
      setError('E-posta bilgisi alınamadı.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalı.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInErr) {
      setLoading(false);
      setError('Mevcut şifre hatalı.');
      return;
    }
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);
    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    Alert.alert('Başarılı', 'Şifren güncellendi.', [
      { text: 'Tamam', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Şifre Değiştir" subtitle="Mevcut şifreni doğrula" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <Text style={styles.label}>Mevcut Şifre</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textDim}
            />
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
              title={loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
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
