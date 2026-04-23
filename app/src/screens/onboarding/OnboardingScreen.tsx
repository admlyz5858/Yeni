import React, { useMemo, useState } from 'react';
import {
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
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { KpssTrack } from '../../data/curriculum';

const tracks: { id: KpssTrack; title: string; sub: string }[] = [
  { id: 'lisans', title: 'Lisans', sub: 'GY + GK' },
  { id: 'onlisans', title: 'Önlisans', sub: 'GY + GK' },
  { id: 'ortaogretim', title: 'Ortaöğretim', sub: 'GY + GK' },
  { id: 'egitim', title: 'Eğitim Bilimleri', sub: 'Öğretmen adayları' },
];

const goalOptions = [30, 60, 90, 120, 180, 240];
const focusOptions = [20, 25, 30, 45, 50];
const breakOptions = [5, 10, 15];

export const OnboardingScreen: React.FC = () => {
  const { state, updateProfile, updateSettings } = useApp();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const totalSteps = 5;

  const [firstName, setFirstName] = useState(
    state.profile.firstName ?? (user?.user_metadata?.first_name as string) ?? '',
  );
  const [track, setTrack] = useState<KpssTrack>(state.settings.track);
  const [examDate, setExamDate] = useState<Date | null>(
    state.profile.examDate ? new Date(state.profile.examDate) : null,
  );
  const [dailyGoal, setDailyGoal] = useState(state.settings.dailyGoalMinutes);
  const [focusMin, setFocusMin] = useState(state.settings.focusMinutes);
  const [breakMin, setBreakMin] = useState(state.settings.breakMinutes);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const daysLeft = useMemo(() => {
    if (!examDate) return null;
    const diff = Math.ceil(
      (examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  }, [examDate]);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (event.type === 'set' && date) setExamDate(date);
  };

  const canNext = () => {
    if (step === 0) return firstName.trim().length > 0;
    return true;
  };

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const finish = async () => {
    setSaving(true);
    try {
      updateSettings({
        track,
        dailyGoalMinutes: dailyGoal,
        focusMinutes: focusMin,
        breakMinutes: breakMin,
      });
      await updateProfile({
        firstName: firstName.trim() || null,
        examDate: examDate
          ? examDate.toISOString().slice(0, 10)
          : null,
        onboardingCompleted: true,
      });
    } catch (e) {
      await updateProfile({ onboardingCompleted: true }).catch(() => {});
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    setSaving(true);
    await updateProfile({ onboardingCompleted: true }).catch(() => {});
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.headerBar}>
          <Text style={styles.stepLabel}>
            {step + 1} / {totalSteps}
          </Text>
          <Pressable onPress={skip} disabled={saving}>
            <Text style={styles.skip}>Atla</Text>
          </Pressable>
        </View>
        <View style={styles.progress}>
          <ProgressBar value={step + 1} total={totalSteps} color={colors.primary} height={4} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {step === 0 && (
            <StepContainer
              emoji="👋"
              title="Hoş geldin!"
              desc="Sana nasıl hitap edelim?"
            >
              <Card>
                <Text style={styles.label}>Adın</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn. Ayşe"
                  placeholderTextColor={colors.textDim}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </Card>
            </StepContainer>
          )}

          {step === 1 && (
            <StepContainer
              emoji="🎯"
              title="Hangi KPSS?"
              desc="Müfredat ona göre açılır."
            >
              <Card>
                <View style={styles.trackList}>
                  {tracks.map((t) => {
                    const active = track === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => setTrack(t.id)}
                        style={({ pressed }) => [
                          styles.trackItem,
                          {
                            borderColor: active ? colors.primary : colors.border,
                            backgroundColor: active
                              ? colors.primary + '1A'
                              : colors.bgSoft,
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
                            {
                              borderColor: active
                                ? colors.primary
                                : colors.border,
                            },
                          ]}
                        >
                          {active && <View style={styles.radioDot} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            </StepContainer>
          )}

          {step === 2 && (
            <StepContainer
              emoji="📅"
              title="Sınav tarihin?"
              desc="Kalan güne göre plan öneririz. İstersen sonra ayarlardan değiştirebilirsin."
            >
              <Card>
                <Pressable
                  onPress={() => setShowPicker(true)}
                  style={({ pressed }) => [
                    styles.dateBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.dateBtnLabel}>Sınav Tarihi</Text>
                  <Text style={styles.dateBtnValue}>
                    {examDate ? formatDate(examDate) : 'Tarih seç'}
                  </Text>
                </Pressable>
                {daysLeft !== null && (
                  <Text
                    style={[
                      styles.muted,
                      daysLeft < 0 && { color: colors.danger },
                    ]}
                  >
                    {daysLeft < 0
                      ? `Seçili tarih geçmişte (${-daysLeft} gün önce)`
                      : `Sınava ${daysLeft} gün kaldı`}
                  </Text>
                )}
                <View style={{ height: spacing.sm }} />
                <Button
                  title="Tarihi Kaldır"
                  variant="ghost"
                  onPress={() => setExamDate(null)}
                />
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
            </StepContainer>
          )}

          {step === 3 && (
            <StepContainer
              emoji="⏱️"
              title="Günlük hedefin?"
              desc="Her gün en az kaç dakika çalışmayı hedefliyorsun?"
            >
              <Card>
                <Chips
                  options={goalOptions}
                  suffix=" dk"
                  value={dailyGoal}
                  onChange={setDailyGoal}
                />
              </Card>
            </StepContainer>
          )}

          {step === 4 && (
            <StepContainer
              emoji="🧘"
              title="Odak & Mola süreleri"
              desc="Pomodoro için varsayılan süreler."
            >
              <Card>
                <Text style={styles.label}>Odak (dk)</Text>
                <Chips
                  options={focusOptions}
                  value={focusMin}
                  onChange={setFocusMin}
                />
                <View style={{ height: spacing.md }} />
                <Text style={styles.label}>Mola (dk)</Text>
                <Chips
                  options={breakOptions}
                  value={breakMin}
                  onChange={setBreakMin}
                />
              </Card>
            </StepContainer>
          )}
        </ScrollView>

        <View style={styles.footerBar}>
          {step > 0 ? (
            <Button
              title="Geri"
              variant="secondary"
              onPress={back}
              style={{ flex: 1 }}
              disabled={saving}
            />
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {step < totalSteps - 1 ? (
            <Button
              title="Devam"
              onPress={next}
              disabled={!canNext() || saving}
              style={{ flex: 1 }}
            />
          ) : (
            <Button
              title={saving ? 'Kaydediliyor...' : 'Başla'}
              onPress={finish}
              loading={saving}
              disabled={saving}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const StepContainer: React.FC<{
  emoji: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}> = ({ emoji, title, desc, children }) => (
  <View style={{ gap: spacing.md }}>
    <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </View>
    {children}
  </View>
);

const Chips: React.FC<{
  options: number[];
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}> = ({ options, value, onChange, suffix }) => (
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
            {suffix ?? ''}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

function formatDate(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  stepLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  skip: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  progress: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  content: { padding: spacing.lg, paddingBottom: spacing.lg },
  emoji: { fontSize: 56, marginBottom: spacing.xs },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  desc: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
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
    fontSize: 16,
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
  dateBtn: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  dateBtnLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  dateBtnValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  muted: { color: colors.textMuted, fontSize: 13 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  footerBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
