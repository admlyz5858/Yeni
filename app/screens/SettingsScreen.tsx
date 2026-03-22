import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { useSettings } from '../context/SettingsContext';
import { requestNotificationPermissions, scheduleStudyReminder } from '../services/notifications';

type Props = { navigation: any };

function SettingRow({
  label,
  sub,
  onPress,
  right,
  theme,
  noBorder,
}: {
  label: string;
  sub?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  theme: any;
  noBorder?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !noBorder && { borderBottomWidth: 1, borderBottomColor: theme.cardBorder }]}
      onPress={onPress}
      disabled={!onPress && !right}
    >
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{sub}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const { theme, mode, setMode } = useTheme();
  const { hasSeenOnboarding, setHasSeenOnboarding } = usePlan();
  const { user, logout } = useAuth();
  const { isPremium } = usePremium();
  const {
    keepScreenOn,
    setKeepScreenOn,
    strictMode,
    setStrictMode,
    firstDayOfWeek,
    setFirstDayOfWeek,
    showTimeAsHours,
    setShowTimeAsHours,
    hiddenFromRanking,
    setHiddenFromRanking,
    soundEffects,
    setSoundEffects,
  } = useSettings();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Ayarlar</Text>
      </View>

      {/* Premium Banner */}
      {!isPremium && (
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('Premium')}
        >
          <LinearGradient
            colors={['#fef3c7', '#d1fae5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumGradient}
          >
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Premium'a katıl</Text>
              <Text style={styles.premiumSub}>Odaklanma deneyimini yükselt!</Text>
            </View>
            <View style={styles.premiumCrown}>
              <Text style={styles.crownIcon}>👑</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Profil */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: theme.accentLight }]}>
            <Text style={styles.avatarText}>📚</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.badgeRow}>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Kullanıcı'}</Text>
              <View style={[styles.badge, { backgroundColor: isPremium ? theme.success : theme.cardBorder }]}>
                <Text style={styles.badgeText}>{isPremium ? 'Premium' : 'Ücretsiz'}</Text>
              </View>
            </View>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
          </View>
        </View>
        <SettingRow
          label="Abonelik Yönetimi"
          onPress={() => navigation.navigate('Premium')}
          theme={theme}
        />
      </View>

      {/* Pomodoro ve Odaklanma */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ⏱️ Odaklanma ve Zamanlayıcı
        </Text>
        <SettingRow
          label="Ekranı açık tut"
          sub="Pomodoro sırasında ekran kapanmasın"
          right={<Switch value={keepScreenOn} onValueChange={setKeepScreenOn} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
        />
        <SettingRow
          label="Sıkı mod"
          sub="Uygulama arka plana giderse tur sayılmaz"
          right={<Switch value={strictMode} onValueChange={setStrictMode} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
        />
        <SettingRow
          label="Özel sözler"
          sub="Motivasyon cümlelerinizi ekleyin"
          onPress={() => navigation.navigate('CustomQuotes')}
          theme={theme}
          noBorder
        />
      </View>

      {/* Görünüm */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          📅 Görünüm ve İstatistik
        </Text>
        <SettingRow
          label="Haftanın ilk günü"
          right={<Text style={[styles.rowValue, { color: theme.textSecondary }]}>{firstDayOfWeek === 'monday' ? 'Pazartesi' : 'Pazar'}</Text>}
          onPress={() =>
            setFirstDayOfWeek(firstDayOfWeek === 'monday' ? 'sunday' : 'monday')
          }
          theme={theme}
        />
        <SettingRow
          label="Süreyi saat olarak göster"
          sub="İstatistiklerde 1.5 yerine 1:30"
          right={<Switch value={showTimeAsHours} onValueChange={setShowTimeAsHours} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
          noBorder
        />
      </View>

      {/* Tema */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>🎨 Tema</Text>
        <View style={styles.themeGrid}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.themeBtn,
                { borderColor: theme.cardBorder },
                mode === opt.id && { borderColor: theme.accent, borderWidth: 2 },
              ]}
              onPress={() => setMode(opt.id)}
            >
              <Text style={styles.themeIcon}>{opt.icon}</Text>
              <Text style={[styles.themeLabel, { color: theme.text }]} numberOfLines={1}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sosyal */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          👥 Sosyal ve Sıralama
        </Text>
        <SettingRow
          label="Küresel sıralamadan gizle"
          sub="Liderlik tablosunda görünmezsiniz"
          right={<Switch value={hiddenFromRanking} onValueChange={setHiddenFromRanking} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
          noBorder
        />
      </View>

      {/* Ses ve Bildirim */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          🔔 Ses ve Bildirim
        </Text>
        <SettingRow
          label="Ses efektleri"
          sub="Haptic ve bildirim sesleri"
          right={<Switch value={soundEffects} onValueChange={setSoundEffects} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
        />
        <SettingRow
          label="Günlük çalışma hatırlatması"
          sub="Her gün 09:00'da"
          onPress={async () => {
            const ok = await requestNotificationPermissions();
            if (ok) {
              await scheduleStudyReminder(9, 0);
              Alert.alert('Tamam', 'Her gün saat 09:00\'da hatırlatma alacaksınız.');
            } else {
              Alert.alert('İzin Gerekli', 'Bildirim izni için ayarlara gidin.');
            }
          }}
          theme={theme}
          noBorder
        />
      </View>

      {/* Uygulama */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>📱 Uygulama</Text>
        <SettingRow
          label="Hoş geldin ekranını tekrar göster"
          onPress={() => setHasSeenOnboarding(false)}
          theme={theme}
        />
        <SettingRow
          label="Hakkında"
          onPress={() => navigation.navigate('About')}
          theme={theme}
        />
        <SettingRow
          label="Gizlilik Politikası"
          onPress={() => Linking.openURL('https://github.com/admlyz5858/Yeni/blob/main/PRIVACY_POLICY.md')}
          theme={theme}
        />
        <SettingRow
          label="Bir öneri gönder"
          onPress={() => Linking.openURL('mailto:feedback@example.com')}
          theme={theme}
          noBorder
        />
      </View>

      {/* Çıkış */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: theme.cardBorder }]}
        onPress={() => {
          Alert.alert('Çıkış', 'Hesabınızdan çıkış yapmak istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış', style: 'destructive', onPress: logout },
          ]);
        }}
      >
        <Text style={[styles.logoutText, { color: theme.danger }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Çalışma Asistanı v1.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold' },
  premiumBanner: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  premiumContent: { flex: 1 },
  premiumTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  premiumSub: { fontSize: 14, color: '#475569', marginTop: 4 },
  premiumCrown: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownIcon: { fontSize: 28 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28 },
  profileInfo: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { fontSize: 18, fontWeight: '600' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  userEmail: { fontSize: 14, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLeft: { flex: 1 },
  rowLabel: { fontSize: 16 },
  rowSub: { fontSize: 13, marginTop: 2 },
  rowValue: { fontSize: 14 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeBtn: {
    width: '31%',
    minWidth: 90,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeIcon: { fontSize: 24, marginBottom: 6 },
  themeLabel: { fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14 },
});
