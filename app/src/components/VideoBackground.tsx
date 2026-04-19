import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../theme/colors';

interface Props {
  uri: string | null;
  style?: ViewStyle | ViewStyle[];
  tint?: string;
  overlayOpacity?: number;
}

/**
 * Arka plan videosu iki oynatıcı kullanarak crossfade döngüsü oynatır:
 * bir oynatıcı bitmeden diğeri 0'dan başlatılır ve opaklıklar karşılıklı
 * animasyonlanır, böylece tekrar başa sarma "sıçraması" görünmez.
 */
export const VideoBackground: React.FC<Props> = ({
  uri,
  style,
  tint = colors.bg,
  overlayOpacity = 0.4,
}) => {
  const playerA = useVideoPlayer(uri ?? null, (p) => {
    p.loop = false;
    p.muted = true;
  });
  const playerB = useVideoPlayer(uri ?? null, (p) => {
    p.loop = false;
    p.muted = true;
  });

  const [frontIsA, setFrontIsA] = useState(true);
  const opacityA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;
  const crossfadingRef = useRef(false);

  useEffect(() => {
    if (!uri) return;
    try {
      playerA.currentTime = 0;
      playerA.play();
      playerB.currentTime = 0;
      playerB.pause();
    } catch {}
    setFrontIsA(true);
    opacityA.setValue(1);
    opacityB.setValue(0);
    crossfadingRef.current = false;
  }, [uri, playerA, playerB, opacityA, opacityB]);

  useEffect(() => {
    if (!uri || Platform.OS === 'web') return;
    const CROSSFADE_MS = 1200;
    const TRIGGER_SEC = 1.4;

    const iv = setInterval(() => {
      if (crossfadingRef.current) return;
      const current = frontIsA ? playerA : playerB;
      const standby = frontIsA ? playerB : playerA;
      const duration = Number(current.duration ?? 0);
      if (!duration || duration < 2) return;
      const curTime = Number(current.currentTime ?? 0);
      if (duration - curTime <= TRIGGER_SEC && curTime > 0.5) {
        crossfadingRef.current = true;
        try {
          standby.currentTime = 0;
          standby.play();
        } catch {}
        Animated.parallel([
          Animated.timing(frontIsA ? opacityA : opacityB, {
            toValue: 0,
            duration: CROSSFADE_MS,
            useNativeDriver: true,
          }),
          Animated.timing(frontIsA ? opacityB : opacityA, {
            toValue: 1,
            duration: CROSSFADE_MS,
            useNativeDriver: true,
          }),
        ]).start(() => {
          try {
            current.pause();
            current.currentTime = 0;
          } catch {}
          setFrontIsA((v) => !v);
          crossfadingRef.current = false;
        });
      }
    }, 150);
    return () => clearInterval(iv);
  }, [uri, frontIsA, playerA, playerB, opacityA, opacityB]);

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
