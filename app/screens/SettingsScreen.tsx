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
import * as Application from 'expo-application';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { useSettings } from '../context/SettingsContext';
import { requestNotificationPermissions, scheduleStudyReminder } from '../services/notifications';

const ICON_BG = '#e0f2fe';

function SettingItem({
  icon,
  label,
  sub,
  onPress,
  right,
  theme,
  noBorder,
}: {
  icon: string;
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
      <View style={[styles.iconBox, { backgroundColor: ICON_BG }]}>
        <Text style={styles.rowIcon}>{icon}</Text>
      </View>
      <View style={styles.rowCenter}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: theme.textSecondary }]}>{sub}</Text> : null}
      </View>
      {right ?? (onPress ? <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text> : null)}
    </TouchableOpacity>
  );
}

type Props = { navigation: any };

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

  const version = (Application as any).nativeApplicationVersion || '1.0';
  const build = (Application as any).nativeBuildVersion || '1';

  const baseThemeOptions = THEME_OPTIONS.filter((o) => ['light', 'dark', 'system'].includes(o.id));

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

      {/* Profil Kartı - Gradient */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => navigation.navigate('Profile')}
      >
        <LinearGradient
          colors={['#22d3ee', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.profileGradient}
        >
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Text style={styles.avatarText}>📚</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Kullanıcı'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Text style={styles.editIcon}>✏️</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Premium Banner */}
      {!isPremium && (
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('Premium')}
        >
          <LinearGradient
            colors={['#fef3c7', '#a5f3fc']}
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

      {/* HESAP */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>HESAP</Text>
        <SettingItem
          icon="🛡️"
          label="Şifreyi Değiştir"
          sub="Hesap şifrenizi değiştirin"
          onPress={() => navigation.navigate('ChangePassword')}
          theme={theme}
        />
        <SettingItem
          icon="⛔"
          label="Engellenen Kullanıcılar"
          sub="Engellediğiniz kullanıcıları yönetin"
          onPress={() => {}}
          theme={theme}
        />
        <SettingItem
          icon="🎁"
          label="Davet Kodu Gir"
          sub="Ücretsiz erişim kazan"
          onPress={() => {}}
          theme={theme}
          noBorder
        />
      </View>

      {/* BİLDİRİMLER */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>BİLDİRİMLER</Text>
        <SettingItem
          icon="🔔"
          label="Bildirim Ayarları"
          sub="Bildirimleri açın veya kapatın"
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

      {/* PLANLAMA */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PLANLAMA</Text>
        <SettingItem
          icon="📅"
          label="Zaman Haritası"
          sub="Haftalık çalışma takviminizi düzenleyin"
          onPress={() => navigation.navigate('Schedule')}
          theme={theme}
          noBorder
        />
      </View>

      {/* GÖRÜNÜM - Tema Açık/Koyu/Sistem */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          🎨 Tema
        </Text>
        <View style={styles.segmentedRow}>
          {baseThemeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.segmentedBtn,
                mode === opt.id && [styles.segmentedBtnActive, { backgroundColor: '#22d3ee' }],
              ]}
              onPress={() => setMode(opt.id)}
            >
              <Text style={styles.segmentedIcon}>{opt.icon}</Text>
              <Text
                style={[
                  styles.segmentedLabel,
                  mode === opt.id ? { color: '#fff' } : { color: theme.text },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.themeExtras}>
          {THEME_OPTIONS.filter((o) => !['light', 'dark', 'system'].includes(o.id)).map((opt) => (
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
              <Text style={[styles.themeLabel, { color: theme.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Odaklanma Ayarları */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ODAKLANMA</Text>
        <SettingItem
          icon="📱"
          label="Ekranı açık tut"
          sub="Pomodoro sırasında"
          right={<Switch value={keepScreenOn} onValueChange={setKeepScreenOn} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
        />
        <SettingItem
          icon="🔒"
          label="Sıkı mod"
          sub="Arka plana gidince tur iptal"
          right={<Switch value={strictMode} onValueChange={setStrictMode} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
        />
        <SettingItem
          icon="💬"
          label="Özel sözler"
          sub="Motivasyon cümleleri"
          onPress={() => navigation.navigate('CustomQuotes')}
          theme={theme}
        />
        <SettingItem
          icon="📅"
          label="Haftanın ilk günü"
          right={<Text style={[styles.rowValue, { color: theme.textSecondary }]}>{firstDayOfWeek === 'monday' ? 'Pazartesi' : 'Pazar'}</Text>}
          onPress={() => setFirstDayOfWeek(firstDayOfWeek === 'monday' ? 'sunday' : 'monday')}
          theme={theme}
        />
        <SettingItem
          icon="⏱️"
          label="Süreyi saat olarak göster"
          sub="1.5 → 1:30"
          right={<Switch value={showTimeAsHours} onValueChange={setShowTimeAsHours} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
        />
        <SettingItem
          icon="👥"
          label="Küresel sıralamadan gizle"
          right={<Switch value={hiddenFromRanking} onValueChange={setHiddenFromRanking} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
        />
        <SettingItem
          icon="🔊"
          label="Ses efektleri"
          right={<Switch value={soundEffects} onValueChange={setSoundEffects} trackColor={{ false: theme.cardBorder, true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
          noBorder
        />
      </View>

      {/* YARDIM VE DESTEK */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>YARDIM VE DESTEK</Text>
        <SettingItem icon="💬" label="Sıkça Sorulan Sorular" sub="En çok merak edilenler" onPress={() => navigation.navigate('FAQ')} theme={theme} />
        <SettingItem icon="❓" label="Taktik Rehberi" sub="Uygulama kullanım kılavuzu" onPress={() => navigation.navigate('TacticsGuide')} theme={theme} />
        <SettingItem icon="📧" label="Bize Ulaşın" sub="Görüş ve önerileriniz için" onPress={() => navigation.navigate('Contact')} theme={theme} />
        <SettingItem icon="📄" label="Kullanım Sözleşmesi" sub="Hizmet şartlarımız" onPress={() => navigation.navigate('Terms')} theme={theme} />
        <SettingItem icon="🛡️" label="Gizlilik Politikası" sub="Verilerinizi nasıl koruyoruz" onPress={() => Linking.openURL('https://github.com/admlyz5858/Yeni/blob/main/PRIVACY_POLICY.md')} theme={theme} />
        <SettingItem icon="▶️" label="Abonelikleri Yönet" sub="Google Play'de yönetin" onPress={() => navigation.navigate('Premium')} theme={theme} />
        <SettingItem icon="ℹ️" label="Uygulama Hakkında" sub={`Versiyon ${version} (${build})`} onPress={() => navigation.navigate('About')} theme={theme} noBorder />
      </View>

      {/* TEHLİKELİ BÖLGE */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.danger }]}>TEHLİKELİ BÖLGE</Text>
        <SettingItem
          icon="🗑️"
          label="Hesabı Sil"
          sub="Hesabınızı kalıcı olarak silin"
          onPress={() => navigation.navigate('DeleteAccount')}
          theme={theme}
          noBorder
        />
      </View>

      {/* OTURUM */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>OTURUM</Text>
        <TouchableOpacity
          style={styles.logoutRow}
          onPress={() => {
            Alert.alert('Çıkış', 'Hesabınızdan çıkış yapmak istiyor musunuz?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Çıkış', style: 'destructive', onPress: logout },
            ]);
          }}
        >
          <View style={[styles.iconBox, { backgroundColor: ICON_BG }]}>
            <Text style={styles.rowIcon}>🚪</Text>
          </View>
          <Text style={[styles.rowLabel, { color: theme.danger }]}>Çıkış Yap</Text>
          <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>Çalışma Asistanı v{version}</Text>
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
  profileCard: { marginBottom: 20, borderRadius: 20, overflow: 'hidden' },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 28 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  editIcon: { fontSize: 20 },
  premiumBanner: { marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  premiumGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  premiumContent: { flex: 1 },
  premiumTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  premiumSub: { fontSize: 14, color: '#475569', marginTop: 4 },
  premiumCrown: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  crownIcon: { fontSize: 28 },
  card: { borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowIcon: { fontSize: 20 },
  rowCenter: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowSub: { fontSize: 13, marginTop: 2 },
  rowValue: { fontSize: 14 },
  chevron: { fontSize: 20, fontWeight: '300' },
  segmentedRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  segmentedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  segmentedBtnActive: {},
  segmentedIcon: { fontSize: 18 },
  segmentedLabel: { fontSize: 14, fontWeight: '600' },
  themeExtras: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  themeBtn: { padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', minWidth: 80 },
  themeIcon: { fontSize: 20, marginBottom: 4 },
  themeLabel: { fontSize: 12, fontWeight: '600' },
  logoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14 },
});
