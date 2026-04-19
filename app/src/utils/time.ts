const SECOND_IN_MINUTES = 60;

export const minutesToSeconds = (minutes: number): number => {
  return Math.max(0, Math.round(minutes * SECOND_IN_MINUTES));
};

export const formatSeconds = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / SECOND_IN_MINUTES);
  const seconds = safeSeconds % SECOND_IN_MINUTES;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
