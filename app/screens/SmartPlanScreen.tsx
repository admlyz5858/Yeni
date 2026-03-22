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
import { SUBJECTS } from '../data/subjects';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

type Props = {
  navigation: any;
};

export default function SmartPlanScreen({ navigation }: Props) {
  const { examDate, dailyGoalHours, setSchedule } = usePlan();
  const [generated, setGenerated] = useState(false);

  const generatePlan = () => {
    const items: { day: string; subjectId: string; hours: number }[] = [];
    let daysUntil = 90;
    if (examDate) {
      const exam = new Date(examDate);
      const today = new Date();
      daysUntil = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    const totalHours = daysUntil * dailyGoalHours;
    const subjectsPerDay = 3;
    const hrsPerSlot = Math.max(0.5, Math.floor((dailyGoalHours / subjectsPerDay) * 2) / 2);

    DAYS.forEach((day, di) => {
      for (let i = 0; i < subjectsPerDay; i++) {
        const subj = SUBJECTS[(di + i) % SUBJECTS.length];
        items.push({ day, subjectId: subj.id, hours: hrsPerSlot });
      }
    });
    setSchedule(items);
    setGenerated(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🤖 Akıllı Plan Oluşturucu</Text>
        <Text style={styles.subtitle}>
          Hedeflerinize göre otomatik haftalık program oluşturur
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardIcon}>✨</Text>
        <Text style={styles.cardTitle}>Nasıl çalışır?</Text>
        <Text style={styles.cardText}>
          Sınav tarihi ve günlük hedefinizi "Hedefler" ekranından ayarlayın. Bu araç, tüm konuları haftaya dengeli dağıtır ve her gün {dailyGoalHours} saat hedefinize uygun bir program üretir.
        </Text>
      </View>

      <TouchableOpacity style={styles.generateBtn} onPress={generatePlan}>
        <Text style={styles.generateBtnText}>Plan Oluştur</Text>
      </TouchableOpacity>

      {generated && (
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successText}>Program oluşturuldu! Haftalık Program ekranından inceleyebilirsiniz.</Text>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('Schedule')}
          >
            <Text style={styles.viewBtnText}>Programı Görüntüle</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { padding: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748b' },
  card: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  cardIcon: { fontSize: 32, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  cardText: { fontSize: 15, color: '#475569', lineHeight: 24 },
  generateBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  generateBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  successCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    alignItems: 'center',
  },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successText: { fontSize: 16, color: '#065f46', textAlign: 'center', marginBottom: 16 },
  viewBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewBtnText: { color: '#fff', fontWeight: '600' },
});
