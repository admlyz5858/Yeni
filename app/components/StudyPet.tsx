import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  xp: number;
  level: number;
  streak: number;
};

export default function StudyPet({ xp, level, streak }: Props) {
  const mood = streak >= 7 ? 'happy' : streak >= 3 ? 'good' : level >= 5 ? 'neutral' : 'new';
  const emojis = { happy: '🌟', good: '😊', neutral: '📚', new: '🌱' };
  const messages = {
    happy: 'Harika gidiyorsun!',
    good: 'Devam et!',
    neutral: 'Seninle çalışmak güzel.',
    new: 'Hadi başlayalım!',
  };

  return (
    <View style={styles.container}>
      <View style={styles.pet}>
        <Text style={styles.emoji}>{emojis[mood]}</Text>
      </View>
      <Text style={styles.message}>{messages[mood]}</Text>
      <Text style={styles.levelText}>Seviye {level} Arkadaş</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 16 },
  pet: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#86efac',
  },
  emoji: { fontSize: 40 },
  message: { fontSize: 14, color: '#166534', fontWeight: '500' },
  levelText: { fontSize: 12, color: '#64748b', marginTop: 4 },
});
