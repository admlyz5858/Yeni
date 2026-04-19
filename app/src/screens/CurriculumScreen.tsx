import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { getSectionsForTrack } from '../data/curriculum';
import { defaultTopicProgress } from '../storage/types';

interface Props {
  navigation: any;
}

export const CurriculumScreen: React.FC<Props> = ({ navigation }) => {
  const { state } = useApp();
  const sectionsForTrack = useMemo(
    () => getSectionsForTrack(state.settings.track),
    [state.settings.track],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Müfredat" subtitle="Konuya tıkla, ilerlemeni takip et" />
      <ScrollView contentContainerStyle={styles.content}>
        {sectionsForTrack.map((section) => (
          <View key={section.id} style={{ marginBottom: spacing.lg }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSub}>{section.description}</Text>
            <View style={{ height: spacing.sm }} />
            {section.subjects.map((subject) => {
              let completed = 0;
              for (const topic of subject.topics) {
                const p = state.progress[topic.id] ?? defaultTopicProgress;
                if (p.status === 'completed') completed += 1;
              }
              return (
                <Pressable
                  key={subject.id}
                  onPress={() =>
                    navigation.navigate('SubjectDetail', {
                      subjectId: subject.id,
                    })
                  }
                  style={({ pressed }) => [
                    pressed && { opacity: 0.85 },
                    { marginBottom: spacing.sm },
                  ]}
                >
                  <Card padded>
                    <View style={styles.row}>
                      <View
                        style={[
                          styles.iconBadge,
                          { backgroundColor: subject.color + '33', borderColor: subject.color },
                        ]}
                      >
                        <Text style={[styles.iconText, { color: subject.color }]}>
                          {subject.icon}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.subjectTitle}>{subject.title}</Text>
                        <Text style={styles.subjectSub}>
                          {subject.topics.length} konu
                        </Text>
                      </View>
                      <Text style={styles.subjectPercent}>
                        {Math.round(
                          (completed / Math.max(1, subject.topics.length)) * 100,
                        )}
                        %
                      </Text>
                    </View>
                    <View style={{ height: spacing.sm }} />
                    <ProgressBar
                      value={completed}
                      total={subject.topics.length}
                      color={subject.color}
                    />
                  </Card>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sectionSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconText: { fontSize: 18, fontWeight: '800' },
  subjectTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  subjectSub: { color: colors.textMuted, fontSize: 12 },
  subjectPercent: { color: colors.primary, fontWeight: '700' },
});
