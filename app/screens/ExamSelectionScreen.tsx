import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CYAN = '#06b6d4';
const GREEN = '#10b981';
const BG_LIGHT = '#e0f7fa';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#64748b';

const EXAMS = [
  { id: 'YKS', label: 'YKS' },
  { id: 'LGS', label: 'LGS' },
  { id: 'DGS', label: 'DGS' },
  { id: 'ALES', label: 'ALES' },
  { id: 'AGS', label: 'AGS - ÖABT' },
  { id: 'KPSS', label: 'KPSS', hasSub: true },
];

const KPSS_TYPES = [
  { id: 'KPSS_LISANS', label: 'KPSS Lisans' },
  { id: 'KPSS_ONLISANS', label: 'KPSS Önlisans' },
  { id: 'KPSS_ORTAOGRETIM', label: 'KPSS Ortaöğretim' },
];

type Props = {
  progress?: number;
  onSelect: (examId: string) => void;
};

export default function ExamSelectionScreen({ progress = 0.7, onSelect }: Props) {
  const [kpssModal, setKpssModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const handleExamPress = (exam: (typeof EXAMS)[0]) => {
    if (exam.hasSub) {
      setKpssModal(true);
    } else {
      setSelectedExam(exam.id);
      setConfirmModal(true);
    }
  };

  const handleKpssSelect = (id: string) => {
    setKpssModal(false);
    setSelectedExam(id);
    setConfirmModal(true);
  };

  const handleConfirm = () => {
    if (selectedExam) {
      onSelect(selectedExam);
    }
    setConfirmModal(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sınav Seçimi</Text>
      <View style={styles.progressWrap}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          <View style={[styles.progressFillGreen, { left: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.mascotWrap}>
        <Text style={styles.mascot}>🦉</Text>
        <Text style={styles.instruction}>Haydi hazırlanacağın sınavı seçelim</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {EXAMS.map((exam) => (
          <TouchableOpacity
            key={exam.id}
            style={styles.examBtn}
            onPress={() => handleExamPress(exam)}
          >
            <Text style={styles.examLabel}>{exam.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* KPSS Türü Modal */}
      <Modal visible={kpssModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hangi KPSS türüne hazırlanıyorsun?</Text>
            {KPSS_TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.modalBtn}
                onPress={() => handleKpssSelect(t.id)}
              >
                <Text style={styles.modalBtnText}>{t.label}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Onay Modal */}
      <Modal visible={confirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>
              {KPSS_TYPES.find((t) => t.id === selectedExam)?.label || selectedExam}
            </Text>
            <Text style={styles.confirmSub}>Bu sınavı seçmek istediğine emin misin?</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>Evet, Devam Et</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmModal(false)}>
              <Text style={styles.cancelText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: BG_LIGHT },
  title: { fontSize: 22, fontWeight: 'bold', color: TEXT_DARK, textAlign: 'center', marginBottom: 16 },
  progressWrap: { marginBottom: 32 },
  progressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: CYAN,
  },
  progressFillGreen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '5%',
    backgroundColor: GREEN,
  },
  mascotWrap: { alignItems: 'center', marginBottom: 32 },
  mascot: { fontSize: 64, marginBottom: 12 },
  instruction: { fontSize: 16, color: TEXT_DARK, textAlign: 'center' },
  list: { flex: 1 },
  examBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  examLabel: { fontSize: 16, fontWeight: '600', color: TEXT_DARK },
  chevron: { fontSize: 20, color: TEXT_MUTED },
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
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 24 },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 14,
    marginBottom: 12,
  },
  modalBtnText: { fontSize: 16, fontWeight: '600', color: TEXT_DARK },
  confirmCard: {
    backgroundColor: '#fff',
    marginHorizontal: 32,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  confirmTitle: { fontSize: 22, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 12 },
  confirmSub: { fontSize: 16, color: TEXT_MUTED, marginBottom: 24 },
  confirmBtn: {
    backgroundColor: CYAN,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  cancelText: { fontSize: 16, color: TEXT_MUTED },
});
