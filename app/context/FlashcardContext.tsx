import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import * as backend from '../lib/backend';

const FLASHCARD_KEY = '@study_flashcards';

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
  addCard: (subjectId: string, topic: string, front: string, back: string) => void | Promise<void>;
  updateCard: (id: string, quality: number) => void;
  deleteCard: (id: string) => void;
  getDueCards: () => Flashcard[];
  getCardsByTopic: (subjectId: string, topic: string) => Flashcard[];
  cardsCount: number;
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

function toCard(r: Record<string, unknown>): Flashcard {
  return {
    id: String(r.id),
    subjectId: String(r.subjectId ?? r.subject_id),
    topic: String(r.topic),
    front: String(r.front),
    back: String(r.back),
    nextReview: String(r.nextReview ?? r.next_review),
    interval: Number(r.interval ?? 0),
    easeFactor: Number(r.easeFactor ?? r.ease_factor ?? 2.5),
    repetitions: Number(r.repetitions ?? 0),
  };
}

export function FlashcardProvider({ children }: { children: React.ReactNode }) {
  const { user, hasBackend } = useAuth();
  const useSupabase = !!(user && user.id !== 'demo' && hasBackend);
  const userId = useSupabase ? user!.id : null;

  const [cards, setCardsState] = useState<Flashcard[]>([]);

  useEffect(() => {
    if (useSupabase && userId) {
      backend.fetchFlashcards(userId).then((data) => {
        setCardsState((data || []).map(toCard));
      });
    } else {
      AsyncStorage.getItem(FLASHCARD_KEY).then((raw) => {
        if (raw) setCardsState(JSON.parse(raw));
      });
    }
  }, [useSupabase, userId]);

  const addCard = (subjectId: string, topic: string, front: string, back: string) => {
    const nextReview = new Date().toISOString().slice(0, 10);
    const card: Flashcard = {
      id: `local-${Date.now()}`,
      subjectId,
      topic,
      front,
      back,
      nextReview,
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
    };
    if (useSupabase && userId) {
      setCardsState((c) => [...c, card]);
      backend.addFlashcard(userId, {
        subjectId,
        topic,
        front,
        back,
        nextReview,
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
      }).then((newId) => {
        if (newId) setCardsState((c) => c.map((x) => (x.id === card.id ? { ...x, id: newId } : x)));
      });
    } else {
      setCardsState((c) => {
        const next = [...c, { ...card, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` }];
        AsyncStorage.setItem(FLASHCARD_KEY, JSON.stringify(next));
        return next;
      });
    }
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
    if (useSupabase && userId) {
      backend.updateFlashcard(userId, id, {
        nextReview: updated.nextReview,
        interval: updated.interval,
        easeFactor: updated.easeFactor,
        repetitions: updated.repetitions,
      });
    } else {
      AsyncStorage.setItem(FLASHCARD_KEY, JSON.stringify(cards.map((c) => (c.id === id ? updated : c))));
    }
    setCardsState((c) => c.map((x) => (x.id === id ? updated : x)));
  };

  const deleteCard = (id: string) => {
    if (useSupabase && userId) backend.deleteFlashcard(userId, id);
    setCardsState((c) => {
      const next = c.filter((x) => x.id !== id);
      if (!useSupabase) AsyncStorage.setItem(FLASHCARD_KEY, JSON.stringify(next));
      return next;
    });
  };

  const getDueCards = () => {
    const today = new Date().toISOString().slice(0, 10);
    return cards.filter((c) => c.nextReview <= today);
  };

  const getCardsByTopic = (subjectId: string, topic: string) =>
    cards.filter((c) => c.subjectId === subjectId && c.topic === topic);

  return (
    <Context.Provider value={{ cards, addCard, updateCard, deleteCard, getDueCards, getCardsByTopic, cardsCount: cards.length }}>
      {children}
    </Context.Provider>
  );
}

export function useFlashcards() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useFlashcards must be used within FlashcardProvider');
  return ctx;
}
