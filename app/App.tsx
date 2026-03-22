import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import NotificationPermissionModal from './components/NotificationPermissionModal';
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
import { SettingsProvider } from './context/SettingsContext';
import SubjectsScreen from './screens/SubjectsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import StudyGroupsScreen from './screens/StudyGroupsScreen';
import FocusScreen from './screens/FocusScreen';
import AboutScreen from './screens/AboutScreen';
import CustomQuotesScreen from './screens/CustomQuotesScreen';
import ConfigRequiredScreen from './screens/ConfigRequiredScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ExamSelectionScreen from './screens/ExamSelectionScreen';
import RootNavigator from './navigation/RootNavigator';

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
          animation: 'slide_from_right',
          animationDuration: 280,
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
        <Stack.Screen name="CustomQuotes" component={CustomQuotesScreen} />
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
          animation: 'slide_from_right',
          animationDuration: 280,
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
  const { theme } = useTheme();
  const { user, isLoading, hasBackend } = useAuth();
  const { hasSeenOnboarding, setHasSeenOnboarding, setSelectedExam } = usePlan();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ marginTop: 12, color: theme.textSecondary }}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!hasBackend && !user) {
    return <ConfigRequiredScreen allowDemo />;
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
    const handleComplete = () => {
      setHasSeenOnboarding(true);
      setShowNotificationModal(false);
    };
    return (
      <View style={{ flex: 1 }}>
        <OnboardingScreen
          onComplete={handleComplete}
          examSelectionStep={
            <ExamSelectionScreen
              progress={0.92}
              onSelect={(examId) => {
                setSelectedExam(examId);
                setShowNotificationModal(true);
              }}
            />
          }
        />
        <NotificationPermissionModal
          visible={showNotificationModal}
          onAllow={handleComplete}
          onSkip={handleComplete}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
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
                  <SettingsProvider>
                    <FlashcardProvider>
                      <AppContent />
                    </FlashcardProvider>
                  </SettingsProvider>
                </GameProvider>
              </SubjectsProvider>
            </PremiumProvider>
          </GamificationProvider>
        </PlanProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
