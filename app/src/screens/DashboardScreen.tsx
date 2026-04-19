import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="KPSS Planlayıcı" subtitle={trackLabel} />
      <ScrollView contentContainerStyle={styles.content}>
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
});
