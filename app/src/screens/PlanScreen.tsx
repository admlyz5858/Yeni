import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { DailyTask, daysUntilExam, todayKey } from '../lib/planner';
import { getSubjectById, getTopicById } from '../data/curriculum';

interface Props {
  navigation: any;
}

export const PlanScreen: React.FC<Props> = ({ navigation }) => {
  const { state, ensurePlanForToday, regeneratePlan, setTaskStatus } = useApp();

  useEffect(() => {
    ensurePlanForToday();
  }, [ensurePlanForToday]);

  const today = todayKey();
  const todayTasks = useMemo(
    () =>
      state.dailyTasks
        .filter((t) => t.date === today)
        .sort((a, b) => a.sortIndex - b.sortIndex),
    [state.dailyTasks, today],
  );
  const upcomingTasks = useMemo(() => {
    const byDate: Record<string, DailyTask[]> = {};
    for (const t of state.dailyTasks) {
      if (t.date <= today) continue;
      (byDate[t.date] ??= []).push(t);
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 6);
  }, [state.dailyTasks, today]);

  const totalPlanned = todayTasks.reduce((a, t) => a + t.targetMinutes, 0);
  const doneMinutes = todayTasks
    .filter((t) => t.status === 'done')
    .reduce((a, t) => a + t.targetMinutes, 0);
  const examLeft = daysUntilExam(state.profile.examDate);

  const onRegenerate = () => {
    Alert.alert(
      'Planı Yenile',
      'Bugünden itibaren yeni plan üretilecek. Yapılmış görevler korunur. Devam edilsin mi?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Yenile', onPress: () => regeneratePlan() },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Plan"
        subtitle={
          examLeft !== null
            ? examLeft >= 0
              ? `Sınava ${examLeft} gün`
              : `Sınav geçti (${-examLeft} gün önce)`
            : 'Sınav tarihi yok'
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.cardLabel}>Bugün</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.big}>
              {doneMinutes}
              <Text style={styles.muted}> / {totalPlanned} dk</Text>
            </Text>
            <Text style={styles.percent}>
              {totalPlanned > 0
                ? Math.round((doneMinutes / totalPlanned) * 100)
                : 0}
              %
            </Text>
          </View>
          <View style={{ height: spacing.sm }} />
          <ProgressBar
            value={doneMinutes}
            total={Math.max(1, totalPlanned)}
            color={colors.primary}
            height={8}
          />
          <View style={{ height: spacing.sm }} />
          <Button
            title="Planı Yenile"
            variant="secondary"
            onPress={onRegenerate}
          />
        </Card>

        {todayTasks.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>Bugün için henüz görev yok</Text>
            <Text style={styles.muted}>
              Ayarlardan günlük hedefini ve sınav tarihini belirleyip planı
              yenileyebilirsin.
            </Text>
          </Card>
        ) : (
          <Card>
            <Text style={styles.cardLabel}>Bugünün Görevleri</Text>
            <View style={{ gap: spacing.sm }}>
              {todayTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onPress={() =>
                    navigation.navigate('Müfredat', {
                      screen: 'TopicDetail',
                      params: { topicId: task.topicId },
                    })
                  }
                  onToggle={(status) => setTaskStatus(task.id, status)}
                  onFocus={() =>
                    navigation.navigate('Odak', { topicId: task.topicId })
                  }
                />
              ))}
            </View>
          </Card>
        )}

        {upcomingTasks.length > 0 && (
          <Card>
            <Text style={styles.cardLabel}>Bu Hafta</Text>
            <View style={{ gap: spacing.md }}>
              {upcomingTasks.map(([date, tasks]) => (
                <View key={date}>
                  <Text style={styles.dayHeader}>{prettyDate(date)}</Text>
                  <Text style={styles.muted}>
                    {tasks.length} görev • {sumMin(tasks)} dk
                  </Text>
                  <View style={styles.upcomingWrap}>
                    {tasks.slice(0, 4).map((t) => {
                      const topic = getTopicById(t.topicId);
                      return (
                        <View key={t.id} style={styles.upcomingChip}>
                          <Text style={styles.upcomingText}>
                            {topic?.topic.title ?? t.topicId}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const TaskRow: React.FC<{
  task: DailyTask;
  onPress: () => void;
  onToggle: (s: DailyTask['status']) => void;
  onFocus: () => void;
}> = ({ task, onPress, onToggle, onFocus }) => {
  const topic = getTopicById(task.topicId);
  const subject =
    topic?.subject ?? (task.subjectId ? getSubjectById(task.subjectId)?.subject : null);
  const done = task.status === 'done';
  const skipped = task.status === 'skipped';

  const nextStatus: DailyTask['status'] = done ? 'pending' : 'done';

  return (
    <View style={styles.taskRow}>
      <Pressable
        onPress={() => onToggle(nextStatus)}
        style={({ pressed }) => [
          styles.checkbox,
          {
            borderColor: done ? colors.success : colors.border,
            backgroundColor: done ? colors.success : 'transparent',
          },
          pressed && { opacity: 0.85 },
        ]}
      >
        {done && <Text style={styles.check}>✓</Text>}
      </Pressable>
      <Pressable
        onPress={onPress}
        style={{ flex: 1 }}
      >
        <Text
          style={[
            styles.taskTitle,
            done && styles.strike,
            skipped && { color: colors.textDim },
          ]}
          numberOfLines={2}
        >
          {topic?.topic.title ?? task.topicId}
        </Text>
        <Text style={styles.taskMeta}>
          {subject ? `${subject.title} • ` : ''}
          {task.targetMinutes} dk
          {task.status === 'skipped' ? ' • atlandı' : ''}
        </Text>
      </Pressable>
      <Pressable
        onPress={onFocus}
        style={({ pressed }) => [
          styles.focusBtn,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={styles.focusBtnText}>ODAK</Text>
      </Pressable>
    </View>
  );
};

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return `${days[date.getDay()]} ${d}.${m}`;
}

function sumMin(tasks: DailyTask[]): number {
  return tasks.reduce((a, t) => a + t.targetMinutes, 0);
}

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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  big: { color: colors.text, fontSize: 26, fontWeight: '800' },
  percent: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 12 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgSoft,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: colors.white, fontWeight: '800', fontSize: 14 },
  taskTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  taskMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  focusBtn: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  focusBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
  dayHeader: { color: colors.text, fontSize: 14, fontWeight: '700' },
  upcomingWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  upcomingChip: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  upcomingText: { color: colors.textMuted, fontSize: 12 },
});
