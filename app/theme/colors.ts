const baseFields = {
  success: '#059669',
  successLight: '#ecfdf5',
  danger: '#dc2626',
  warning: '#d97706',
  inputBg: '#ffffff',
  inputBorder: '#e2e8f0',
} as const;

export const light = {
  ...baseFields,
  bg: '#f0f4f8',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#64748b',
  accent: '#2563eb',
  accentLight: '#eff6ff',
  countdownBg: '#0f172a',
  countdownText: '#ffffff',
};

export const dark = {
  ...baseFields,
  bg: '#0f172a',
  card: '#1e293b',
  cardBorder: '#334155',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  accent: '#3b82f6',
  accentLight: '#1e3a5f',
  countdownBg: '#1e293b',
  countdownText: '#f8fafc',
  inputBg: '#334155',
  inputBorder: '#475569',
};

export const ocean = {
  ...baseFields,
  bg: '#e0f2fe',
  card: '#f0f9ff',
  cardBorder: '#bae6fd',
  text: '#0c4a6e',
  textSecondary: '#0369a1',
  accent: '#0284c7',
  accentLight: '#e0f2fe',
  countdownBg: '#0c4a6e',
  countdownText: '#f0f9ff',
};

export const forest = {
  ...baseFields,
  bg: '#ecfdf5',
  card: '#f0fdf4',
  cardBorder: '#bbf7d0',
  text: '#14532d',
  textSecondary: '#15803d',
  accent: '#16a34a',
  accentLight: '#dcfce7',
  countdownBg: '#14532d',
  countdownText: '#f0fdf4',
};

export const sunset = {
  ...baseFields,
  bg: '#fff7ed',
  card: '#fffbeb',
  cardBorder: '#fed7aa',
  text: '#7c2d12',
  textSecondary: '#c2410c',
  accent: '#ea580c',
  accentLight: '#ffedd5',
  countdownBg: '#7c2d12',
  countdownText: '#fffbeb',
};

export const night = {
  ...baseFields,
  bg: '#1e1b4b',
  card: '#312e81',
  cardBorder: '#4c1d95',
  text: '#e9d5ff',
  textSecondary: '#c4b5fd',
  accent: '#a78bfa',
  accentLight: '#5b21b6',
  countdownBg: '#312e81',
  countdownText: '#f5f3ff',
  inputBg: '#4c1d95',
  inputBorder: '#6d28d9',
};

export type Theme = typeof light;
