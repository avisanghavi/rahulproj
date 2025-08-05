import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, Animated } from 'react-native';

import { RootStackParamList, TabParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import MenuBrowserScreen from '../screens/main/MenuBrowserScreen';
import BrutusAIScreen from '../screens/main/BrutusAIScreen';
import MealPlannerScreen from '../screens/main/MealPlannerScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AdminScreen from '../screens/main/AdminScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Demo mode - set to true to bypass authentication
const DEMO_MODE = true;

function TabNavigator() {
  const AnimatedTabIcon = ({ focused, color, size, iconName }: {
    focused: boolean;
    color: string;
    size: number;
    iconName: keyof typeof Ionicons.glyphMap;
  }) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
      Animated.spring(scaleValue, {
        toValue: focused ? 1.2 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }, [focused, scaleValue]);

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Ionicons name={iconName} size={size} color={color} />
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'MenuBrowser') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'BrutusAI') {
              iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
            } else if (route.name === 'MealPlanner') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Admin') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'ellipse-outline';
            }

            return <AnimatedTabIcon focused={focused} color={color} size={size} iconName={iconName} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.background,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="MenuBrowser" 
        component={MenuBrowserScreen}
        options={{ title: 'Menu' }}
      />
      <Tab.Screen 
        name="BrutusAI" 
        component={BrutusAIScreen}
        options={{ title: 'BrutusAI' }}
      />
      <Tab.Screen 
        name="MealPlanner" 
        component={MealPlannerScreen}
        options={{ title: 'Planner' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Tab.Screen 
        name="Admin" 
        component={AdminScreen}
        options={{ title: 'Admin' }}
      />
    </Tab.Navigator>
    {/* Red accent bar below tab bar */}
    <View style={{ height: 8, backgroundColor: COLORS.primary }} />
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: COLORS.background 
    }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{ 
        marginTop: SPACING.md, 
        fontSize: FONT_SIZES.lg, 
        color: COLORS.textSecondary 
      }}>
        Loading BuckeyeGrub...
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // In demo mode, skip authentication and go straight to main app
  if (DEMO_MODE) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 