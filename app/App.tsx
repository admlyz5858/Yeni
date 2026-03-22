import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlanProvider } from './context/PlanContext';
import HomeScreen from './screens/HomeScreen';
import PlanScreen from './screens/PlanScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import GoalsScreen from './screens/GoalsScreen';
import StudyLogScreen from './screens/StudyLogScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PlanProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f8fafc' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Plan" component={PlanScreen} />
          <Stack.Screen name="Schedule" component={ScheduleScreen} />
          <Stack.Screen name="Goals" component={GoalsScreen} />
          <Stack.Screen name="StudyLog" component={StudyLogScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PlanProvider>
  );
}
