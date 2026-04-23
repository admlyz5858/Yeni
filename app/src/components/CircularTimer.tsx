import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';
import { formatClock } from '../utils/format';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  size?: number;
  remainingSeconds: number;
  totalSeconds: number;
  color: string;
  phaseLabel: string;
  running: boolean;
  paused?: boolean;
  subtitle?: string;
}

export const CircularTimer: React.FC<Props> = ({
  size = 280,
  remainingSeconds,
  totalSeconds,
  color,
  phaseLabel,
  running,
  paused,
  subtitle,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const ratio =
    totalSeconds > 0
      ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds))
      : 0;

  const dashOffsetAnim = useRef(new Animated.Value(ratio)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.timing(dashOffsetAnim, {
      toValue: ratio,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ratio, dashOffsetAnim]);

  useEffect(() => {
    if (running && !paused) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      glowLoop.start();
      return () => {
        loop.stop();
        glowLoop.stop();
        pulseAnim.setValue(1);
        glowAnim.setValue(0.4);
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(paused ? 0.55 : 0.3);
    }
  }, [running, paused, pulseAnim, glowAnim]);

  const dashOffset = dashOffsetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="1" />
              <Stop offset="1" stopColor={color} stopOpacity="0.5" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            fill="rgba(10,15,30,0.28)"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference}, ${circumference}`}
            strokeDashoffset={dashOffset as any}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </Animated.View>
      <View
        pointerEvents="none"
        style={[
          styles.centerContent,
          { width: size, height: size },
        ]}
      >
        <Text style={[styles.phaseLabel, { color }]}>{phaseLabel}</Text>
        <Text style={styles.timeText}>{formatClock(remainingSeconds)}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 6,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowRadius: 4,
  },
  timeText: {
    color: colors.white,
    fontSize: 64,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 8,
  },
  subtitle: {
    color: colors.text,
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 20,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 4,
  },
});
