import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { usePlan } from '../context/PlanContext';
import { SUBJECTS } from '../data/subjects';

type Props = {
  navigation: any;
};

export default function PlanScreen({ navigation }: Props) {
  const { completedTopics, toggleTopic } = usePlan();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Çalışma Planı</Text>
        <Text style={styles.subtitle}>
          Konuları tamamladıkça işaretleyin
        </Text>
      </View>

      {SUBJECTS.map((subject) => {
        const done = (completedTopics[subject.id] && Object.values(completedTopics[subject.id]).filter(Boolean).length) || 0;
        const total = subject.topics.length;

        return (
          <View key={subject.id} style={[styles.subjectCard, { borderLeftColor: subject.color }]}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectIcon}>{subject.icon}</Text>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectProgress}>{done}/{total} konu</Text>
              </View>
            </View>
            <View style={styles.topics}>
              {subject.topics.map((topic) => {
                const isDone = completedTopics[subject.id]?.[topic] ?? false;
                return (
                  <TouchableOpacity
                    key={topic}
                    style={[styles.topicRow, isDone && styles.topicDone]}
                    onPress={() => toggleTopic(subject.id, topic)}
                  >
                    <Text style={styles.checkbox}>{isDone ? '☑' : '☐'}</Text>
                    <Text style={[styles.topicText, isDone && styles.topicTextDone]}>{topic}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { padding: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#64748b' },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  subjectIcon: { fontSize: 28, marginRight: 12 },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
  subjectProgress: { fontSize: 13, color: '#64748b' },
  topics: { gap: 8 },
  topicRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  topicDone: { opacity: 0.7 },
  checkbox: { fontSize: 18, marginRight: 12 },
  topicText: { fontSize: 15, color: '#334155', flex: 1 },
  topicTextDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
});
