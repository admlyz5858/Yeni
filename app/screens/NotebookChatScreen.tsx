import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as notebookApi from '../lib/notebookApi';

type Props = { navigation: any };

export default function NotebookChatScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user, getSessionToken } = useAuth();
  const [noteContent, setNoteContent] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [asking, setAsking] = useState(false);

  const isDemo = user?.id === 'demo';
  const hasApi = notebookApi.hasNotebookApi();

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    if (isDemo) {
      Alert.alert('Demo', 'Gerçek hesap ile giriş yaparak not ekleyebilirsiniz.');
      return;
    }
    if (!hasApi) {
      Alert.alert('Yapılandırma', 'Notebook API yapılandırılmamış.');
      return;
    }
    setAddingNote(true);
    const token = await getSessionToken();
    if (!token) {
      Alert.alert('Oturum', 'Lütfen tekrar giriş yapın.');
      setAddingNote(false);
      return;
    }
    const result = await notebookApi.addNote(token, noteContent.trim());
    setAddingNote(false);
    if (result.ok) {
      setNoteContent('');
      Alert.alert('Başarılı', 'Not eklendi.');
    } else {
      Alert.alert('Hata', result.error || 'Not eklenemedi.');
    }
  };

  const handleAskAI = async () => {
    if (!question.trim()) return;
    if (isDemo) {
      Alert.alert('Demo', 'Gerçek hesap ile giriş yaparak soru sorabilirsiniz.');
      return;
    }
    if (!hasApi) {
      Alert.alert('Yapılandırma', 'Notebook API yapılandırılmamış.');
      return;
    }
    setAsking(true);
    setAnswer('');
    const token = await getSessionToken();
    if (!token) {
      Alert.alert('Oturum', 'Lütfen tekrar giriş yapın.');
      setAsking(false);
      return;
    }
    const result = await notebookApi.askAI(token, question.trim());
    setAsking(false);
    if (result.ok && result.answer) {
      setAnswer(result.answer);
    } else {
      Alert.alert('Hata', result.error || 'Yanıt alınamadı.');
    }
  };

  if (!hasApi) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: theme.accent }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Bilge Not Defteri</Text>
        </View>
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
            Notebook API yapılandırılmamış. EXPO_PUBLIC_NOTEBOOK_API_URL ekleyin.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Bilge Not Defteri</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📝 Not Ekle</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bg, color: theme.text }]}
            placeholder="Notunu buraya yaz..."
            placeholderTextColor={theme.textSecondary}
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
            numberOfLines={4}
            editable={!isDemo}
          />
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.accent }]}
            onPress={handleAddNote}
            disabled={addingNote || isDemo}
          >
            {addingNote ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Ekle</Text>}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🦉 Bilge Baykuş'a Sor</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bg, color: theme.text }]}
            placeholder="Notlarına dayalı bir soru sor..."
            placeholderTextColor={theme.textSecondary}
            value={question}
            onChangeText={setQuestion}
            multiline
            editable={!isDemo}
          />
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.accent }]}
            onPress={handleAskAI}
            disabled={asking || isDemo}
          >
            {asking ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sor</Text>}
          </TouchableOpacity>
          {answer ? (
            <View style={[styles.answerBox, { backgroundColor: theme.bg }]}>
              <Text style={[styles.answerLabel, { color: theme.textSecondary }]}>Yanıt:</Text>
              <Text style={[styles.answerText, { color: theme.text }]}>{answer}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { padding: 8 },
  backText: { fontSize: 24 },
  title: { flex: 1, fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  placeholderText: { fontSize: 16, textAlign: 'center' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  btn: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  answerBox: { marginTop: 16, padding: 16, borderRadius: 12 },
  answerLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  answerText: { fontSize: 15, lineHeight: 24 },
});
