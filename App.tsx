import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';

// Screens
import RestaurantListScreen from './src/screens/RestaurantListScreen';
import MenuScreen from './src/screens/MenuScreen';
import MealPlanScreen from './src/screens/MealPlanScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';

// Constants
import { COLORS } from './src/constants/theme';

// Navigation types
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type MainStackParamList = {
  MainTabs: undefined;
  MenuScreen: { location: string; date: string };
};

type MainTabParamList = {
  Restaurants: undefined;
  MealPlan: undefined;
  Profile: undefined;
};

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Main tab navigator
const MainTabNavigator = () => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Restaurants') {
          iconName = focused ? 'restaurant' : 'restaurant-outline';
        } else if (route.name === 'MealPlan') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else {
          iconName = 'ellipse';
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      headerShown: false,
    })}
  >
    <MainTab.Screen name="Restaurants" component={RestaurantListScreen} />
    <MainTab.Screen name="MealPlan" component={MealPlanScreen} />
    <MainTab.Screen name="Profile" component={ProfileScreen} />
  </MainTab.Navigator>
);

// Main stack navigator (includes tabs and MenuScreen)
const MainStackNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
    <MainStack.Screen 
      name="MenuScreen" 
      component={MenuScreen} 
      options={{ 
        headerShown: false,
        presentation: 'card'
      }} 
    />
  </MainStack.Navigator>
);

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainStackNavigator} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}