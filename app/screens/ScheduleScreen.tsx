import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { usePlan } from '../context/PlanContext';
import { SUBJECTS } from '../data/subjects';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

type ScheduleItem = { day: string; subjectId: string; hours: number };

type Props = {
  navigation: any;
};

export default function ScheduleScreen({ navigation }: Props) {
  const { schedule, setSchedule, dailyGoalHours } = usePlan();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);

  const createSampleSchedule = () => {
    const items: ScheduleItem[] = [];
    const subjectsPerDay = 2;
    const hrsPerSubject = Math.max(1, Math.floor(dailyGoalHours / subjectsPerDay));
    DAYS.forEach((day, dayIndex) => {
      for (let j = 0; j < subjectsPerDay; j++) {
        const subj = SUBJECTS[(dayIndex + j) % SUBJECTS.length];
        items.push({ day, subjectId: subj.id, hours: hrsPerSubject });
      }
    });
    setSchedule(items);
  };

  const addToDay = (day: string, subjectId: string, hours: number) => {
    setSchedule([...schedule, { day, subjectId, hours }]);
    setModalVisible(false);
    setEditingDay(null);
  };

  const removeFromDay = (day: string, index: number) => {
    const dayItems = schedule.filter((s) => s.day === day);
    const rest = schedule.filter((s) => s.day !== day);
    dayItems.splice(index, 1);
    setSchedule([...rest, ...dayItems]);
  };

  const openAddModal = (day: string) => {
    setEditingDay(day);
    setModalVisible(true);
  };

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
        <Text style={styles.title}>Haftalık Program</Text>
        <Text style={styles.subtitle}>
          Her gün için hedef: {dailyGoalHours} saat • Günlere tıklayarak ekleyin
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.sampleBtn} onPress={createSampleSchedule}>
          <Text style={styles.sampleBtnText}>📋 Örnek Program</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysList}>
        {DAYS.map((day) => {
          const daySchedule = schedule.filter((s) => s.day === day);
          const totalHours = daySchedule.reduce((acc, s) => acc + s.hours, 0);

          return (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day}</Text>
                <Text style={styles.dayHours}>
                  {totalHours > 0 ? `${totalHours} saat` : '—'}
                </Text>
              </View>
              {daySchedule.length > 0 ? (
                <View style={styles.subjectsRow}>
                  {daySchedule.map((s, idx) => {
                    const subj = SUBJECTS.find((x) => x.id === s.subjectId);
                    return (
                      <View key={`${day}-${idx}-${s.subjectId}`} style={styles.subjectTag}>
                        <Text style={styles.subjectTagIcon}>{subj?.icon || '📖'}</Text>
                        <Text style={styles.subjectTagText}>{subj?.name} ({s.hours}s)</Text>
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => removeFromDay(day, idx)}
                        >
                          <Text style={styles.removeBtnText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.addDayBtn}
                onPress={() => openAddModal(day)}
              >
                <Text style={styles.addDayBtnText}>+ Ders Ekle</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>
              {editingDay} - Ders ve süre seçin
            </Text>
            {SUBJECTS.map((subj) => (
              <TouchableOpacity
                key={subj.id}
                style={styles.modalOption}
                onPress={() => editingDay && addToDay(editingDay, subj.id, Math.max(1, Math.floor(dailyGoalHours / 2)))}
              >
                <Text style={styles.modalOptionIcon}>{subj.icon}</Text>
                <Text style={styles.modalOptionText}>{subj.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  backBtn: { padding: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#64748b' },
  actions: { marginBottom: 20 },
  sampleBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  sampleBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  daysList: { gap: 12 },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dayName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  dayHours: { fontSize: 14, color: '#64748b' },
  subjectsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subjectTagIcon: { fontSize: 14, marginRight: 4 },
  subjectTagText: { fontSize: 12, color: '#475569' },
  removeBtn: { marginLeft: 6 },
  removeBtnText: { fontSize: 18, color: '#dc2626', fontWeight: 'bold' },
  addDayBtn: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  addDayBtnText: { fontSize: 14, color: '#64748b' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 20 },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionIcon: { fontSize: 24, marginRight: 12 },
  modalOptionText: { fontSize: 16, color: '#1e293b' },
});
