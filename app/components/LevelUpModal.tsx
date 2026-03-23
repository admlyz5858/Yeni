import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from 'react-native';

type Props = {
  visible: boolean;
  level: number;
  onClose: () => void;
};

export default function LevelUpModal({ visible, level, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      emojiAnim.setValue(0);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 80,
        }),
      ]).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(emojiAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(emojiAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
          ])
        ).start();
      });
    }
  }, [visible]);

  const emojiScale = emojiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Text style={[styles.emoji, { transform: [{ scale: emojiScale }] }]}>
            🎉
          </Animated.Text>
          <Text style={styles.title}>Seviye Atladın!</Text>
          <Text style={styles.level}>{level}</Text>
          <Text style={styles.sub}>Tebrikler! Yeni rozetler kilidini açabilirsin.</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.btnText}>Harika!</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
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
