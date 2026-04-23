import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { TopicStatus } from '../storage/types';

interface Props {
  status: TopicStatus;
}

const labels: Record<TopicStatus, string> = {
  not_started: 'Başlanmadı',
  in_progress: 'Çalışılıyor',
  completed: 'Tamamlandı',
  review: 'Tekrar',
};

const statusColor: Record<TopicStatus, string> = {
  not_started: colors.textDim,
  in_progress: colors.warning,
  completed: colors.success,
  review: colors.accent,
};

export const StatusPill: React.FC<Props> = ({ status }) => {
  const color = statusColor[status];
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{labels[status]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
