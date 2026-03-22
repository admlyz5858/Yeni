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

const BG_DARK = '#1e293b';
const CARD_DARK = '#334155';
const CARD_BORDER = '#475569';
const TEXT_WHITE = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const ACCENT = '#3b82f6';

const QUOTES = [
  { text: 'Başarı, küçük çabaların günlük tekrarıdır.', author: 'Robert Collier' },
  { text: 'Bugün yapacağın çalışma, yarının başarının temelidir.', author: '' },
  { text: 'Odaklanmak, sıradanı olağanüstü yapar.', author: '' },
];

const TIPS = [
  'Her gün 25 dakika odaklanma ile başlayın.',
  'Konuları küçük parçalara bölün.',
  'Düzenli tekrar, kalıcı öğrenmenin anahtarıdır.',
];

type Props = {
  onLogin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onGoRegister: () => void;
  onForgotPassword?: () => void;
};

export default function LoginScreen({ onLogin, onGoRegister, onForgotPassword }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'quote' | 'tip'>('quote');
  const daySeed = new Date().getDate() % 3;

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

  const quote = QUOTES[daySeed];
  const tip = TIPS[daySeed];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>📚</Text>
            </View>
            <Text style={styles.appName}>Çalışma Asistanı</Text>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz</Text>
          <Text style={styles.welcomeSub}>Hesabınıza giriş yapıp çalışmaya devam edin</Text>
        </View>

        {/* Date */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor={TEXT_MUTED}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor={TEXT_MUTED}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {onForgotPassword && (
            <TouchableOpacity style={styles.forgotBtn} onPress={onForgotPassword}>
              <Text style={styles.forgotText}>Şifremi unuttum</Text>
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
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Pills */}
        <View style={styles.pillsRow}>
          <TouchableOpacity style={styles.pill} onPress={onGoRegister}>
            <Text style={styles.pillIcon}>✏️</Text>
            <Text style={styles.pillText}>Kayıt Ol</Text>
          </TouchableOpacity>
          {onForgotPassword && (
            <TouchableOpacity style={styles.pill} onPress={onForgotPassword}>
              <Text style={styles.pillIcon}>🔑</Text>
              <Text style={styles.pillText}>Şifremi Unuttum</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Tabbed Card */}
        <View style={styles.bottomCard}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'quote' && styles.tabActive]}
              onPress={() => setTab('quote')}
            >
              <Text style={[styles.tabText, tab === 'quote' && styles.tabTextActive]}>
                Günün Sözü
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'tip' && styles.tabActive]}
              onPress={() => setTab('tip')}
            >
              <Text style={[styles.tabText, tab === 'tip' && styles.tabTextActive]}>İpucu</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tabContent}>
            {tab === 'quote' ? (
              <>
                <Text style={styles.quoteText}>"{quote.text}"</Text>
                {quote.author ? (
                  <Text style={styles.quoteAuthor}>— {quote.author}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.tipText}>💡 {tip}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 24 },
  appName: { fontSize: 22, fontWeight: '600', color: TEXT_WHITE },
  welcomeCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  welcomeTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_WHITE, marginBottom: 4 },
  welcomeSub: { fontSize: 14, color: TEXT_MUTED },
  dateRow: {
    marginBottom: 20,
  },
  dateText: { fontSize: 14, color: TEXT_MUTED },
  loginCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  input: {
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#1e293b',
    color: TEXT_WHITE,
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotText: { fontSize: 14, color: ACCENT },
  loginBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  btnDisabled: { opacity: 0.7 },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    gap: 8,
  },
  pillIcon: { fontSize: 16 },
  pillText: { fontSize: 14, color: TEXT_WHITE, fontWeight: '500' },
  bottomCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: ACCENT,
  },
  tabText: { fontSize: 14, color: TEXT_MUTED, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  tabContent: {
    padding: 20,
  },
  quoteText: { fontSize: 16, color: TEXT_WHITE, fontStyle: 'italic', lineHeight: 24 },
  quoteAuthor: { fontSize: 13, color: TEXT_MUTED, marginTop: 8 },
  tipText: { fontSize: 15, color: TEXT_WHITE, lineHeight: 24 },
});
