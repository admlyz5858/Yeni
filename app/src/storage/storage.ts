import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, defaultState } from './types';

const STORAGE_KEY = '@kpss_planner_state_v1';

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as AppState;
    return {
      settings: { ...defaultState.settings, ...parsed.settings },
      progress: parsed.progress ?? {},
      sessions: parsed.sessions ?? [],
    };
  } catch (e) {
    return defaultState;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // non-fatal
  }
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
