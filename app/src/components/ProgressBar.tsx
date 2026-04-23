import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';

interface Props {
  value: number;
  total: number;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<Props> = ({
  value,
  total,
  color = colors.primary,
  height = 8,
}) => {
  const safeTotal = total > 0 ? total : 1;
  const ratio = Math.max(0, Math.min(1, value / safeTotal));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={{
          width: `${ratio * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.bgSoft,
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
});
