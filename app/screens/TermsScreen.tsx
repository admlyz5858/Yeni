import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = { navigation: any };

export default function TermsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Kullanım Sözleşmesi</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Hizmet şartlarımızı okuyun
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/admlyz5858/Yeni')}>
          <Text style={[styles.link, { color: theme.accent }]}>GitHub deposunda görüntüle</Text>
        </TouchableOpacity>
      </ScrollView>
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
  link: { fontSize: 16 },
});
