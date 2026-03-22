import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FLASHCARD_KEY = '@kpss_flashcards';

export type Flashcard = {
  id: string;
  subjectId: string;
  topic: string;
  front: string;
  back: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
};

type FlashcardContextType = {
  cards: Flashcard[];
  addCard: (subjectId: string, topic: string, front: string, back: string) => void;
  updateCard: (id: string, quality: number) => void;
  deleteCard: (id: string) => void;
  getDueCards: () => Flashcard[];
  getCardsByTopic: (subjectId: string, topic: string) => Flashcard[];
};

const Context = createContext<FlashcardContextType | undefined>(undefined);

function nextReviewDate(interval: number): string {
  const d = new Date();
  d.setDate(d.getDate() + interval);
  return d.toISOString().slice(0, 10);
}

function sm2(interval: number, easeFactor: number, quality: number): { interval: number; ef: number } {
  if (quality < 3) return { interval: 1, ef: easeFactor };
  const ef = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const newEf = Math.max(1.3, ef);
  const newInterval = quality === 3 ? 1 : Math.round(interval * newEf);
  return { interval: Math.min(newInterval, 365), ef: newEf };
}

export function FlashcardProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCardsState] = useState<Flashcard[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(FLASHCARD_KEY).then((raw) => {
      if (raw) setCardsState(JSON.parse(raw));
    });
  }, []);

  const save = (c: Flashcard[]) => {
    setCardsState(c);
    AsyncStorage.setItem(FLASHCARD_KEY, JSON.stringify(c));
  };

  const addCard = (subjectId: string, topic: string, front: string, back: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const card: Flashcard = {
      id,
      subjectId,
      topic,
      front,
      back,
      nextReview: new Date().toISOString().slice(0, 10),
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
    };
    save([...cards, card]);
  };

  const updateCard = (id: string, quality: number) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    const { interval, ef } = sm2(card.interval, card.easeFactor, quality);
    const updated: Flashcard = {
      ...card,
      interval,
      easeFactor: ef,
      repetitions: card.repetitions + 1,
      nextReview: nextReviewDate(interval),
    };
    save(cards.map((c) => (c.id === id ? updated : c)));
  };

  const deleteCard = (id: string) => save(cards.filter((c) => c.id !== id));

  const getDueCards = () => {
    const today = new Date().toISOString().slice(0, 10);
    return cards.filter((c) => c.nextReview <= today);
  };

  const getCardsByTopic = (subjectId: string, topic: string) =>
    cards.filter((c) => c.subjectId === subjectId && c.topic === topic);

  return (
    <Context.Provider value={{ cards, addCard, updateCard, deleteCard, getDueCards, getCardsByTopic }}>
      {children}
    </Context.Provider>
  );
}

export function useFlashcards() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useFlashcards must be used within FlashcardProvider');
  return ctx;
}
