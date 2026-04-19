import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { computeAllStats, todayStudySeconds, totalStreak } from '../utils/stats';
import { formatDuration } from '../utils/format';
import { getSectionsForTrack } from '../data/curriculum';

interface Props {
  navigation: any;
}

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { state } = useApp();
  const { isGuest } = useAuth();
  const { settings } = state;

  const { overall, bySection } = useMemo(
    () => computeAllStats(state, settings.track),
    [state, settings.track],
  );
  const today = todayStudySeconds(state);
  const streak = totalStreak(state);
  const sectionsForTrack = useMemo(
    () => getSectionsForTrack(settings.track),
    [settings.track],
  );

  const trackLabel = trackLabels[settings.track];
  const todayMinutes = Math.floor(today / 60);
  const goalMinutes = settings.dailyGoalMinutes;
  const examDaysLeft = useMemo(() => {
    if (!state.profile.examDate) return null;
    const exam = new Date(state.profile.examDate);
    const diff = Math.ceil(
      (exam.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  }, [state.profile.examDate]);
  const greetingName = state.profile.firstName ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title={greetingName ? `Merhaba, ${greetingName}` : 'KPSS Planlayıcı'}
        subtitle={trackLabel}
        right={
          isGuest ? (
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>DEMO</Text>
            </View>
          ) : null
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {examDaysLeft !== null && (
          <Card>
            <View style={styles.examRow}>
              <View>
                <Text style={styles.cardLabel}>Sınava Kalan</Text>
                <Text
                  style={[
                    styles.examDays,
                    examDaysLeft < 0 && { color: colors.danger },
                  ]}
                >
                  {examDaysLeft >= 0 ? `${examDaysLeft}` : `${-examDaysLeft}`}
                  <Text style={styles.examDaysSuffix}>
                    {' '}
                    {examDaysLeft < 0 ? 'gün önce' : 'gün'}
                  </Text>
                </Text>
              </View>
              <Text style={styles.examDate}>
                {formatExamDate(state.profile.examDate!)}
              </Text>
            </View>
          </Card>
        )}

        <Card>
          <Text style={styles.cardLabel}>Genel İlerleme</Text>
          <View style={styles.progressRow}>
            <Text style={styles.bigStat}>
              {overall.completed}
              <Text style={styles.smallStat}> / {overall.total}</Text>
            </Text>
            <Text style={styles.percent}>
              {overall.total > 0
                ? Math.round((overall.completed / overall.total) * 100)
                : 0}
              %
            </Text>
          </View>
          <ProgressBar
            value={overall.completed}
            total={overall.total}
            color={colors.success}
            height={10}
          />
          <View style={styles.legendRow}>
            <Legend color={colors.success} label={`Tamam ${overall.completed}`} />
            <Legend color={colors.warning} label={`Süren ${overall.inProgress}`} />
            <Legend color={colors.accent} label={`Tekrar ${overall.review}`} />
            <Legend color={colors.textDim} label={`Yeni ${overall.notStarted}`} />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Bugün</Text>
          <View style={styles.progressRow}>
            <Text style={styles.bigStat}>
              {todayMinutes}
              <Text style={styles.smallStat}> / {goalMinutes} dk</Text>
            </Text>
            <Text style={styles.percent}>
              {goalMinutes > 0
                ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100))
                : 0}
              %
            </Text>
          </View>
          <ProgressBar
            value={todayMinutes}
            total={goalMinutes}
            color={colors.primary}
            height={10}
          />
          <View style={styles.subRow}>
            <Text style={styles.subStat}>Seri: {streak} gün</Text>
            <Text style={styles.subStat}>
              Toplam: {formatDuration(overall.studySeconds)}
            </Text>
          </View>
        </Card>

        <View style={styles.actionsRow}>
          <Button
            title="Odaklan"
            onPress={() => navigation.navigate('Odak')}
            style={{ flex: 1 }}
          />
          <Button
            title="Müfredat"
            variant="secondary"
            onPress={() => navigation.navigate('Müfredat')}
            style={{ flex: 1 }}
          />
        </View>

        <Text style={styles.sectionHeading}>Bölümler</Text>
        {sectionsForTrack.map((section) => {
          const s = bySection[section.id];
          if (!s) return null;
          return (
            <Card key={section.id} style={{ marginBottom: spacing.md }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionPercent}>
                  {s.total > 0
                    ? Math.round((s.completed / s.total) * 100)
                    : 0}
                  %
                </Text>
              </View>
              <Text style={styles.sectionSub}>{section.description}</Text>
              <View style={{ height: spacing.sm }} />
              <ProgressBar
                value={s.completed}
                total={s.total}
                color={colors.primary}
              />
              <View style={styles.subRow}>
                <Text style={styles.subStat}>
                  {s.completed}/{s.total} konu
                </Text>
                <Text style={styles.subStat}>
                  {formatDuration(s.studySeconds)}
                </Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const trackLabels: Record<string, string> = {
  lisans: 'Lisans',
  onlisans: 'Önlisans',
  ortaogretim: 'Ortaöğretim',
  egitim: 'Eğitim Bilimleri (Öğretmenlik)',
};

function formatExamDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}.${d.getFullYear()}`;
}

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  bigStat: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  smallStat: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  percent: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textMuted, fontSize: 12 },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  subStat: { color: colors.textMuted, fontSize: 12 },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sectionPercent: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  sectionSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  guestBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.warning + '22',
  },
  guestBadgeText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  examRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  examDays: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 2,
  },
  examDaysSuffix: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  examDate: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
