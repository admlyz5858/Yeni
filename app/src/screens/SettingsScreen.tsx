import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { KpssTrack } from '../data/curriculum';

const tracks: { id: KpssTrack; title: string; sub: string }[] = [
  { id: 'lisans', title: 'Lisans', sub: 'GY + GK' },
  { id: 'onlisans', title: 'Önlisans', sub: 'GY + GK' },
  { id: 'ortaogretim', title: 'Ortaöğretim', sub: 'GY + GK' },
  { id: 'egitim', title: 'Eğitim Bilimleri', sub: 'Öğretmen adayları' },
];

const focusOptions = [15, 20, 25, 30, 45, 50, 60];
const breakOptions = [5, 10, 15, 20];
const goalOptions = [30, 60, 90, 120, 180, 240];

interface SettingsProps {
  navigation?: any;
}

export const SettingsScreen: React.FC<SettingsProps> = ({ navigation }) => {
  const { state, updateSettings, resetAll } = useApp();
  const { user, isGuest, signOut, exitGuest } = useAuth();
  const { settings, profile } = state;

  const confirmSignOut = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkış yapmak istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const confirmExitGuest = () => {
    Alert.alert(
      'Demo Modundan Çık',
      'Hesap oluşturmak veya giriş yapmak için demo modundan çıkmak istiyor musun? Bu cihazdaki veriler korunur.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Devam Et', onPress: () => exitGuest() },
      ],
    );
  };

  const confirmReset = () => {
    Alert.alert(
      'Tüm verileri sıfırla',
      'İlerleme, notlar ve çalışma seansların silinecek. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => resetAll(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Ayarlar" subtitle="Hedef ve tercihlerini belirle" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.cardLabel}>Hesap</Text>
          {isGuest ? (
            <View>
              <Text style={styles.accountEmail}>Demo Modu</Text>
              <Text style={styles.muted}>
                Verilerin sadece bu cihazda saklanıyor. Birden fazla cihazda
                erişmek ve verilerini yedeklemek için bir hesap oluştur.
              </Text>
              <View style={{ height: spacing.sm }} />
              <Button
                title="Hesap Oluştur / Giriş Yap"
                onPress={confirmExitGuest}
              />
              <View style={{ height: spacing.xs }} />
              <Button
                title="Profilimi Düzenle"
                variant="secondary"
                onPress={() => navigation?.navigate('EditProfile')}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.accountEmail}>
                {profile.firstName ?? user?.email ?? '—'}
              </Text>
              {profile.firstName && user?.email && (
                <Text style={styles.muted}>{user.email}</Text>
              )}
              <View style={{ height: spacing.sm }} />
              <View style={{ gap: spacing.xs }}>
                <Button
                  title="Profilimi Düzenle"
                  onPress={() => navigation?.navigate('EditProfile')}
                />
                <Button
                  title="Şifre Değiştir"
                  variant="secondary"
                  onPress={() => navigation?.navigate('ChangePassword')}
                />
                <Button
                  title="Çıkış Yap"
                  variant="ghost"
                  onPress={confirmSignOut}
                />
              </View>
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.cardLabel}>KPSS Türü</Text>
          <View style={styles.trackList}>
            {tracks.map((t) => {
              const active = settings.track === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => updateSettings({ track: t.id })}
                  style={({ pressed }) => [
                    styles.trackItem,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary + '1A' : colors.bgSoft,
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trackTitle}>{t.title}</Text>
                    <Text style={styles.trackSub}>{t.sub}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: active ? colors.primary : colors.border },
                    ]}
                  >
                    {active && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Günlük Çalışma Hedefi (dk)</Text>
          <Chips
            options={goalOptions}
            value={settings.dailyGoalMinutes}
            onChange={(v) => updateSettings({ dailyGoalMinutes: v })}
          />
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Odak Süresi (dk)</Text>
          <Chips
            options={focusOptions}
            value={settings.focusMinutes}
            onChange={(v) => updateSettings({ focusMinutes: v })}
          />
          <View style={{ height: spacing.md }} />
          <Text style={styles.cardLabel}>Mola Süresi (dk)</Text>
          <Chips
            options={breakOptions}
            value={settings.breakMinutes}
            onChange={(v) => updateSettings({ breakMinutes: v })}
          />
        </Card>

        <Card>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Titreşim</Text>
              <Text style={styles.muted}>
                Zamanlayıcı olayları için dokunsal geri bildirim
              </Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(v) => updateSettings({ hapticsEnabled: v })}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Veri</Text>
          <Button title="Tüm Verileri Sıfırla" variant="danger" onPress={confirmReset} />
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Hakkında</Text>
          <Text style={styles.muted}>
            KPSS Planlayıcı • Müfredat takibi ve odaklanma uygulaması.
          </Text>
          <Text style={styles.muted}>Sürüm 1.0.0</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const Chips: React.FC<{
  options: number[];
  value: number;
  onChange: (v: number) => void;
}> = ({ options, value, onChange }) => (
  <View style={styles.chipsRow}>
    {options.map((opt) => {
      const active = opt === value;
      return (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={({ pressed }) => [
            styles.chip,
            {
              borderColor: active ? colors.primary : colors.border,
              backgroundColor: active ? colors.primary + '22' : colors.bgSoft,
            },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              { color: active ? colors.primary : colors.text },
            ]}
          >
            {opt}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  trackList: { gap: spacing.sm },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  trackTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  trackSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    minWidth: 52,
    alignItems: 'center',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  muted: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  accountEmail: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
