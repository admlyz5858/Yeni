import { useEffect } from 'react';

import { usePomodoroStore } from '../store/usePomodoroStore';

export const usePomodoroTicker = (): void => {
  const isRunning = usePomodoroStore((state) => state.isRunning);
  const tick = usePomodoroStore((state) => state.tick);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, tick]);
};
