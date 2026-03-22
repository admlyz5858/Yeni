import { Audio } from 'expo-av';

let currentSound: Audio.Sound | null = null;
let audioModeSet = false;

export type AmbientOption = {
  id: string;
  label: string;
  icon: string;
  uri: string;
};

export const AMBIENT_OPTIONS: AmbientOption[] = [
  {
    id: 'rain',
    label: 'Yağmur',
    icon: '🌧️',
    uri: 'https://www.soundjay.com/misc/sounds/rain-01.mp3',
  },
  {
    id: 'forest',
    label: 'Orman',
    icon: '🌲',
    uri: 'https://www.soundjay.com/nature/sounds/birds-1.mp3',
  },
  {
    id: 'cafe',
    label: 'Kafe',
    icon: '☕',
    uri: 'https://www.soundjay.com/ambient/sounds/cafe-1.mp3',
  },
  {
    id: 'ocean',
    label: 'Okyanus',
    icon: '🌊',
    uri: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3',
  },
  {
    id: 'fireplace',
    label: 'Şömine',
    icon: '🔥',
    uri: 'https://www.soundjay.com/misc/sounds/fire-1.mp3',
  },
];

async function ensureAudioMode() {
  if (audioModeSet) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  audioModeSet = true;
}

export async function playAmbient(uri: string, volume = 0.4): Promise<boolean> {
  try {
    await stopAmbient();
    await ensureAudioMode();
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, isLooping: true, volume }
    );
    currentSound = sound;
    return true;
  } catch (e) {
    console.warn('Ambient load failed:', e);
    return false;
  }
}

export async function stopAmbient(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {}
    currentSound = null;
  }
}

export async function setAmbientVolume(volume: number): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.setVolumeAsync(volume);
    } catch {}
  }
}

export function isAmbientPlaying(): boolean {
  return currentSound !== null;
}
