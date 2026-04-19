import { useEffect, useMemo, useState } from 'react';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

const WORK_SECONDS = 25 * 60;
const SHORT_BREAK_SECONDS = 5 * 60;
const LONG_BREAK_SECONDS = 15 * 60;
const CYCLES_UNTIL_LONG_BREAK = 4;

const SESSION_DURATIONS: Record<SessionType, number> = {
  work: WORK_SECONDS,
  shortBreak: SHORT_BREAK_SECONDS,
  longBreak: LONG_BREAK_SECONDS,
};

const SESSION_LABELS: Record<SessionType, string> = {
  work: 'Odaklanma',
  shortBreak: 'Kisa Mola',
  longBreak: 'Uzun Mola',
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function App() {
  const [session, setSession] = useState<SessionType>('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) {
          return current - 1;
        }

        setSession((currentSession) => {
          if (currentSession === 'work') {
            let updatedCount = 0;

            setCompletedPomodoros((previousCount) => {
              updatedCount = previousCount + 1;
              return updatedCount;
            });

            const shouldTakeLongBreak =
              updatedCount % CYCLES_UNTIL_LONG_BREAK === 0;
            return shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
          }

          return 'work';
        });

        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft !== 0) {
      return;
    }

    setSecondsLeft(SESSION_DURATIONS[session]);
    setIsRunning(false);
  }, [secondsLeft, session]);

  const progress = useMemo(() => {
    const totalDuration = SESSION_DURATIONS[session];
    return ((totalDuration - secondsLeft) / totalDuration) * 100;
  }, [secondsLeft, session]);

  const switchSession = (nextSession: SessionType) => {
    setSession(nextSession);
    setSecondsLeft(SESSION_DURATIONS[nextSession]);
    setIsRunning(false);
  };

  const resetCurrentSession = () => {
    setSecondsLeft(SESSION_DURATIONS[session]);
    setIsRunning(false);
  };

  return (
    <main className="page">
      <section className="pomodoro-card">
        <h1>Pomodoro Sayaci</h1>
        <p className="session-label">{SESSION_LABELS[session]}</p>

        <div className="timer">{formatTime(secondsLeft)}</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="controls">
          <button onClick={() => setIsRunning((running) => !running)} type="button">
            {isRunning ? 'Durdur' : 'Baslat'}
          </button>
          <button className="secondary" onClick={resetCurrentSession} type="button">
            Sifirla
          </button>
        </div>

        <div className="session-switcher">
          <button
            className={session === 'work' ? 'active' : ''}
            onClick={() => switchSession('work')}
            type="button"
          >
            Odak
          </button>
          <button
            className={session === 'shortBreak' ? 'active' : ''}
            onClick={() => switchSession('shortBreak')}
            type="button"
          >
            Kisa Mola
          </button>
          <button
            className={session === 'longBreak' ? 'active' : ''}
            onClick={() => switchSession('longBreak')}
            type="button"
          >
            Uzun Mola
          </button>
        </div>

        <p className="pomodoro-count">
          Tamamlanan pomodoro: <strong>{completedPomodoros}</strong>
        </p>
      </section>
    </main>
  );
}
