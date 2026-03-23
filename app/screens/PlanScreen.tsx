import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { usePlan } from '../context/PlanContext';
import { useSubjects } from '../context/SubjectsContext';

type Props = {
  navigation: any;
};

export default function PlanScreen({ navigation }: Props) {
  const { completedTopics, toggleTopic, topicNotes, setTopicNote } = usePlan();
  const { subjects } = useSubjects();
  const [modalVisible, setModalVisible] = useState(false);
  const [editTopic, setEditTopic] = useState<{ subjectId: string; topic: string } | null>(null);

  const openNote = (subjectId: string, topic: string) => {
    setEditTopic({ subjectId, topic });
    setModalVisible(true);
  };

  const note = editTopic
    ? topicNotes[editTopic.subjectId]?.[editTopic.topic] || ''
    : '';

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
          Konuları tamamladıkça işaretleyin • Not eklemek için 📝
        </Text>
        <TouchableOpacity
          style={styles.subjectsLink}
          onPress={() => navigation.navigate('Subjects')}
        >
          <Text style={styles.subjectsLinkText}>📚 Dersleri Düzenle</Text>
        </TouchableOpacity>
      </View>

      {subjects.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>Henüz ders eklenmedi</Text>
          <Text style={styles.emptySub}>Önce "Derslerim" ekranından ders ve konularınızı ekleyin.</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('Subjects')}
          >
            <Text style={styles.emptyBtnText}>Dersleri Düzenle</Text>
          </TouchableOpacity>
        </View>
      ) : subjects.map((subject) => {
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
                const hasNote = !!(topicNotes[subject.id]?.[topic]?.trim());
                return (
                  <View key={topic} style={styles.topicRowWrap}>
                    <TouchableOpacity
                      style={[styles.topicRow, isDone && styles.topicDone]}
                      onPress={() => toggleTopic(subject.id, topic)}
                    >
                      <Text style={styles.checkbox}>{isDone ? '☑' : '☐'}</Text>
                      <Text style={[styles.topicText, isDone && styles.topicTextDone]}>{topic}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.noteBtn}
                      onPress={() => openNote(subject.id, topic)}
                    >
                      <Text style={styles.noteIcon}>{hasNote ? '📝' : '📄'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{editTopic?.topic}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Bu konu hakkında not yazın..."
              placeholderTextColor="#94a3b8"
              value={note}
              onChangeText={(t) =>
                editTopic && setTopicNote(editTopic.subjectId, editTopic.topic, t)
              }
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  subjectsLink: { marginTop: 8, padding: 8 },
  subjectsLinkText: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  emptySub: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  emptyBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '600' },
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
  topics: { gap: 4 },
  topicRowWrap: { flexDirection: 'row', alignItems: 'center' },
  topicRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  topicDone: { opacity: 0.7 },
  checkbox: { fontSize: 18, marginRight: 12 },
  topicText: { fontSize: 15, color: '#334155', flex: 1 },
  topicTextDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  noteBtn: { padding: 8 },
  noteIcon: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 16 },
  modalInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalClose: {
    marginTop: 16,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
  },
  modalCloseText: { color: '#fff', fontWeight: '600' },
});
