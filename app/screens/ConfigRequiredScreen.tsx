import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';

type Props = { allowDemo?: boolean };

export default function ConfigRequiredScreen({ allowDemo }: Props) {
  const { login } = useAuth();

  const handleDemoLogin = async () => {
    const result = await login('demo@calismaasistani.app', 'demo123');
    if (!result.ok) Alert.alert('Hata', result.error);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚙️</Text>
      <Text style={styles.title}>Backend Yapılandırılmamış</Text>
      <Text style={styles.desc}>
        Bu uygulama gerçek kullanıcı girişi için Supabase gerektirir. Geliştirici olarak:
      </Text>
      <View style={styles.steps}>
        <Text style={styles.step}>1. supabase.com üzerinden proje oluşturun</Text>
        <Text style={styles.step}>2. SQL Editor'da supabase/migrations/*.sql dosyalarını çalıştırın</Text>
        <Text style={styles.step}>3. app/ klasöründe .env oluşturup EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY ekleyin</Text>
        <Text style={styles.step}>4. Uygulamayı yeniden derleyin</Text>
      </View>
      <Text style={styles.link} onPress={() => Linking.openURL('https://github.com/admlyz5858/Yeni#readme')}>
        README'de detaylı kurulum →
      </Text>
      {allowDemo && (
        <TouchableOpacity style={styles.demoBtn} onPress={handleDemoLogin}>
          <Text style={styles.demoBtnText}>🧪 Demo ile Dene (sadece geliştirme)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc' },
  icon: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: 16 },
  desc: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  steps: { alignSelf: 'stretch', backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 24, gap: 12 },
  step: { fontSize: 14, color: '#475569', lineHeight: 22 },
  link: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
  demoBtn: {
    marginTop: 24,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  demoBtnText: { fontSize: 15, color: '#475569', fontWeight: '600' },
});
