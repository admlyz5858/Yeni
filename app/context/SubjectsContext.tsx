import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBJECTS_KEY = '@study_subjects';

const DEFAULT_SUBJECTS = [
  { id: '1', name: 'Matematik', icon: '🔢', color: '#059669', topics: ['Temel Kavramlar', 'Denklemler', 'Geometri'] },
  { id: '2', name: 'Türkçe', icon: '📝', color: '#2563eb', topics: ['Dil Bilgisi', 'Yazım Kuralları', 'Anlatım'] },
  { id: '3', name: 'Fen', icon: '🔬', color: '#dc2626', topics: ['Fizik', 'Kimya', 'Biyoloji'] },
];

export type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: string[];
};

type SubjectsContextType = {
  subjects: Subject[];
  addSubject: (name: string, icon?: string, color?: string) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopic: (subjectId: string, topic: string) => void;
  removeTopic: (subjectId: string, topic: string) => void;
  reorderTopics: (subjectId: string, topics: string[]) => void;
};

const COLORS = ['#2563eb', '#059669', '#dc2626', '#7c3aed', '#d97706', '#0891b2', '#ec4899', '#14b8a6'];
const ICONS = ['📚', '📝', '🔢', '🔬', '🌍', '📜', '⚖️', '📰', '💻', '🎯'];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const Context = createContext<SubjectsContextType | undefined>(undefined);

export function SubjectsProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjectsState] = useState<Subject[]>(DEFAULT_SUBJECTS);

  useEffect(() => {
    AsyncStorage.getItem(SUBJECTS_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) setSubjectsState(parsed);
        } catch {}
      }
    });
  }, []);

  const save = (s: Subject[]) => {
    setSubjectsState(s);
    AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(s));
  };

  const addSubject = (name: string, icon = '📚', color = COLORS[subjects.length % COLORS.length]) => {
    save([...subjects, { id: generateId(), name, icon, color, topics: [] }]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    save(subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSubject = (id: string) => save(subjects.filter((s) => s.id !== id));

  const addTopic = (subjectId: string, topic: string) => {
    save(
      subjects.map((s) =>
        s.id === subjectId ? { ...s, topics: [...s.topics, topic] } : s
      )
    );
  };

  const removeTopic = (subjectId: string, topic: string) => {
    save(
      subjects.map((s) =>
        s.id === subjectId ? { ...s, topics: s.topics.filter((t) => t !== topic) } : s
      )
    );
  };

  const reorderTopics = (subjectId: string, topics: string[]) => {
    save(
      subjects.map((s) => (s.id === subjectId ? { ...s, topics } : s))
    );
  };

  return (
    <Context.Provider
      value={{
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        removeTopic,
        reorderTopics,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useSubjects() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useSubjects must be used within SubjectsProvider');
  return ctx;
}

export { COLORS, ICONS };
