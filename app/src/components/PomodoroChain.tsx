import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  total: number;
  completed: number;
  active?: boolean;
  color?: string;
}

export const PomodoroChain: React.FC<Props> = ({
  total,
  completed,
  active = true,
  color = colors.primary,
}) => {
  const items = Array.from({ length: total });
  return (
    <View style={styles.row}>
      {items.map((_, i) => (
        <Dot
          key={i}
          filled={i < completed}
          isActive={i === completed && active}
          color={color}
        />
      ))}
    </View>
  );
};

const Dot: React.FC<{ filled: boolean; isActive: boolean; color: string }> = ({
  filled,
  isActive,
  color,
}) => {
  const scale = useRef(new Animated.Value(isActive ? 1 : 1)).current;
  useEffect(() => {
    if (!isActive) {
      scale.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.18,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      scale.setValue(1);
    };
  }, [isActive, scale]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: filled ? color : 'transparent',
          borderColor: filled ? color : isActive ? color : colors.border,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
});
