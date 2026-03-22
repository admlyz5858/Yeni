import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { QUESTIONS, CATEGORIES } from '../data/questions';

type Props = {
  route: { params: { categoryId: string } };
  navigation: any;
};

export default function QuizScreen({ route, navigation }: Props) {
  const { categoryId } = route.params;
  const questions = useMemo(
    () => QUESTIONS[categoryId] || [],
    [categoryId]
  );
  const category = CATEGORIES.find((c) => c.id === categoryId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setAnswers([...answers, index]);

    setTimeout(() => {
      if (isLastQuestion) {
        navigation.navigate('Result', {
          categoryId,
          answers: [...answers, index],
          questions,
        });
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
      }
    }, 600);
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      navigation.goBack();
    } else {
      setCurrentIndex((i) => i - 1);
      setAnswers(answers.slice(0, -1));
      setSelectedOption(null);
    }
  };

  if (!question) {
    return (
      <View style={styles.center}>
        <Text>Bu kategoride henüz soru yok.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getOptionStyle = (index: number) => {
    if (selectedOption === null) return styles.option;
    const isCorrect = index === question.correctIndex;
    const isSelected = index === selectedOption;
    if (isSelected && isCorrect) return [styles.option, styles.optionCorrect];
    if (isSelected && !isCorrect) return [styles.option, styles.optionWrong];
    if (selectedOption !== null && isCorrect) return [styles.option, styles.optionCorrect];
    return [styles.option, styles.optionDisabled];
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionNumber}>Soru {currentIndex + 1}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      <View style={styles.options}>
        {question.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={getOptionStyle(i)}
            onPress={() => handleSelect(i)}
            disabled={selectedOption !== null}
          >
            <Text style={styles.optionLetter}>
              {String.fromCharCode(65 + i)})
            </Text>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  progress: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  questionNumber: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#1e293b',
  },
  options: { gap: 12 },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  optionDisabled: { opacity: 0.6 },
  optionCorrect: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  optionWrong: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  optionLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginRight: 12,
  },
  optionText: { flex: 1, fontSize: 16, color: '#1e293b' },
});
