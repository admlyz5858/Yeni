import Constants from 'expo-constants';

const extra =
  (Constants.expoConfig?.extra as Record<string, string> | undefined) ?? {};

export const googleIosClientId =
  extra.googleIosClientId ?? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
export const googleAndroidClientId =
  extra.googleAndroidClientId ??
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ??
  '';
export const googleWebClientId =
  extra.googleWebClientId ?? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export const googleEnabled = Boolean(
  googleIosClientId || googleAndroidClientId || googleWebClientId,
);
