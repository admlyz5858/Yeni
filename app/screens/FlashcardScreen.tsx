import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useFlashcards } from '../context/FlashcardContext';
import { usePremium } from '../context/PremiumContext';
import { useSubjects } from '../context/SubjectsContext';
import type { Flashcard } from '../context/FlashcardContext';

type Props = {
  navigation: any;
};

const FREE_FLASHCARD_LIMIT = 20;

export default function FlashcardScreen({ navigation }: Props) {
  const { getDueCards, updateCard, addCard, cardsCount } = useFlashcards();
  const { hasFeature } = usePremium();
  const { subjects } = useSubjects();
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      setDueCards(getDueCards());
      setIndex(0);
      setFlipped(false);
    }, [])
  );

  const card = dueCards[index];

  const handleQuality = (q: number) => {
    if (card) {
      updateCard(card.id, q);
      if (index < dueCards.length - 1) {
        setIndex((i) => i + 1);
        setFlipped(false);
      } else {
        navigation.goBack();
      }
    }
  };

  const handleAdd = () => {
    if (front.trim() && back.trim()) {
      if (!hasFeature('unlimited_flashcards') && cardsCount >= FREE_FLASHCARD_LIMIT) {
        Alert.alert('Limit', `Ücretsiz kullanıcılar ${FREE_FLASHCARD_LIMIT} karta kadar ekleyebilir. Premium ile sınırsız kart!`);
        return;
      }
      const sid = subjects[0]?.id ?? 'genel';
      const top = subjects[0]?.topics?.[0] ?? 'Genel';
      addCard(sid, top, front.trim(), back.trim());
      setFront('');
      setBack('');
      setAddModal(false);
    }
  };

  if (dueCards.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📇 Kartlar</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyTitle}>Bugün tekrar yok!</Text>
          <Text style={styles.emptySub}>Tüm kartlarınızı tekrarladınız.</Text>
        </View>
        <TouchableOpacity style={styles.addCardBtn} onPress={() => setAddModal(true)}>
          <Text style={styles.addCardBtnText}>
            + Yeni Kart Ekle {!hasFeature('unlimited_flashcards') ? `(${cardsCount}/${FREE_FLASHCARD_LIMIT})` : ''}
          </Text>
        </TouchableOpacity>
        <Modal visible={addModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Yeni Kart</Text>
              <TextInput
                style={styles.input}
                placeholder="Ön yüz (soru)"
                value={front}
                onChangeText={setFront}
              />
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder="Arka yüz (cevap)"
                value={back}
                onChangeText={setBack}
                multiline
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAddModal(false)}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>{index + 1} / {dueCards.length}</Text>
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => setFlipped(!flipped)}
        activeOpacity={1}
      >
        <Text style={styles.cardText}>
          {flipped ? card.back : card.front}
        </Text>
        <Text style={styles.tapHint}>Cevaplamak için dokun</Text>
      </TouchableOpacity>

      {flipped && (
        <View style={styles.qualityRow}>
          <TouchableOpacity style={[styles.qualityBtn, { backgroundColor: '#fef2f2' }]} onPress={() => handleQuality(1)}>
            <Text style={styles.qualityText}>Zor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.qualityBtn, { backgroundColor: '#fef9c3' }]} onPress={() => handleQuality(3)}>
            <Text style={styles.qualityText}>İyi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.qualityBtn, { backgroundColor: '#dcfce7' }]} onPress={() => handleQuality(5)}>
            <Text style={styles.qualityText}>Kolay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { padding: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 24 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1e293b' },
  emptySub: { fontSize: 15, color: '#64748b', marginTop: 8 },
  addCardBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  addCardBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  progress: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardText: { fontSize: 22, color: '#1e293b', textAlign: 'center', lineHeight: 32 },
  tapHint: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 24 },
  qualityRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  qualityBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  qualityText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16 },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  cancelText: { color: '#64748b', textAlign: 'center' },
});
