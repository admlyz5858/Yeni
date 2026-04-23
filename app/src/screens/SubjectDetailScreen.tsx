import React, { useLayoutEffect, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { StatusPill } from '../components/StatusPill';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { getSubjectById } from '../data/curriculum';
import { defaultTopicProgress } from '../storage/types';

interface Props {
  route: any;
  navigation: any;
}

export const SubjectDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { subjectId } = route.params as { subjectId: string };
  const { state } = useApp();
  const data = getSubjectById(subjectId);

  useLayoutEffect(() => {
    if (data) {
      navigation.setOptions({ title: data.subject.title });
    }
  }, [navigation, data]);

  const summary = useMemo(() => {
    if (!data) return { completed: 0, total: 0 };
    let completed = 0;
    for (const t of data.subject.topics) {
      const p = state.progress[t.id] ?? defaultTopicProgress;
      if (p.status === 'completed') completed += 1;
    }
    return { completed, total: data.subject.topics.length };
  }, [data, state.progress]);

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.empty}>Konu bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <Text style={styles.sectionLabel}>{data.section.title}</Text>
        <Text style={styles.title}>{data.subject.title}</Text>
        <Text style={styles.sub}>
          {summary.completed}/{summary.total} konu tamamlandı
        </Text>
        <View style={{ height: spacing.sm }} />
        <ProgressBar
          value={summary.completed}
          total={summary.total}
          color={data.subject.color}
          height={8}
        />
      </View>

      <FlatList
        data={data.subject.topics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => {
          const p = state.progress[item.id] ?? defaultTopicProgress;
          return (
            <Pressable
              onPress={() =>
                navigation.navigate('TopicDetail', { topicId: item.id })
              }
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topicTitle}>{item.title}</Text>
                    <View style={{ height: 6 }} />
                    <StatusPill status={p.status} />
                  </View>
                  <View style={styles.metaCol}>
                    {p.questionsSolved > 0 && (
                      <Text style={styles.meta}>{p.questionsSolved} soru</Text>
                    )}
                    {p.studySeconds > 0 && (
                      <Text style={styles.meta}>
                        {Math.round(p.studySeconds / 60)} dk
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textMuted, padding: spacing.lg },
  headerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center' },
  topicTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  metaCol: { alignItems: 'flex-end', gap: 2 },
  meta: { color: colors.textMuted, fontSize: 12 },
});
