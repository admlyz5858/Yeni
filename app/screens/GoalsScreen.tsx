import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { usePlan } from '../context/PlanContext';

type Props = {
  navigation: any;
};

export default function GoalsScreen({ navigation }: Props) {
  const {
    examDate,
    setExamDate,
    dailyGoalHours,
    setDailyGoalHours,
    schedule,
    setSchedule,
  } = usePlan();

  const [dateInput, setDateInput] = useState(examDate || '');
  const [hoursInput, setHoursInput] = useState(String(dailyGoalHours));

  const handleSave = () => {
    const date = dateInput.trim() || null;
    setExamDate(date);

    const hours = parseInt(hoursInput, 10);
    if (!isNaN(hours) && hours >= 1 && hours <= 12) {
      setDailyGoalHours(hours);
    }
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
        <Text style={styles.title}>Hedefler</Text>
        <Text style={styles.subtitle}>
          Sınav tarihini ve günlük çalışma hedefinizi belirleyin
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Sınav Tarihi</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD (örn: 2025-07-20)"
          placeholderTextColor="#94a3b8"
          value={dateInput}
          onChangeText={setDateInput}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱️ Günlük Hedef (saat)</Text>
        <TextInput
          style={styles.input}
          placeholder="4"
          placeholderTextColor="#94a3b8"
          value={hoursInput}
          onChangeText={setHoursInput}
          keyboardType="number-pad"
        />
        <Text style={styles.hint}>Günde kaç saat çalışmayı hedefliyorsunuz?</Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Kaydet</Text>
      </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  hint: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
