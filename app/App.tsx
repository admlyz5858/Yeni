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
import SubjectsScreen from './screens/SubjectsScreen';

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
  const [showRegister, setShowRegister] = useState(false);
  const { login, register } = useAuth();

  if (showRegister) {
    return (
      <RegisterScreen
        onRegister={register}
        onGoLogin={() => setShowRegister(false)}
      />
    );
  }
  return (
    <LoginScreen
      onLogin={login}
      onGoRegister={() => setShowRegister(true)}
    />
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const { hasSeenOnboarding, setHasSeenOnboarding } = usePlan();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Yükleniyor...</Text>
      </View>
    );
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
                <FlashcardProvider>
                  <AppContent />
                </FlashcardProvider>
              </SubjectsProvider>
            </PremiumProvider>
          </GamificationProvider>
        </PlanProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
