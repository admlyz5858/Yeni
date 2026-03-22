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

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

type Props = {
  navigation: any;
};

export default function ScheduleScreen({ navigation }: Props) {
  const { schedule, setSchedule, dailyGoalHours } = usePlan();

  const createSampleSchedule = () => {
    const items: { day: string; subjectId: string; hours: number }[] = [];
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
          Her gün için hedef: {dailyGoalHours} saat
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Haftalık programınızı "Hedefler" ekranından günlük çalışma saatini belirleyerek planlayabilirsiniz. Örnek program oluşturup kendinize göre düzenleyebilirsiniz.
        </Text>
      </View>

      {schedule.length === 0 && (
        <TouchableOpacity style={styles.sampleBtn} onPress={createSampleSchedule}>
          <Text style={styles.sampleBtnText}>📋 Örnek Haftalık Program Oluştur</Text>
        </TouchableOpacity>
      )}

      <View style={styles.daysList}>
        {DAYS.map((day, i) => {
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
                  {daySchedule.map((s) => {
                    const subj = SUBJECTS.find((x) => x.id === s.subjectId);
                    return (
                      <View key={`${day}-${s.subjectId}`} style={styles.subjectTag}>
                        <Text style={styles.subjectTagIcon}>{subj?.icon || '📖'}</Text>
                        <Text style={styles.subjectTagText}>{subj?.name} ({s.hours}s)</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>Henüz plan yok</Text>
              )}
            </View>
          );
        })}
      </View>
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
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoIcon: { fontSize: 24, marginRight: 12 },
  infoText: { flex: 1, fontSize: 14, color: '#1e40af', lineHeight: 22 },
  sampleBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  sampleBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  daysList: { gap: 12 },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  dayHours: { fontSize: 14, color: '#64748b' },
  subjectsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectTagIcon: { fontSize: 14, marginRight: 4 },
  subjectTagText: { fontSize: 12, color: '#475569' },
  emptyText: { fontSize: 14, color: '#94a3b8' },
});
