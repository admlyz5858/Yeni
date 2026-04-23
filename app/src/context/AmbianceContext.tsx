import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { Audio, AVPlaybackSource, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Ambiance,
  ambiances,
  getAmbianceById,
  getAudioUrls,
} from '../data/ambiances';

interface AmbianceState {
  ambiance: Ambiance;
  volume: number;
  muted: boolean;
  playing: boolean;
  loading: boolean;
}

interface AmbianceContextValue extends AmbianceState {
  setAmbianceById: (id: string) => Promise<void>;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  play: () => Promise<void>;
  stop: () => Promise<void>;
}

const STORAGE_KEY = '@kpss_ambiance_v1';
const DEFAULT_AMBIANCE_ID = 'forest-sunlight';

const AmbianceContext = createContext<AmbianceContextValue | null>(null);

interface PersistedState {
  ambianceId: string;
  volume: number;
  muted: boolean;
}

export const AmbianceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const defaultAmbiance =
    getAmbianceById(DEFAULT_AMBIANCE_ID) ?? ambiances[0];
  const [ambiance, setAmbiance] = useState<Ambiance>(defaultAmbiance);
  const [volume, setVolumeState] = useState(defaultAmbiance.defaultVolume);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const soundsRef = useRef<Audio.Sound[]>([]);
  const hydratedRef = useRef(false);
  const activeIdRef = useRef<string>(ambiance.id);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) {
          try {
            const data = JSON.parse(raw) as PersistedState;
            const picked = getAmbianceById(data.ambianceId) ?? defaultAmbiance;
            setAmbiance(picked);
            activeIdRef.current = picked.id;
            setVolumeState(
              typeof data.volume === 'number' ? data.volume : picked.defaultVolume,
            );
            setMuted(Boolean(data.muted));
          } catch {}
        }
      })
      .finally(() => {
        hydratedRef.current = true;
      });
    return () => {
      mounted = false;
    };
  }, [defaultAmbiance]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const data: PersistedState = {
      ambianceId: ambiance.id,
      volume,
      muted,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [ambiance.id, volume, muted]);

  useEffect(() => {
    return () => {
      soundsRef.current.forEach((s) => {
        s.unloadAsync().catch(() => {});
      });
      soundsRef.current = [];
    };
  }, []);

  const unloadAll = useCallback(async () => {
    const list = soundsRef.current;
    soundsRef.current = [];
    await Promise.all(
      list.map((s) =>
        s
          .stopAsync()
          .catch(() => {})
          .then(() => s.unloadAsync())
          .catch(() => {}),
      ),
    );
  }, []);

  const applyVolume = useCallback(
    async (v: number, isMuted: boolean) => {
      const effective = isMuted ? 0 : v;
      await Promise.all(
        soundsRef.current.map((s) =>
          s.setVolumeAsync(effective).catch(() => {}),
        ),
      );
    },
    [],
  );

  const play = useCallback(async () => {
    if (ambiance.id === 'silent') {
      setPlaying(true);
      return;
    }
    const token = activeIdRef.current;
    if (Platform.OS === 'web') {
      setPlaying(true);
      return;
    }
    const urls = getAudioUrls(ambiance);
    if (urls.length === 0) {
      setPlaying(true);
      return;
    }
    setLoading(true);
    await unloadAll();
    try {
      const loaded: Audio.Sound[] = [];
      for (const url of urls) {
        if (token !== activeIdRef.current) break;
        const source: AVPlaybackSource = { uri: url };
        const { sound } = await Audio.Sound.createAsync(
          source,
          {
            shouldPlay: true,
            isLooping: true,
            volume: muted ? 0 : volume,
          },
        );
        loaded.push(sound);
      }
      if (token !== activeIdRef.current) {
        await Promise.all(loaded.map((s) => s.unloadAsync().catch(() => {})));
        return;
      }
      soundsRef.current = loaded;
      setPlaying(true);
    } catch (e) {
      console.warn('[ambiance] play failed', (e as any)?.message ?? e);
    } finally {
      setLoading(false);
    }
  }, [ambiance, muted, volume, unloadAll]);

  const stop = useCallback(async () => {
    await unloadAll();
    setPlaying(false);
  }, [unloadAll]);

  const setAmbianceById = useCallback(
    async (id: string) => {
      const next = getAmbianceById(id);
      if (!next) return;
      if (next.id === activeIdRef.current) return;
      activeIdRef.current = next.id;
      setAmbiance(next);
      setVolumeState((prev) => {
        if (muted) return prev;
        return prev;
      });
      await unloadAll();
      if (playing) {
        const token = next.id;
        setLoading(true);
        try {
          const urls = getAudioUrls(next);
          if (urls.length === 0 || Platform.OS === 'web') {
            return;
          }
          const loaded: Audio.Sound[] = [];
          for (const url of urls) {
            if (token !== activeIdRef.current) break;
            const { sound } = await Audio.Sound.createAsync(
              { uri: url },
              {
                shouldPlay: true,
                isLooping: true,
                volume: muted ? 0 : volume,
              },
            );
            loaded.push(sound);
          }
          if (token !== activeIdRef.current) {
            await Promise.all(loaded.map((s) => s.unloadAsync().catch(() => {})));
            return;
          }
          soundsRef.current = loaded;
        } catch (e) {
          console.warn('[ambiance] switch failed', (e as any)?.message ?? e);
        } finally {
          setLoading(false);
        }
      }
    },
    [muted, playing, volume, unloadAll],
  );

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(1, v));
      setVolumeState(clamped);
      applyVolume(clamped, muted);
    },
    [muted, applyVolume],
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      applyVolume(volume, next);
      return next;
    });
  }, [volume, applyVolume]);

  const value = useMemo<AmbianceContextValue>(
    () => ({
      ambiance,
      volume,
      muted,
      playing,
      loading,
      setAmbianceById,
      setVolume,
      toggleMute,
      play,
      stop,
    }),
    [
      ambiance,
      volume,
      muted,
      playing,
      loading,
      setAmbianceById,
      setVolume,
      toggleMute,
      play,
      stop,
    ],
  );

  return (
    <AmbianceContext.Provider value={value}>{children}</AmbianceContext.Provider>
  );
};

export function useAmbiance(): AmbianceContextValue {
  const ctx = useContext(AmbianceContext);
  if (!ctx) throw new Error('useAmbiance must be used inside AmbianceProvider');
  return ctx;
}
