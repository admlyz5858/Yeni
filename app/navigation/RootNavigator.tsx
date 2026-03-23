import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

import MainTabs from './MainTabs';
import CustomDrawerContent from './CustomDrawer';

import PomodoroScreen from '../screens/PomodoroScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlanScreen from '../screens/PlanScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import GoalsScreen from '../screens/GoalsScreen';
import StudyLogScreen from '../screens/StudyLogScreen';
import FlashcardScreen from '../screens/FlashcardScreen';
import DailyActivityScreen from '../screens/DailyActivityScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import CustomQuotesScreen from '../screens/CustomQuotesScreen';
import PremiumScreen from '../screens/PremiumScreen';
import SubjectsScreen from '../screens/SubjectsScreen';
import StudyGroupsScreen from '../screens/StudyGroupsScreen';
import FocusScreen from '../screens/FocusScreen';
import SmartPlanScreen from '../screens/SmartPlanScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import FAQScreen from '../screens/FAQScreen';
import TacticsGuideScreen from '../screens/TacticsGuideScreen';
import ContactScreen from '../screens/ContactScreen';
import TermsScreen from '../screens/TermsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import MindMapScreen from '../screens/MindMapScreen';
import InstantSolutionScreen from '../screens/InstantSolutionScreen';
import ChatScreen from '../screens/ChatScreen';
import ConverterScreen from '../screens/ConverterScreen';
import TimeMapScreen from '../screens/TimeMapScreen';
import StudyRoomScreen from '../screens/StudyRoomScreen';
import SmartAnalysisScreen from '../screens/SmartAnalysisScreen';
import BilgeUssuScreen from '../screens/BilgeUssuScreen';
import NotebookChatScreen from '../screens/NotebookChatScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function MainStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="Plan" component={PlanScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="StudyLog" component={StudyLogScreen} />
      <Stack.Screen name="Flashcards" component={FlashcardScreen} />
      <Stack.Screen name="DailyActivity" component={DailyActivityScreen} />
      <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
      <Stack.Screen name="MindMap" component={MindMapScreen} />
      <Stack.Screen name="InstantSolution" component={InstantSolutionScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Converter" component={ConverterScreen} />
      <Stack.Screen name="TimeMap" component={TimeMapScreen} />
      <Stack.Screen name="StudyRoom" component={StudyRoomScreen} />
      <Stack.Screen name="SmartAnalysis" component={SmartAnalysisScreen} />
      <Stack.Screen name="BilgeUssu" component={BilgeUssuScreen} />
      <Stack.Screen name="NotebookChat" component={NotebookChatScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="CustomQuotes" component={CustomQuotesScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="Subjects" component={SubjectsScreen} />
      <Stack.Screen name="StudyGroups" component={StudyGroupsScreen} />
      <Stack.Screen name="Focus" component={FocusScreen} />
      <Stack.Screen name="SmartPlan" component={SmartPlanScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="TacticsGuide" component={TacticsGuideScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { theme } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: 300 },
      }}
    >
      <Drawer.Screen name="Main" component={MainStack} />
    </Drawer.Navigator>
  );
}
