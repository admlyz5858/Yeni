import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_KEY = '@kpss_premium';

export type PremiumFeature =
  | 'unlimited_flashcards'
  | 'advanced_analytics'
  | 'custom_themes'
  | 'export_data'
  | 'streak_freeze'
  | 'priority_timer'
  | 'study_music'
  | 'ad_free'
  | 'cloud_sync'
  | 'all';

const PREMIUM_FEATURES: { id: PremiumFeature; name: string; icon: string; desc: string }[] = [
  { id: 'unlimited_flashcards', name: 'Sınırsız Kart', icon: '📇', desc: 'Sınırsız flashcard oluştur' },
  { id: 'advanced_analytics', name: 'Gelişmiş Analitik', icon: '📊', desc: 'Detaylı grafikler ve raporlar' },
  { id: 'custom_themes', name: 'Özel Temalar', icon: '🎨', desc: 'Premium tema seçenekleri' },
  { id: 'export_data', name: 'Veri Dışa Aktar', icon: '📤', desc: 'İlerleme raporu PDF/Excel' },
  { id: 'streak_freeze', name: 'Seri Dondurma', icon: '❄️', desc: 'Ayda 2 kez seriyi koru' },
  { id: 'priority_timer', name: 'Özel Zamanlayıcılar', icon: '⏱️', desc: '90/20, özel süreler' },
  { id: 'study_music', name: 'Odak Müziği', icon: '🎵', desc: 'Çalışma sesleri ve müzik' },
  { id: 'ad_free', name: 'Reklamsız', icon: '✨', desc: 'Tamamen reklamsız deneyim' },
  { id: 'cloud_sync', name: 'Bulut Senkron', icon: '☁️', desc: 'Cihazlar arası senkron' },
];

type PremiumContextType = {
  isPremium: boolean;
  setPremium: (v: boolean) => void;
  unlockWithXp: (xp: number) => boolean;
  features: typeof PREMIUM_FEATURES;
  hasFeature: (f: PremiumFeature) => boolean;
  streakFreezeUsed: number;
  useStreakFreeze: () => boolean;
};

const XP_TO_UNLOCK_PREMIUM = 5000;

const Context = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremiumState] = useState(false);
  const [streakFreezeUsed, setStreakFreezeUsed] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(PREMIUM_KEY).then((raw) => {
      if (raw) {
        const d = JSON.parse(raw);
        setIsPremiumState(d.isPremium || false);
        setStreakFreezeUsed(d.streakFreezeUsed || 0);
      }
    });
  }, []);

  const persist = (premium: boolean, freeze: number) => {
    AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify({ isPremium: premium, streakFreezeUsed: freeze }));
  };

  const setPremium = (v: boolean) => {
    setIsPremiumState(v);
    persist(v, streakFreezeUsed);
  };

  const unlockWithXp = (userXp: number): boolean => {
    if (userXp >= XP_TO_UNLOCK_PREMIUM && !isPremium) {
      setPremium(true);
      return true;
    }
    return false;
  };

  const hasFeature = (f: PremiumFeature) => isPremium || f === 'all';

  const useStreakFreeze = (): boolean => {
    if (!isPremium || streakFreezeUsed >= 2) return false;
    setStreakFreezeUsed((prev) => {
      const next = prev + 1;
      persist(isPremium, next);
      return next;
    });
    return true;
  };

  return (
    <Context.Provider
      value={{
        isPremium,
        setPremium,
        unlockWithXp,
        features: PREMIUM_FEATURES,
        hasFeature,
        streakFreezeUsed,
        useStreakFreeze,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
