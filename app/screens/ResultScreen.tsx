import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CATEGORIES } from '../data/questions';
import type { Question } from '../data/questions';

type Props = {
  route: {
    params: {
      categoryId: string;
      answers: number[];
      questions: Question[];
    };
  };
  navigation: any;
};

export default function ResultScreen({ route, navigation }: Props) {
  const { categoryId, answers, questions } = route.params;
  const category = CATEGORIES.find((c) => c.id === categoryId);

  const correct = answers.filter((a, i) => a === questions[i].correctIndex).length;
  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const getScoreColor = () => {
    if (percentage >= 80) return '#059669';
    if (percentage >= 60) return '#d97706';
    return '#dc2626';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Puanınız</Text>
        <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
          {correct} / {total}
        </Text>
        <Text style={[styles.percentage, { color: getScoreColor() }]}>
          %{percentage}
        </Text>
      </View>

      <View style={styles.summary}>
        {questions.map((q, i) => {
          const userAnswer = answers[i];
          const isCorrect = userAnswer === q.correctIndex;
          return (
            <View key={q.id} style={styles.summaryItem}>
              <Text style={[styles.summaryIcon, isCorrect ? styles.iconCorrect : styles.iconWrong]}>
                {isCorrect ? '✓' : '✗'}
              </Text>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryQuestion} numberOfLines={2}>
                  {i + 1}. {q.question}
                </Text>
                <Text style={styles.summaryAnswer}>
                  Doğru: {q.options[q.correctIndex]}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.homeBtnText}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.retryBtn}
        onPress={() =>
          navigation.replace('Quiz', { categoryId })
        }
      >
        <Text style={styles.retryBtnText}>Tekrar Çöz</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreLabel: { fontSize: 16, color: '#64748b', marginBottom: 8 },
  scoreValue: { fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
  percentage: { fontSize: 24, fontWeight: '600' },
  summary: { marginBottom: 24, gap: 12 },
  summaryItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
    width: 28,
    textAlign: 'center',
  },
  iconCorrect: { color: '#059669' },
  iconWrong: { color: '#dc2626' },
  summaryContent: { flex: 1 },
  summaryQuestion: { fontSize: 14, color: '#334155', marginBottom: 4 },
  summaryAnswer: { fontSize: 13, color: '#059669', fontWeight: '500' },
  homeBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  homeBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  retryBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  retryBtnText: { color: '#2563eb', fontSize: 17, fontWeight: '600' },
});
