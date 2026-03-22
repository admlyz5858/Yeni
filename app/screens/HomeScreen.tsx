import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const CATEGORIES = [
  { id: 'turkce', name: 'Türkçe', icon: '📝', color: '#2563eb' },
  { id: 'matematik', name: 'Matematik', icon: '🔢', color: '#059669' },
  { id: 'tarih', name: 'Tarih', icon: '📜', color: '#dc2626' },
  { id: 'cografya', name: 'Coğrafya', icon: '🌍', color: '#7c3aed' },
  { id: 'vatandaslik', name: 'Vatandaşlık', icon: '⚖️', color: '#d97706' },
  { id: 'guncel', name: 'Güncel Konular', icon: '📰', color: '#0891b2' },
];

type Props = {
  navigation: any;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>KPSS Çalışma</Text>
        <Text style={styles.subtitle}>
          Konu seçin ve test çözerek kendinizi deneyin
        </Text>
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, { borderLeftColor: cat.color }]}
            onPress={() =>
              navigation.navigate('Quiz', { categoryId: cat.id })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>{cat.icon}</Text>
            <Text style={styles.cardTitle}>{cat.name}</Text>
            <Text style={styles.cardSubtext}>Teste Başla →</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});
