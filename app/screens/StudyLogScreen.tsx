import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { usePlan } from '../context/PlanContext';
import { SUBJECTS } from '../data/subjects';

type Props = {
  navigation: any;
};

const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function getLast30Days(): { date: string; dayName: string }[] {
  const result: { date: string; dayName: string }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push({
      date: d.toISOString().slice(0, 10),
      dayName: DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1],
    });
  }
  return result;
}

export default function StudyLogScreen({ navigation }: Props) {
  const { studyLog, logStudy } = usePlan();
  const [modalVisible, setModalVisible] = useState(false);
  const [hoursInput, setHoursInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const days = getLast30Days();
  const totalHours = days.reduce((acc, d) => acc + (studyLog[d.date] || 0), 0);

  const handleLog = () => {
    const h = parseFloat(hoursInput.replace(',', '.'));
    if (!isNaN(h) && h > 0) {
      logStudy(selectedDate, h);
      setHoursInput('');
      setModalVisible(false);
    }
  };

  const openModal = (date: string) => {
    setSelectedDate(date);
    setHoursInput('');
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
        <Text style={styles.title}>Çalışma Günlüğü</Text>
        <Text style={styles.subtitle}>
          Son 30 gün • Toplam {totalHours.toFixed(1)} saat
        </Text>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => openModal(new Date().toISOString().slice(0, 10))}>
        <Text style={styles.addBtnText}>+ Bugün Çalıştım (Saat Ekle)</Text>
      </TouchableOpacity>

      <View style={styles.calendar}>
        {days.map(({ date, dayName }) => {
          const hours = studyLog[date] || 0;
          const hasData = hours > 0;
          return (
            <TouchableOpacity
              key={date}
              style={[styles.dayCell, hasData && styles.dayCellFilled]}
              onPress={() => openModal(date)}
            >
              <Text style={styles.dayName}>{dayName}</Text>
              <Text style={styles.dayDate}>{date.slice(8, 10)}</Text>
              {hasData && <Text style={styles.dayHours}>{hours}h</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{selectedDate} - Kaç saat?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Örn: 2.5"
              placeholderTextColor="#94a3b8"
              value={hoursInput}
              onChangeText={setHoursInput}
              keyboardType="decimal-pad"
              autoFocus
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleLog}>
              <Text style={styles.modalBtnText}>Kaydet</Text>
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
  header: { marginBottom: 20 },
  backBtn: { padding: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#64748b' },
  addBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  addBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayCell: {
    width: '23%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayCellFilled: { backgroundColor: '#ecfdf5', borderWidth: 2, borderColor: '#059669' },
  dayName: { fontSize: 11, color: '#64748b' },
  dayDate: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  dayHours: { fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 16 },
  modalInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
  },
  modalBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
