import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PlanProvider, usePlan } from './context/PlanContext';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import PlanScreen from './screens/PlanScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import GoalsScreen from './screens/GoalsScreen';
import StudyLogScreen from './screens/StudyLogScreen';
import PomodoroScreen from './screens/PomodoroScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

function MainNavigator() {
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
      </Stack.Navigator>
    </>
  );
}

function AppContent() {
  const { hasSeenOnboarding, setHasSeenOnboarding } = usePlan();

  if (!hasSeenOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => setHasSeenOnboarding(true)}
      />
    );
  }

  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PlanProvider>
        <AppContent />
      </PlanProvider>
    </ThemeProvider>
  );
}
