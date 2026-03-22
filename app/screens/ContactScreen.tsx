import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = { navigation: any };

export default function ContactScreen({ navigation }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Bize Ulaşın</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Görüş ve önerileriniz için
        </Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.linkBtn, { backgroundColor: theme.card }]}
          onPress={() => Linking.openURL('mailto:feedback@example.com')}
        >
          <Text style={[styles.linkText, { color: theme.accent }]}>E-posta ile ulaşın</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 16 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  sub: { fontSize: 14 },
  content: { padding: 20 },
  linkBtn: { padding: 20, borderRadius: 12, alignItems: 'center' },
  linkText: { fontSize: 16, fontWeight: '600' },
});
