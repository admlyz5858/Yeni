import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CONTENT_TYPES = [
  { id: 'flashcard', label: 'Flashcard', icon: '📇', selected: true },
  { id: 'quiz', label: 'Quiz', icon: '❓', selected: false },
  { id: 'ozet', label: 'Özet', icon: '📄', selected: false },
];

type Props = { navigation: any };

export default function ConverterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState('flashcard');

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Dönüştürücü</Text>
        <TouchableOpacity style={styles.bookmarkBtn}>
          <Text style={styles.bookmarkIcon}>🔖</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.hatEmoji}>🎩</Text>
        <Text style={styles.sparkle}>✨ ✨ ✨</Text>
      </View>

      <TouchableOpacity
        style={[styles.uploadCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      >
        <View style={[styles.uploadIcon, { backgroundColor: theme.accentLight }]}>
          <Text style={styles.uploadIconText}>➕</Text>
        </View>
        <Text style={[styles.uploadTitle, { color: theme.text }]}>İçerik Yükle</Text>
        <Text style={[styles.uploadSub, { color: theme.textSecondary }]}>
          Kamera ile çek veya dosyalardan seç
        </Text>
        <Text style={[styles.uploadCta, { color: theme.accent }]}>👆 Dokunarak başla</Text>
      </TouchableOpacity>

      <Text style={[styles.typeLabel, { color: theme.textSecondary }]}>İçerik Türü</Text>
      <View style={styles.typeRow}>
        {CONTENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.typeCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              selectedType === t.id && { borderColor: theme.accent, backgroundColor: theme.accentLight },
            ]}
            onPress={() => setSelectedType(t.id)}
          >
            <Text style={styles.typeIcon}>{t.icon}</Text>
            <Text
              style={[
                styles.typeLabelText,
                { color: theme.text },
                selectedType === t.id && { color: theme.accent },
              ]}
            >
              {t.label}
            </Text>
            {selectedType === t.id && (
              <View style={[styles.typeIndicator, { backgroundColor: theme.accent }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.convertBtn, { backgroundColor: theme.cardBorder }]}
        disabled
      >
        <Text style={styles.convertIcon}>✨ ✨</Text>
        <Text style={[styles.convertText, { color: theme.textSecondary }]}>Dönüştür</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.notebookLink, { borderColor: theme.cardBorder }]}
        onPress={() => navigation.navigate('NotebookChat')}
      >
        <Text style={styles.notebookLinkIcon}>📓</Text>
        <Text style={[styles.notebookLinkText, { color: theme.accent }]}>Bilge Not Defteri'ne metin ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 'bold' },
  bookmarkBtn: { padding: 8 },
  bookmarkIcon: { fontSize: 22 },
  hero: { alignItems: 'center', marginBottom: 32 },
  hatEmoji: { fontSize: 80, marginBottom: 8 },
  sparkle: { fontSize: 20, color: '#3b82f6' },
  uploadCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadIconText: { fontSize: 32 },
  uploadTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  uploadSub: { fontSize: 14, marginBottom: 12 },
  uploadCta: { fontSize: 14, fontWeight: '600' },
  typeLabel: { fontSize: 14, marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  typeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  typeIcon: { fontSize: 28, marginBottom: 8 },
  typeLabelText: { fontSize: 14, fontWeight: '600' },
  typeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -24,
    width: 48,
    height: 4,
    borderRadius: 2,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 10,
  },
  convertIcon: { fontSize: 18 },
  convertText: { fontSize: 16, fontWeight: '600' },
  notebookLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  notebookLinkIcon: { fontSize: 20 },
  notebookLinkText: { fontSize: 14, fontWeight: '600' },
});
