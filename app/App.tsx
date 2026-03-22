import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PlanProvider, usePlan } from './context/PlanContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import PlanScreen from './screens/PlanScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import GoalsScreen from './screens/GoalsScreen';
import StudyLogScreen from './screens/StudyLogScreen';
import PomodoroScreen from './screens/PomodoroScreen';
import SettingsScreen from './screens/SettingsScreen';
import SmartPlanScreen from './screens/SmartPlanScreen';
import FlashcardScreen from './screens/FlashcardScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import DailyActivityScreen from './screens/DailyActivityScreen';
import PremiumScreen from './screens/PremiumScreen';
import AdminDashboard from './screens/admin/AdminDashboard';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import { GamificationProvider } from './context/GamificationContext';
import { FlashcardProvider } from './context/FlashcardContext';
import { PremiumProvider } from './context/PremiumContext';
import { SubjectsProvider } from './context/SubjectsContext';
import { GameProvider } from './context/GameContext';
import SubjectsScreen from './screens/SubjectsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import StudyGroupsScreen from './screens/StudyGroupsScreen';
import FocusScreen from './screens/FocusScreen';
import AboutScreen from './screens/AboutScreen';
import ConfigRequiredScreen from './screens/ConfigRequiredScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

function MemberNavigator() {
  const { theme, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Plan" component={PlanScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="Goals" component={GoalsScreen} />
        <Stack.Screen name="StudyLog" component={StudyLogScreen} />
        <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SmartPlan" component={SmartPlanScreen} />
        <Stack.Screen name="Flashcards" component={FlashcardScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="DailyActivity" component={DailyActivityScreen} />
        <Stack.Screen name="Premium" component={PremiumScreen} />
        <Stack.Screen name="Subjects" component={SubjectsScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="StudyGroups" component={StudyGroupsScreen} />
        <Stack.Screen name="Focus" component={FocusScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </>
  );
}

function AdminNavigator() {
  const { theme, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      </Stack.Navigator>
    </>
  );
}

function AuthScreens() {
  const [screen, setScreen] = useState<'login' | 'register' | 'forgot'>('login');
  const { login, register, resetPassword } = useAuth();

  if (screen === 'register') {
    return (
      <RegisterScreen
        onRegister={register}
        onGoLogin={() => setScreen('login')}
      />
    );
  }
  if (screen === 'forgot') {
    return (
      <ForgotPasswordScreen
        onReset={resetPassword}
        onGoLogin={() => setScreen('login')}
      />
    );
  }
  return (
    <LoginScreen
      onLogin={login}
      onGoRegister={() => setScreen('register')}
      onForgotPassword={() => setScreen('forgot')}
    />
  );
}

function AppContent() {
  const { user, isLoading, hasBackend } = useAuth();
  const { hasSeenOnboarding, setHasSeenOnboarding } = usePlan();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!hasBackend && !user) {
    if (__DEV__) {
      return <ConfigRequiredScreen allowDemo />;
    }
    return <ConfigRequiredScreen />;
  }

  if (!user) {
    return <AuthScreens />;
  }

  if (user.role === 'admin') {
    return (
      <NavigationContainer>
        <AdminNavigator />
      </NavigationContainer>
    );
  }

  if (!hasSeenOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => setHasSeenOnboarding(true)}
      />
    );
  }

  return (
    <NavigationContainer>
      <MemberNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlanProvider>
          <GamificationProvider>
            <PremiumProvider>
              <SubjectsProvider>
                <GameProvider>
                  <FlashcardProvider>
                    <AppContent />
                  </FlashcardProvider>
                </GameProvider>
              </SubjectsProvider>
            </PremiumProvider>
          </GamificationProvider>
        </PlanProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
