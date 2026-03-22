import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';

type Props = {
  visible: boolean;
  level: number;
  onClose: () => void;
};

export default function LevelUpModal({ visible, level, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Seviye Atladın!</Text>
          <Text style={styles.level}>{level}</Text>
          <Text style={styles.sub}>Tebrikler! Yeni rozetler kilidini açabilirsin.</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Harika!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  level: { fontSize: 48, fontWeight: 'bold', color: '#7c3aed', marginBottom: 16 },
  sub: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  btn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
