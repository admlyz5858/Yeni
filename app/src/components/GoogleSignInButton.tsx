import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import {
  googleAndroidClientId,
  googleIosClientId,
  googleWebClientId,
} from '../lib/googleConfig';

WebBrowser.maybeCompleteAuthSession();

interface Props {
  disabled?: boolean;
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (msg: string) => void;
}

export const GoogleSignInButton: React.FC<Props> = ({
  disabled,
  onStart,
  onFinish,
  onError,
}) => {
  const { signInWithGoogle, signInWithGoogleIdToken } = useAuth();

  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useIdTokenAuthRequest({
      clientId: googleWebClientId || undefined,
      iosClientId: googleIosClientId || undefined,
      androidClientId: googleAndroidClientId || undefined,
      webClientId: googleWebClientId || undefined,
      scopes: ['openid', 'profile', 'email'],
    });

  useEffect(() => {
    if (!googleResponse) return;
    if (googleResponse.type === 'success') {
      const idToken = (googleResponse.params as any)?.id_token as
        | string
        | undefined;
      const nonce = (googleRequest as any)?.nonce as string | undefined;
      if (!idToken) {
        onError?.('Google id_token alınamadı.');
        onFinish?.();
        return;
      }
      (async () => {
        const { error } = await signInWithGoogleIdToken(idToken, nonce);
        onFinish?.();
        if (error) onError?.(error);
      })();
    } else if (googleResponse.type === 'error') {
      onError?.(
        googleResponse.error?.message ?? 'Google ile giriş başarısız.',
      );
      onFinish?.();
    } else if (
      googleResponse.type === 'dismiss' ||
      googleResponse.type === 'cancel'
    ) {
      onFinish?.();
    }
  }, [googleResponse]);

  const onPress = async () => {
    try {
      onStart?.();
      if (Platform.OS === 'web') {
        const { error } = await signInWithGoogle();
        onFinish?.();
        if (error) onError?.(error);
        return;
      }
      if (!googleRequest) {
        onError?.('Google istemcisi hazırlanamadı.');
        onFinish?.();
        return;
      }
      await googlePromptAsync();
    } catch (e: any) {
      onError?.(e?.message ?? 'Google ile giriş başarısız.');
      onFinish?.();
    }
  };

  return (
    <Button
      title="Google ile devam et"
      variant="secondary"
      onPress={onPress}
      disabled={disabled || !googleRequest}
      fullWidth
    />
  );
};
