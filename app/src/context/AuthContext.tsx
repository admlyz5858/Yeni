import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import {
  googleAndroidClientId,
  googleIosClientId,
  googleWebClientId,
  googleEnabled,
} from '../lib/googleConfig';

WebBrowser.maybeCompleteAuthSession();

interface SignUpParams {
  email: string;
  password: string;
  firstName?: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  googleAvailable: boolean;
  appleAvailable: boolean;
  signUpWithEmail: (p: SignUpParams) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithGoogleIdToken: (
    idToken: string,
    nonce?: string,
  ) => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
  continueAsGuest: () => Promise<void>;
  exitGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const GUEST_FLAG_KEY = '@kpss_guest_mode_v1';

const AuthContext = createContext<AuthContextValue | null>(null);

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

function pickGoogleClientId(): string {
  if (Platform.OS === 'ios' && googleIosClientId) return googleIosClientId;
  if (Platform.OS === 'android' && googleAndroidClientId)
    return googleAndroidClientId;
  return googleWebClientId || googleIosClientId || googleAndroidClientId;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      supabase.auth.getSession(),
      AsyncStorage.getItem(GUEST_FLAG_KEY),
    ])
      .then(([sess, guestFlag]) => {
        if (!mounted) return;
        setSession(sess.data.session);
        if (!sess.data.session && guestFlag === '1') setIsGuest(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        setIsGuest(false);
        AsyncStorage.removeItem(GUEST_FLAG_KEY).catch(() => {});
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      setAppleAvailable(false);
      return;
    }
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  const signUpWithEmail = useCallback(
    async ({ email, password, firstName }: SignUpParams) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: firstName ? { first_name: firstName } : undefined,
        },
      });
      if (error) return { error: error.message };
      if (!data.session) return { needsConfirmation: true };
      return {};
    },
    [],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const resetPassword = useCallback(async (email: string) => {
    const redirectTo = Linking.createURL('reset');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        const redirectTo =
          typeof window !== 'undefined' ? window.location.origin : undefined;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        if (error) return { error: error.message };
        return {};
      }

      const clientId = pickGoogleClientId();
      if (!clientId) {
        return {
          error:
            'Google istemci kimliği tanımlı değil. .env dosyasını doldurun.',
        };
      }

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'kpssplanlayici',
        path: 'oauth-callback',
      });

      const nonceBytes = await Crypto.getRandomBytesAsync(16);
      const nonce = Array.from(nonceBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
      );

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: { nonce: hashedNonce },
      });

      const result = await request.promptAsync(googleDiscovery);
      if (result.type !== 'success') {
        return { error: 'Google ile giriş iptal edildi.' };
      }
      const idToken = (result.params as any).id_token as string | undefined;
      if (!idToken) {
        return { error: 'Google id_token alınamadı.' };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
        nonce,
      });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e?.message ?? 'Google ile giriş başarısız.' };
    }
  }, []);

  const signInWithGoogleIdToken = useCallback(
    async (idToken: string, nonce?: string) => {
      try {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
          nonce,
        });
        if (error) return { error: error.message };
        return {};
      } catch (e: any) {
        return { error: e?.message ?? 'Google ile giriş başarısız.' };
      }
    },
    [],
  );

  const signInWithApple = useCallback(async () => {
    try {
      if (Platform.OS !== 'ios') {
        return { error: 'Apple ile giriş sadece iOS cihazlarda kullanılabilir.' };
      }
      const nonceBytes = await Crypto.getRandomBytesAsync(16);
      const nonce = Array.from(nonceBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        return { error: 'Apple identityToken alınamadı.' };
      }

      const { data: authData, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce,
      });
      if (error) return { error: error.message };

      const givenName = credential.fullName?.givenName;
      if (authData?.user && givenName) {
        try {
          await supabase
            .from('profiles')
            .update({ first_name: givenName })
            .eq('id', authData.user.id)
            .is('first_name', null);
        } catch {
          // non-fatal
        }
      }
      return {};
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') {
        return { error: 'Apple ile giriş iptal edildi.' };
      }
      return { error: e?.message ?? 'Apple ile giriş başarısız.' };
    }
  }, []);

  const continueAsGuest = useCallback(async () => {
    await AsyncStorage.setItem(GUEST_FLAG_KEY, '1');
    setIsGuest(true);
  }, []);

  const exitGuest = useCallback(async () => {
    await AsyncStorage.removeItem(GUEST_FLAG_KEY);
    setIsGuest(false);
  }, []);

  const signOut = useCallback(async () => {
    if (session) {
      await supabase.auth.signOut();
    }
    await AsyncStorage.removeItem(GUEST_FLAG_KEY);
    setIsGuest(false);
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isGuest,
      isAuthenticated: Boolean(session) || isGuest,
      googleAvailable: googleEnabled,
      appleAvailable,
      signUpWithEmail,
      signInWithEmail,
      resetPassword,
      signInWithGoogle,
      signInWithGoogleIdToken,
      signInWithApple,
      continueAsGuest,
      exitGuest,
      signOut,
    }),
    [
      session,
      loading,
      isGuest,
      appleAvailable,
      signUpWithEmail,
      signInWithEmail,
      resetPassword,
      signInWithGoogle,
      signInWithGoogleIdToken,
      signInWithApple,
      continueAsGuest,
      exitGuest,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
