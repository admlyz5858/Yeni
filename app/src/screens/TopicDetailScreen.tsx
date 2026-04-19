import React, { useLayoutEffect, useMemo, useState } from 'react';
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
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusPill } from '../components/StatusPill';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { getTopicById } from '../data/curriculum';
import { TopicStatus, defaultTopicProgress } from '../storage/types';
import { formatDuration } from '../utils/format';

interface Props {
  route: any;
  navigation: any;
}

const statusOptions: { id: TopicStatus; label: string; color: string }[] = [
  { id: 'not_started', label: 'Başlanmadı', color: colors.textDim },
  { id: 'in_progress', label: 'Çalışılıyor', color: colors.warning },
  { id: 'review', label: 'Tekrar', color: colors.accent },
  { id: 'completed', label: 'Tamamlandı', color: colors.success },
];

export const TopicDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { topicId } = route.params as { topicId: string };
  const { state, updateTopic, setTopicStatus } = useApp();
  const data = useMemo(() => getTopicById(topicId), [topicId]);

  const progress = state.progress[topicId] ?? defaultTopicProgress;
  const [notesDraft, setNotesDraft] = useState(progress.notes);

  useLayoutEffect(() => {
    if (data) navigation.setOptions({ title: data.topic.title });
  }, [navigation, data]);

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.empty}>Konu bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  const accuracy =
    progress.questionsSolved > 0
      ? Math.round((progress.correctAnswers / progress.questionsSolved) * 100)
      : 0;

  const addQuestions = (correct: number, wrong: number) => {
    updateTopic(topicId, {
      questionsSolved: progress.questionsSolved + correct + wrong,
      correctAnswers: progress.correctAnswers + correct,
      status:
        progress.status === 'not_started' ? 'in_progress' : progress.status,
    });
  };

  const startFocus = () => {
    navigation.navigate('Odak', { topicId });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View>
            <Text style={styles.breadcrumb}>
              {data.section.title} • {data.subject.title}
            </Text>
            <Text style={styles.title}>{data.topic.title}</Text>
            <View style={{ height: spacing.sm }} />
            <StatusPill status={progress.status} />
          </View>

          <Card>
            <Text style={styles.cardLabel}>Durum</Text>
            <View style={styles.statusGrid}>
              {statusOptions.map((opt) => {
                const active = progress.status === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setTopicStatus(topicId, opt.id)}
                    style={({ pressed }) => [
                      styles.statusBtn,
                      {
                        borderColor: active ? opt.color : colors.border,
                        backgroundColor: active ? opt.color + '22' : 'transparent',
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBtnText,
                        { color: active ? opt.color : colors.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text style={styles.cardLabel}>Soru Çözümü</Text>
            <View style={styles.statsRow}>
              <StatBox label="Çözülen" value={progress.questionsSolved.toString()} />
              <StatBox label="Doğru" value={progress.correctAnswers.toString()} />
              <StatBox label="Başarı" value={`${accuracy}%`} />
            </View>
            <View style={styles.quickRow}>
              <Button
                title="+5 Doğru"
                variant="secondary"
                onPress={() => addQuestions(5, 0)}
                style={{ flex: 1 }}
              />
              <Button
                title="+5 Yanlış"
                variant="secondary"
                onPress={() => addQuestions(0, 5)}
                style={{ flex: 1 }}
              />
            </View>
            <View style={styles.quickRow}>
              <Button
                title="+10 Doğru"
                variant="secondary"
                onPress={() => addQuestions(10, 0)}
                style={{ flex: 1 }}
              />
              <Button
                title="+10 Yanlış"
                variant="secondary"
                onPress={() => addQuestions(0, 10)}
                style={{ flex: 1 }}
              />
            </View>
            <View style={{ height: spacing.xs }} />
            <Button
              title="Sayaçları Sıfırla"
              variant="ghost"
              onPress={() =>
                updateTopic(topicId, { questionsSolved: 0, correctAnswers: 0 })
              }
            />
          </Card>

          <Card>
            <Text style={styles.cardLabel}>Çalışma Süresi</Text>
            <Text style={styles.bigStat}>
              {formatDuration(progress.studySeconds)}
            </Text>
            <View style={{ height: spacing.sm }} />
            <Button title="Bu konuya odaklan" onPress={startFocus} />
          </Card>

          <Card>
            <Text style={styles.cardLabel}>Notlarım</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Bu konuya dair kısa notlar..."
              placeholderTextColor={colors.textDim}
              multiline
              value={notesDraft}
              onChangeText={setNotesDraft}
              onBlur={() => updateTopic(topicId, { notes: notesDraft })}
            />
            <Button
              title="Notu Kaydet"
              variant="secondary"
              onPress={() => updateTopic(topicId, { notes: notesDraft })}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textMuted, padding: spacing.lg },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  breadcrumb: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  statusBtnText: { fontSize: 13, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.bgSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bigStat: { color: colors.text, fontSize: 24, fontWeight: '700' },
  textarea: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
