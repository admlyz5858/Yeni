import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSubjects } from '../context/SubjectsContext';
import { COLORS, ICONS } from '../context/SubjectsContext';

type Props = {
  navigation: any;
};

export default function SubjectsScreen({ navigation }: Props) {
  const { subjects, addSubject, addTopic, deleteSubject, removeTopic } = useSubjects();
  const [modalVisible, setModalVisible] = useState(false);
  const [topicModal, setTopicModal] = useState<{ subjectId: string; subjectName: string } | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      addSubject(newSubjectName.trim());
      setNewSubjectName('');
      setModalVisible(false);
    }
  };

  const handleAddTopic = () => {
    if (topicModal && newTopicName.trim()) {
      addTopic(topicModal.subjectId, newTopicName.trim());
      setNewTopicName('');
      setTopicModal(null);
    }
  };

  const handleDeleteSubject = (id: string, name: string) => {
    Alert.alert('Dersi Sil', `"${name}" dersini silmek istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteSubject(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Derslerim</Text>
        <Text style={styles.subtitle}>Ders ve konularınızı kendiniz ekleyin</Text>
      </View>

      {subjects.map((subj) => (
        <View key={subj.id} style={[styles.card, { borderLeftColor: subj.color }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>{subj.icon}</Text>
            <Text style={styles.cardName}>{subj.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteSubject(subj.id, subj.name)}>
              <Text style={styles.deleteBtn}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.topics}>
            {subj.topics.map((t) => (
              <View key={t} style={styles.topicRow}>
                <Text style={styles.topicText}>• {t}</Text>
                <TouchableOpacity onPress={() => removeTopic(subj.id, t)}>
                  <Text style={styles.topicRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.addTopicBtn}
            onPress={() => setTopicModal({ subjectId: subj.id, subjectName: subj.name })}
          >
            <Text style={styles.addTopicText}>+ Konu Ekle</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addSubjectBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addSubjectText}>+ Yeni Ders Ekle</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Ders</Text>
            <TextInput
              style={styles.input}
              placeholder="Ders adı"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddSubject}>
                <Text style={styles.saveBtnText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!topicModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{topicModal?.subjectName} - Yeni Konu</Text>
            <TextInput
              style={styles.input}
              placeholder="Konu adı"
              value={newTopicName}
              onChangeText={setNewTopicName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setTopicModal(null)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddTopic}>
                <Text style={styles.saveBtnText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIcon: { fontSize: 28, marginRight: 12 },
  cardName: { fontSize: 18, fontWeight: '600', color: '#1e293b', flex: 1 },
  deleteBtn: { fontSize: 24, color: '#dc2626', padding: 4 },
  topics: { marginBottom: 12, gap: 4 },
  topicRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  topicText: { fontSize: 15, color: '#334155', flex: 1 },
  topicRemove: { fontSize: 14, color: '#94a3b8', padding: 4 },
  addTopicBtn: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  addTopicText: { fontSize: 14, color: '#64748b' },
  addSubjectBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  addSubjectText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12 },
  cancelBtnText: { color: '#64748b', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#2563eb', borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});
