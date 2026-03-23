import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';

const CYAN = '#06b6d4';

type Props = {
  visible: boolean;
  onAllow: () => void;
  onSkip: () => void;
};

export default function NotificationPermissionModal({ visible, onAllow, onSkip }: Props) {
  const handleAllow = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Varsayılan',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
      }
    } catch {}
    onAllow();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeBtn} onPress={onSkip}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.bellWrap}>
            <Text style={styles.bellEmoji}>🔔</Text>
          </View>

          <Text style={styles.title}>Bildirimlerle Haberdar Ol!</Text>
          <Text style={styles.desc}>
            Sana özel hatırlatmalar, motivasyon mesajları ve önemli güncellemeleri kaçırma! Bilge Baykuş
            olarak seni bilgilendirmek ve hedeflerine ulaşmanda destek olmak için bildirimlere izin verebilirsin.
          </Text>

          <TouchableOpacity style={styles.allowBtn} onPress={handleAllow}>
            <Text style={styles.allowIcon}>🔔</Text>
            <Text style={styles.allowText}>Bildirimlere İzin Ver</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipTextBtn} onPress={onSkip}>
            <Text style={styles.skipLabel}>Şimdilik atla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  closeText: { fontSize: 20, color: '#94a3b8' },
  bellWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  bellEmoji: { fontSize: 48 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  desc: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  allowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CYAN,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    gap: 10,
  },
  allowIcon: { fontSize: 20 },
  allowText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  skipTextBtn: { marginTop: 16 },
  skipLabel: { fontSize: 15, color: '#64748b' },
});
