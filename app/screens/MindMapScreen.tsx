import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const MAP_CARD_WIDTH = width * 0.7;

type Props = { navigation: any };

const SAMPLE_MAPS = [
  { id: '1', title: 'Türk İdare Tarihi' },
  { id: '2', title: 'Anayasa' },
];

export default function MindMapScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Zihin Haritası</Text>
        <TouchableOpacity style={styles.bookmarkBtn} onPress={() => Alert.alert('Yakında', 'Yer imleri özelliği yakında eklenecek.')}>
          <Text style={styles.bookmarkIcon}>🔖</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.intro}>
        <View style={[styles.brainIcon, { backgroundColor: theme.accentLight }]}>
          <Text style={styles.brainEmoji}>🧠</Text>
        </View>
        <Text style={[styles.introText, { color: theme.textSecondary }]}>
          Karmaşık konuları görselleştir. Listeden bir konu seç, Bilge Baykuş senin için dallara ayırsın.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mapRow}
      >
        {SAMPLE_MAPS.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.mapCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => Alert.alert('Yakında', `${m.title} haritası yakında açılacak.`)}
          >
            <View style={styles.mapPreview}>
              <View style={styles.mapNode} />
              <View style={[styles.mapBranch, styles.branch1]} />
              <View style={[styles.mapBranch, styles.branch2]} />
              <View style={[styles.mapBranch, styles.branch3]} />
            </View>
            <View style={[styles.mapFooter, { backgroundColor: theme.card }]}>
              <Text style={[styles.mapTitle, { color: theme.text }]}>{m.title}</Text>
              <Text style={[styles.mapChevron, { color: theme.textSecondary }]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.orWrap}>
        <View style={[styles.orLine, { backgroundColor: theme.cardBorder }]} />
        <Text style={[styles.orText, { color: theme.textSecondary }]}>veya</Text>
        <View style={[styles.orLine, { backgroundColor: theme.cardBorder }]} />
      </View>

      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: theme.text }]}
        onPress={() => Alert.alert('Yakında', 'Zihin haritası oluşturma özelliği yakında eklenecek.')}
      >
        <Text style={styles.createIcon}>🎓</Text>
        <Text style={styles.createText}>Yeni Zihin Haritası Oluştur</Text>
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
  intro: { alignItems: 'center', marginBottom: 32 },
  brainIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brainEmoji: { fontSize: 32 },
  introText: { fontSize: 15, textAlign: 'center', lineHeight: 24, paddingHorizontal: 24 },
  mapRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  mapCard: {
    width: MAP_CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  mapPreview: {
    height: 160,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  mapNode: {
    position: 'absolute',
    top: 60,
    left: MAP_CARD_WIDTH / 2 - 40,
    width: 80,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  mapBranch: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#94a3b8',
    height: 40,
  },
  branch1: { top: 80, left: MAP_CARD_WIDTH / 2 - 1, transform: [{ rotate: '-30deg' }] },
  branch2: { top: 80, left: MAP_CARD_WIDTH / 2 - 1 },
  branch3: { top: 80, left: MAP_CARD_WIDTH / 2 - 1, transform: [{ rotate: '30deg' }] },
  mapFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  mapTitle: { fontSize: 16, fontWeight: 'bold' },
  mapChevron: { fontSize: 20 },
  orWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 14 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 28,
    gap: 10,
  },
  createIcon: { fontSize: 20 },
  createText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
