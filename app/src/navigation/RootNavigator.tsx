import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CurriculumScreen } from '../screens/CurriculumScreen';
import { SubjectDetailScreen } from '../screens/SubjectDetailScreen';
import { TopicDetailScreen } from '../screens/TopicDetailScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CurriculumStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '700' },
      contentStyle: { backgroundColor: colors.bg },
    }}
  >
    <Stack.Screen
      name="CurriculumHome"
      component={CurriculumScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SubjectDetail"
      component={SubjectDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TopicDetail"
      component={TopicDetailScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

interface TabIconProps {
  label: string;
  active: boolean;
  color: string;
}

const TabIcon: React.FC<TabIconProps> = ({ label, active, color }) => (
  <View
    style={[
      styles.tabIcon,
      {
        backgroundColor: active ? color + '22' : 'transparent',
        borderColor: active ? color : 'transparent',
      },
    ]}
  >
    <Text style={[styles.tabIconText, { color }]}>{label}</Text>
  </View>
);

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.accent,
  },
};

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingTop: 6,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, focused }) => {
            const map: Record<string, string> = {
              Ana: 'AN',
              Müfredat: 'MF',
              Odak: 'OD',
              İstatistik: 'İS',
              Ayarlar: 'AY',
            };
            const lbl = map[route.name] ?? route.name.slice(0, 2).toUpperCase();
            return <TabIcon label={lbl} active={focused} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Ana" component={DashboardScreen} />
        <Tab.Screen name="Müfredat" component={CurriculumStack} />
        <Tab.Screen name="Odak" component={FocusScreen} />
        <Tab.Screen name="İstatistik" component={StatsScreen} />
        <Tab.Screen name="Ayarlar" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 34,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tabIconText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
