import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  return {
    ...base,
    scheme: 'kpssplanlayici',
    ios: {
      ...(base.ios ?? {}),
      bundleIdentifier: 'com.yeniuygulama.app',
      supportsTablet: true,
      usesAppleSignIn: true,
    },
    android: {
      ...(base.android ?? {}),
      package: 'com.yeniuygulama.app',
    },
    plugins: [
      ...((base.plugins as any[]) ?? []),
      'expo-apple-authentication',
      'expo-web-browser',
      '@react-native-community/datetimepicker',
      [
        'expo-image-picker',
        {
          photosPermission:
            'Profil fotoğrafı yüklemek için fotoğraflarına erişim gerekiyor.',
          cameraPermission:
            'Profil fotoğrafı çekmek için kameraya erişim gerekiyor.',
        },
      ],
    ],
    extra: {
      ...(base.extra ?? {}),
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL ??
        'https://xxmlumvbvmcbrklqzsma.supabase.co',
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
        'sb_publishable_D3X3saA0u0WitqjsHg8oCw_F060R7tX',
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
      googleAndroidClientId:
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    },
  };
};
