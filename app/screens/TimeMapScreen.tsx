import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const CYAN = '#4FC3F7';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#64748b';
const BORDER = '#e2e8f0';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const TIME_SLOTS = [
  { label: 'Gündoğumu (05-09)', slots: ['05:00-07:00', '07:00-09:00'] },
  { label: 'Sabah (09-13)', slots: ['09:00-11:00', '11:00-13:00'] },
  { label: 'Öğleden Sonra (13-18)', slots: ['13:00-15:00', '15:00-18:00'] },
  { label: 'Akşam (18-23)', slots: ['18:00-20:00', '20:00-23:00'] },
  { label: 'Gece Vardiyası (23-05)', slots: ['23:00-01:00', '01:00-03:00', '03:00-05:00'] },
];

type ScheduleState = Record<string, Record<string, boolean>>;

function initSchedule(): ScheduleState {
  const s: ScheduleState = {};
  DAYS.forEach((day) => {
    s[day] = {};
    TIME_SLOTS.forEach((cat) => {
      cat.slots.forEach((slot) => {
        s[day][slot] = false;
      });
    });
  });
  return s;
}

type Props = { navigation: any; onSave?: (schedule: ScheduleState) => void };

export default function TimeMapScreen({ navigation, onSave }: Props) {
  const [schedule, setSchedule] = useState<ScheduleState>(initSchedule());

  const toggle = (day: string, slot: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: !prev[day]?.[slot],
      },
    }));
  };

  const fillDay = (day: string, fill: boolean) => {
    setSchedule((prev) => {
      const next = { ...prev };
      next[day] = {};
      TIME_SLOTS.forEach((cat) => {
        cat.slots.forEach((slot) => {
          next[day][slot] = fill;
        });
      });
      return next;
    });
  };

  const handleSave = () => {
    onSave?.(schedule);
    navigation.goBack?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack?.()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Zaman Haritası</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>Kaydet ve Bitir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Zaman Seçimi</Text>
      <View style={styles.accentLine} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day}</Text>
              <View style={styles.dayActions}>
                <TouchableOpacity onPress={() => fillDay(day, true)}>
                  <Text style={styles.fillLink}>Doldur</Text>
                </TouchableOpacity>
                <Text style={styles.sep}>/</Text>
                <TouchableOpacity onPress={() => fillDay(day, false)}>
                  <Text style={styles.fillLink}>Boşalt</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.copyBtn}>
                <Text style={styles.copyIcon}>⧉</Text>
              </TouchableOpacity>
            </View>
            {TIME_SLOTS.map((cat) => (
              <View key={cat.label} style={styles.slotSection}>
                <Text style={styles.slotCategory}>{cat.label}</Text>
                <View style={styles.slotRow}>
                  {cat.slots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.slotBtn,
                        schedule[day]?.[slot] && styles.slotBtnActive,
                      ]}
                      onPress={() => toggle(day, slot)}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          schedule[day]?.[slot] && styles.slotTextActive,
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 24, color: CYAN },
  title: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK },
  saveBtn: { fontSize: 16, color: CYAN, fontWeight: '600' },
  subtitle: { fontSize: 22, fontWeight: 'bold', color: TEXT_DARK, marginHorizontal: 20, marginBottom: 8 },
  accentLine: {
    height: 6,
    backgroundColor: CYAN,
    marginHorizontal: 20,
    borderRadius: 3,
    marginBottom: 24,
  },
  scroll: { flex: 1, paddingHorizontal: 20 },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayName: { flex: 1, fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  dayActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fillLink: { fontSize: 14, color: CYAN, fontWeight: '500' },
  sep: { fontSize: 14, color: TEXT_MUTED },
  copyBtn: { padding: 8 },
  copyIcon: { fontSize: 18, color: TEXT_MUTED },
  slotSection: { marginBottom: 16 },
  slotCategory: { fontSize: 14, color: TEXT_MUTED, marginBottom: 8 },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: '#fff',
  },
  slotBtnActive: { backgroundColor: CYAN, borderColor: CYAN },
  slotText: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  slotTextActive: { color: '#fff' },
});
