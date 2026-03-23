import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import GamesScreen from '../screens/GamesScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function CenterTabButton({ onPress }: { onPress?: () => void }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: theme.accent }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.fabInner}>
        <Text style={styles.fabIcon}>🦉</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MainTabs({ navigation }: any) {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.cardBorder,
          height: 64,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⊞</Text>,
        }}
      />
      <Tab.Screen
        name="GamesTab"
        component={GamesScreen}
        options={{
          tabBarLabel: 'Oyunlar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🎮</Text>,
        }}
      />
      <Tab.Screen
        name="CenterPomodoro"
        component={PomodoroScreen}
        options={{
          tabBarLabel: 'Odaklan',
          tabBarButton: (props) => (
            <View style={styles.centerTabWrap}>
              <CenterTabButton onPress={props.onPress as () => void} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="LeaderboardTab"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Sıralama',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏆</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerTabWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabInner: { alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 28 },
});
