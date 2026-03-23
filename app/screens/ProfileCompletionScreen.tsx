import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CYAN = '#06b6d4';
const BG_LIGHT = '#e0f7fa';
const BG_WHITE = '#ffffff';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#64748b';
const BORDER = '#e2e8f0';

type Props = {
  username?: string;
  onComplete: (data: { username: string; gender?: string; birthDate?: string }) => void;
};

const GENDERS = [
  { id: '', label: 'Seçiniz' },
  { id: 'erkek', label: 'Erkek' },
  { id: 'kadin', label: 'Kadın' },
  { id: 'diger', label: 'Diğer' },
];

export default function ProfileCompletionScreen({ username = '', onComplete }: Props) {
  const [userName, setUserName] = useState(username || '');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    if (!userName.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı girin.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Hata', 'Kullanım Sözleşmesi ve Gizlilik Politikası\'nı kabul etmelisiniz.');
      return;
    }
    setLoading(true);
    onComplete({
      username: userName.trim(),
      gender: gender || undefined,
      birthDate: birthDate || undefined,
    });
    setLoading(false);
  };

  return (
    <LinearGradient colors={[BG_LIGHT, BG_WHITE]} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Son Bir Adım!</Text>
          <Text style={styles.sub}>
            Hesabını kişiselleştirmek ve sana özel bir deneyim sunabilmemiz için bu bilgilere
            ihtiyacımız var.
          </Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              placeholderTextColor={TEXT_MUTED}
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="none"
            />
          </View>
          <Text style={styles.helper}>Benzersiz bir isim seçin</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>👥</Text>
            <View style={styles.pickerWrap}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g.id || 'empty'}
                  style={[styles.pill, gender === g.id && styles.pillActive]}
                  onPress={() => setGender(g.id)}
                >
                  <Text style={[styles.pillText, gender === g.id && styles.pillTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>📅</Text>
            <TextInput
              style={styles.input}
              placeholder="Doğum Tarihi (GG.AA.YYYY)"
              placeholderTextColor={TEXT_MUTED}
              value={birthDate}
              onChangeText={setBirthDate}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.checkWrap}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]}>
              {acceptTerms && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              <Text style={styles.legalLink} onPress={() => Linking.openURL('https://example.com/terms')}>
                Kullanım Sözleşmesi
              </Text>
              {' ve '}
              <Text style={styles.legalLink} onPress={() => Linking.openURL('https://example.com/privacy')}>
                Gizlilik Politikası
              </Text>
              {'\'nı kabul ediyorum.'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Profili Tamamla</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  card: {
    backgroundColor: BG_WHITE,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 12 },
  sub: { fontSize: 15, color: TEXT_MUTED, marginBottom: 24, lineHeight: 22 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  inputIcon: { fontSize: 18, marginRight: 12, color: TEXT_MUTED },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: TEXT_DARK },
  helper: { fontSize: 12, color: TEXT_MUTED, marginBottom: 20 },
  pickerWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 12 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  pillActive: { backgroundColor: CYAN },
  pillText: { fontSize: 14, color: TEXT_DARK },
  pillTextActive: { color: '#fff' },
  checkWrap: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 20, marginBottom: 24 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: { backgroundColor: CYAN, borderColor: CYAN },
  checkMark: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  checkLabel: { flex: 1, fontSize: 14, color: TEXT_DARK, lineHeight: 22 },
  legalLink: { color: CYAN, fontWeight: '500', textDecorationLine: 'underline' },
  btn: {
    backgroundColor: CYAN,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnDisabled: { opacity: 0.7 },
});
