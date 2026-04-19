import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView, VideoPlayer } from 'expo-video';
import { colors } from '../theme/colors';

interface Props {
  uri: string | null;
  style?: ViewStyle | ViewStyle[];
  tint?: string;
  overlayOpacity?: number;
}

/**
 * Kesintisiz (seamless) video arka planı.
 *
 * Teknik: iki expo-video oynatıcı sürekli paralel çalar; biri bitmeden
 * hayli önce (videonun sonundan ~3 sn önce) yumuşak 2 sn'lik bir
 * opacity crossfade başlar. Böylece "son kare → ilk kare" zıplaması
 * ekranda hiç görünmez; göz yeni sahneye çoktan adapte olmuştur.
 *
 * Ek olarak iki oynatıcı farklı offsetlerden başlar, böylece biri
 * sona yaklaşırken diğeri ortalarda olur.
 */
export const VideoBackground: React.FC<Props> = ({
  uri,
  style,
  tint = colors.bg,
  overlayOpacity = 0.4,
}) => {
  const playerA = useVideoPlayer(uri ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.25;
  });
  const playerB = useVideoPlayer(uri ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.25;
  });

  const [frontIsA, setFrontIsA] = useState(true);
  const opacityA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;
  const crossfadingRef = useRef(false);
  const frontIsARef = useRef(true);
  const currentAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  /** Sahne değişince her iki oynatıcıyı farklı offsetlerde başlat. */
  useEffect(() => {
    if (!uri) return;
    currentAnimRef.current?.stop();
    crossfadingRef.current = false;
    frontIsARef.current = true;
    setFrontIsA(true);
    opacityA.setValue(1);
    opacityB.setValue(0);
    try {
      playerA.currentTime = 0;
      playerA.play();
      playerB.currentTime = 0;
      playerB.play();
      setTimeout(() => {
        try {
          const d = Number(playerB.duration ?? 0);
          if (d > 4) {
            playerB.currentTime = d / 2;
          }
        } catch {}
      }, 400);
    } catch {}
  }, [uri, playerA, playerB, opacityA, opacityB]);

  /** Oynatan oynatıcı sona yaklaşınca crossfade tetikle. */
  useEffect(() => {
    if (!uri || Platform.OS === 'web') return;
    const CROSSFADE_MS = 2000;
    const TRIGGER_BEFORE_END = 3.0;

    const iv = setInterval(() => {
      if (crossfadingRef.current) return;
      const isA = frontIsARef.current;
      const current: VideoPlayer = isA ? playerA : playerB;
      const standby: VideoPlayer = isA ? playerB : playerA;
      const duration = Number(current.duration ?? 0);
      if (!duration || duration < 3) return;
      const curTime = Number(current.currentTime ?? 0);
      const remaining = duration - curTime;
      if (remaining > 0 && remaining <= TRIGGER_BEFORE_END) {
        crossfadingRef.current = true;
        try {
          const standbyTime = Number(standby.currentTime ?? 0);
          if (standbyTime > duration - (TRIGGER_BEFORE_END + 1)) {
            standby.currentTime = Math.max(0, duration / 3);
          }
        } catch {}
        const fadeOut = isA ? opacityA : opacityB;
        const fadeIn = isA ? opacityB : opacityA;
        const anim = Animated.parallel([
          Animated.timing(fadeOut, {
            toValue: 0,
            duration: CROSSFADE_MS,
            useNativeDriver: true,
          }),
          Animated.timing(fadeIn, {
            toValue: 1,
            duration: CROSSFADE_MS,
            useNativeDriver: true,
          }),
        ]);
        currentAnimRef.current = anim;
        anim.start(({ finished }) => {
          if (!finished) return;
          frontIsARef.current = !frontIsARef.current;
          setFrontIsA(frontIsARef.current);
          crossfadingRef.current = false;
        });
      }
    }, 200);
    return () => clearInterval(iv);
  }, [uri, playerA, playerB, opacityA, opacityB]);

  if (!uri || Platform.OS === 'web') {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tint },
          style as ViewStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: tint },
        style as ViewStyle,
      ]}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: opacityA }]}
        pointerEvents="none"
      >
        <VideoView
          style={StyleSheet.absoluteFill}
          player={playerA}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      </Animated.View>
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: opacityB }]}
        pointerEvents="none"
      >
        <VideoView
          style={StyleSheet.absoluteFill}
          player={playerB}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      </Animated.View>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tint, opacity: overlayOpacity },
        ]}
      />
    </View>
  );
};
