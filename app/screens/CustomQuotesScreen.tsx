import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

type Props = { navigation: any };

export default function CustomQuotesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { customQuotes, addCustomQuote, removeCustomQuote } = useSettings();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    addCustomQuote(input);
    setInput('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Özel Sözler</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Motivasyon sözlerinizi ekleyin. Pomodoro ve günlük ekranlarda gösterilir.
        </Text>
      </View>

      <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]}
          placeholder="Yeni söz ekleyin..."
          placeholderTextColor={theme.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.accent }]}
          onPress={handleAdd}
          disabled={!input.trim()}
        >
          <Text style={styles.addBtnText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {customQuotes.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            Henüz özel söz eklemediniz.
          </Text>
        ) : (
          customQuotes.map((q, i) => (
            <View
              key={i}
              style={[styles.quoteItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            >
              <Text style={[styles.quoteText, { color: theme.text }]} numberOfLines={2}>
                "{q}"
              </Text>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeCustomQuote(i)}
              >
                <Text style={[styles.removeText, { color: theme.danger }]}>Sil</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 16 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  sub: { fontSize: 14, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
    maxHeight: 80,
  },
  addBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  list: { flex: 1 },
  listContent: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  empty: { fontSize: 15, textAlign: 'center', marginTop: 24 },
  quoteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  quoteText: { flex: 1, fontSize: 15 },
  removeBtn: { padding: 8 },
  removeText: { fontSize: 14, fontWeight: '600' },
});
