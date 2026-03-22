import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function getIntensity(hours: number): number {
  if (hours <= 0) return 0;
  if (hours < 1) return 1;
  if (hours < 2) return 2;
  if (hours < 4) return 3;
  return 4;
}

type Props = {
  studyLog: Record<string, number>;
  weeks?: number;
};

export default function StudyHeatmap({ studyLog, weeks = 12 }: Props) {
  const totalDays = weeks * 7;
  const dates = getLastNDays(totalDays);

  const cols = 7;
  const rows = Math.ceil(dates.length / cols);

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { width: cols * 16 + (cols - 1) * 4 }]}>
        {dates.map((date) => {
          const hours = studyLog[date] || 0;
          const intensity = getIntensity(hours);
          return (
            <View
              key={date}
              style={[
                styles.cell,
                intensity >= 1 && styles.cell1,
                intensity >= 2 && styles.cell2,
                intensity >= 3 && styles.cell3,
                intensity >= 4 && styles.cell4,
              ]}
            />
          );
        })}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>Az</Text>
        <View style={[styles.legendBox, styles.cell0]} />
        <View style={[styles.legendBox, styles.cell1]} />
        <View style={[styles.legendBox, styles.cell2]} />
        <View style={[styles.legendBox, styles.cell3]} />
        <View style={[styles.legendBox, styles.cell4]} />
        <Text style={styles.legendText}>Çok</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  cell0: { backgroundColor: '#ebedf0' },
  cell1: { backgroundColor: '#9be9a8' },
  cell2: { backgroundColor: '#40c463' },
  cell3: { backgroundColor: '#30a14e' },
  cell4: { backgroundColor: '#216e39' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  legendText: { fontSize: 11, color: '#94a3b8' },
  legendBox: { width: 12, height: 12, borderRadius: 3 },
});
