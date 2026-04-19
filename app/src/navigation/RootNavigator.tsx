import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CurriculumScreen } from '../screens/CurriculumScreen';
import { SubjectDetailScreen } from '../screens/SubjectDetailScreen';
import { TopicDetailScreen } from '../screens/TopicDetailScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

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

const SettingsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '700' },
      contentStyle: { backgroundColor: colors.bg },
    }}
  >
    <Stack.Screen
      name="SettingsHome"
      component={SettingsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
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
    <Tab.Screen name="Ayarlar" component={SettingsStack} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.bg },
    }}
  >
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

const OnboardingStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.bg },
    }}
  >
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
  </Stack.Navigator>
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

const linking = {
  prefixes: [Linking.createURL('/'), 'kpssplanlayici://'],
  config: {
    screens: {
      SignIn: 'signin',
      SignUp: 'signup',
      ForgotPassword: 'forgot',
      ResetPassword: 'reset',
    },
  },
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isGuest, loading } = useAuth();
  const { state, hydrated } = useApp();

  if (loading || !hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const needsOnboarding =
    isAuthenticated && !state.profile.onboardingCompleted;
  void isGuest;

  return (
    <NavigationContainer theme={navTheme} linking={linking as any}>
      {!isAuthenticated ? (
        <AuthStack />
      ) : needsOnboarding ? (
        <OnboardingStack />
      ) : (
        <MainTabs />
      )}
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
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
