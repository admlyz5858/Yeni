import { Platform } from 'react-native';

let ambientStopper: (() => void) | null = null;

const getAudioContextCtor = (): any => {
  const audioGlobal = globalThis as any;
  return audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext ?? null;
};

const createEnvelope = (gainNode: any, volume: number, attack = 0.05, release = 0.35): void => {
  const now = gainNode.context.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + release);
};

export const playWebChime = async (frequencies: number[]): Promise<void> => {
  if (Platform.OS !== 'web') {
    return;
  }

  const AudioContextCtor = getAudioContextCtor();
  if (!AudioContextCtor) {
    return;
  }

  const context = new AudioContextCtor();
  await context.resume();

  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime + index * 0.09;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    oscillator.start(now);
    oscillator.stop(now + 0.36);
  });

  const closeAt = (frequencies.length + 1) * 180;
  setTimeout(() => {
    context.close().catch(() => undefined);
  }, closeAt);
};

export const startAmbientPad = async (): Promise<boolean> => {
  if (Platform.OS !== 'web') {
    return false;
  }

  if (ambientStopper) {
    return true;
  }

  const AudioContextCtor = getAudioContextCtor();
  if (!AudioContextCtor) {
    return false;
  }

  const context = new AudioContextCtor();
  await context.resume();

  const masterGain = context.createGain();
  masterGain.gain.value = 0.02;
  masterGain.connect(context.destination);

  const lowPass = context.createBiquadFilter();
  lowPass.type = 'lowpass';
  lowPass.frequency.value = 620;
  lowPass.connect(masterGain);

  const frequencies = [196, 246.94, 293.66];
  const oscillators = frequencies.map((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = index % 2 === 0 ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency;
    oscillator.detune.value = (index - 1) * 7;
    oscillator.connect(lowPass);
    oscillator.start();
    return oscillator;
  });

  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.01;
  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  lfo.start();

  ambientStopper = () => {
    oscillators.forEach((oscillator) => oscillator.stop());
    lfo.stop();
    masterGain.disconnect();
    lowPass.disconnect();
    context.close().catch(() => undefined);
    ambientStopper = null;
  };

  return true;
};

export const stopAmbientPad = (): void => {
  ambientStopper?.();
};

export const playActionBeep = async (): Promise<void> => {
  await playWebChime([523.25, 659.25]);
};

export const playCompletionChime = async (): Promise<void> => {
  await playWebChime([392.0, 523.25, 659.25, 783.99]);
};

export const playSoftResetBeep = async (): Promise<void> => {
  await playWebChime([440, 330]);
};
