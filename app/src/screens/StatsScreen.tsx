import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import {
  computeAllStats,
  todayStudySeconds,
  totalStreak,
  weeklyStudyByDay,
} from '../utils/stats';
import { dayLabel, formatDuration } from '../utils/format';
import { getSectionsForTrack } from '../data/curriculum';

export const StatsScreen: React.FC = () => {
  const { state } = useApp();
  const { settings } = state;
  const { overall, bySection } = useMemo(
    () => computeAllStats(state, settings.track),
    [state, settings.track],
  );
  const today = todayStudySeconds(state);
  const streak = totalStreak(state);
  const weekly = useMemo(() => weeklyStudyByDay(state), [state]);
  const weekTotal = weekly.reduce((a, b) => a + b.seconds, 0);
  const maxSec = Math.max(60, ...weekly.map((d) => d.seconds));
  const sectionsForTrack = getSectionsForTrack(settings.track);
  const accuracy =
    overall.questionsSolved > 0
      ? Math.round((overall.correctAnswers / overall.questionsSolved) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="İstatistikler" subtitle="Çalışma performansın" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.cardLabel}>Özet</Text>
          <View style={styles.grid}>
            <Stat label="Bugün" value={formatDuration(today)} />
            <Stat label="Bu Hafta" value={formatDuration(weekTotal)} />
            <Stat label="Toplam" value={formatDuration(overall.studySeconds)} />
            <Stat label="Seri" value={`${streak} gün`} />
            <Stat
              label="Tamamlanan"
              value={`${overall.completed}/${overall.total}`}
            />
            <Stat label="Soru Başarısı" value={`${accuracy}%`} />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Haftalık Çalışma</Text>
          <View style={styles.chart}>
            {weekly.map((d) => {
              const h = Math.max(4, (d.seconds / maxSec) * 120);
              const isToday =
                new Date(d.ts).toDateString() === new Date().toDateString();
              return (
                <View key={d.ts} style={styles.barCol}>
                  <Text style={styles.barValue}>
                    {Math.round(d.seconds / 60)}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: h,
                        backgroundColor: isToday ? colors.primary : colors.primarySoft,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.barLabel,
                      isToday && { color: colors.text, fontWeight: '700' },
                    ]}
                  >
                    {dayLabel(d.ts)}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.muted}>Değerler dakika cinsinden</Text>
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Bölüme Göre</Text>
          {sectionsForTrack.map((section) => {
            const s = bySection[section.id];
            if (!s) return null;
            const pct =
              s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
            return (
              <View key={section.id} style={styles.sectionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.muted}>
                    {s.completed}/{s.total} konu • {formatDuration(s.studySeconds)}
                  </Text>
                </View>
                <Text style={styles.sectionPct}>{pct}%</Text>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '30%',
    backgroundColor: colors.bgSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    minWidth: 100,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    gap: 4,
    marginBottom: spacing.sm,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  bar: {
    width: '80%',
    borderRadius: radius.sm,
  },
  barValue: { color: colors.textMuted, fontSize: 10 },
  barLabel: { color: colors.textMuted, fontSize: 11 },
  muted: { color: colors.textMuted, fontSize: 12 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sectionPct: { color: colors.primary, fontWeight: '700', fontSize: 16 },
});
