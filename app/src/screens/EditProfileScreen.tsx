import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

interface Props {
  navigation: any;
}

function formatDate(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.${d.getFullYear()}`;
}

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64ToUint8Array(base64: string): Uint8Array {
  const str = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  const paddingLen = str.endsWith('==') ? 2 : str.endsWith('=') ? 1 : 0;
  const byteLen = (str.length * 3) / 4 - paddingLen;
  const bytes = new Uint8Array(byteLen);
  let p = 0;
  for (let i = 0; i < str.length; i += 4) {
    const e1 = BASE64_CHARS.indexOf(str[i]);
    const e2 = BASE64_CHARS.indexOf(str[i + 1]);
    const e3 = BASE64_CHARS.indexOf(str[i + 2]);
    const e4 = BASE64_CHARS.indexOf(str[i + 3]);
    if (p < byteLen) bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (p < byteLen) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (p < byteLen) bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }
  return bytes;
}

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { state, updateProfile } = useApp();
  const { user, isGuest } = useAuth();

  const [firstName, setFirstName] = useState(state.profile.firstName ?? '');
  const [examDate, setExamDate] = useState<Date | null>(
    state.profile.examDate ? new Date(state.profile.examDate) : null,
  );
  const [avatarLocal, setAvatarLocal] = useState<string | null>(
    state.profile.avatarUrl,
  );
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (event.type === 'set' && date) setExamDate(date);
  };

  const pickAvatar = async () => {
    if (isGuest) {
      Alert.alert(
        'Demo modu',
        'Profil fotoğrafı yüklemek için hesap oluşturman gerekiyor.',
      );
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin', 'Fotoğraflara erişim izni gerekli.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    try {
      setUploading(true);
      const processed = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 512, height: 512 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );
      if (!processed.base64 || !user) throw new Error('Görsel hazırlanamadı.');
      const bytes = base64ToUint8Array(processed.base64);
      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, bytes, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      setAvatarLocal(publicUrl);
      await updateProfile({ avatarUrl: publicUrl });
    } catch (e: any) {
      Alert.alert('Yükleme hatası', e?.message ?? 'Fotoğraf yüklenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    setAvatarLocal(null);
    try {
      await updateProfile({ avatarUrl: null });
    } catch {}
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim() || null,
        examDate: examDate ? examDate.toISOString().slice(0, 10) : null,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Kaydedilemedi', e?.message ?? 'Bilinmeyen hata.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Profilim" subtitle="Kimlik ve hedef bilgilerin" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <Text style={styles.cardLabel}>Profil Fotoğrafı</Text>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                {avatarLocal ? (
                  <Image source={{ uri: avatarLocal }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarInitial}>
                    {(firstName || user?.email || '?').slice(0, 1).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Button
                  title={uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}
                  variant="secondary"
                  onPress={pickAvatar}
                  loading={uploading}
                  disabled={uploading || isGuest}
                />
                {avatarLocal && !isGuest && (
                  <Button
                    title="Fotoğrafı Kaldır"
                    variant="ghost"
                    onPress={removeAvatar}
                  />
                )}
                {isGuest && (
                  <Text style={styles.muted}>
                    Demo modunda fotoğraf yüklenemez.
                  </Text>
                )}
              </View>
            </View>
          </Card>

          <Card>
            <Text style={styles.cardLabel}>Ad</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Adın"
              placeholderTextColor={colors.textDim}
              autoCapitalize="words"
            />
          </Card>

          <Card>
            <Text style={styles.cardLabel}>Hedef Sınav Tarihi</Text>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={({ pressed }) => [
                styles.dateBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.dateBtnValue}>
                {examDate ? formatDate(examDate) : 'Tarih seç'}
              </Text>
            </Pressable>
            {examDate && (
              <Button
                title="Tarihi Kaldır"
                variant="ghost"
                onPress={() => setExamDate(null)}
              />
            )}
            {showPicker && (
              <DateTimePicker
                value={examDate ?? new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={new Date()}
                onChange={onDateChange}
              />
            )}
          </Card>

          <Button
            title={saving ? 'Kaydediliyor...' : 'Kaydet'}
            onPress={save}
            loading={saving}
            disabled={saving}
            fullWidth
          />
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
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '800',
  },
  input: {
    backgroundColor: colors.bgSoft,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
  },
  dateBtn: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  dateBtnValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  muted: { color: colors.textMuted, fontSize: 12 },
});
