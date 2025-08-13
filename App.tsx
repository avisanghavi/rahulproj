import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Text } from 'react-native';

// Screens
import RestaurantListScreen from './src/screens/RestaurantListScreen';
import MenuScreen from './src/screens/MenuScreen';
import MealPlanScreen from './src/screens/MealPlanScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import OnboardingPersonalScreen from './src/screens/onboarding/PersonalScreen';
import OnboardingDiningScreen from './src/screens/onboarding/DiningScreen';
import OnboardingHealthScreen from './src/screens/onboarding/HealthScreen';
import OnboardingAllergiesScreen from './src/screens/onboarding/AllergiesScreen';

// Constants
import { COLORS, SPACING, FONT_SIZES } from './src/constants/theme';

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

type OnboardingStackParamList = {
  Personal: undefined;
  Dining: undefined;
  Health: undefined;
  Allergies: undefined;
};

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

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
    detachInactiveScreens
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else if (route.name === 'MealPlan') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Restaurants') {
          iconName = focused ? 'restaurant' : 'restaurant-outline';
        } else {
          iconName = 'ellipse';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      headerShown: false,
      lazy: true,
    })}
  >
    <MainTab.Screen name="Profile" component={ProfileScreen} options={{ lazy: true }} />
    <MainTab.Screen name="MealPlan" component={MealPlanScreen} options={{ lazy: true }} />
    <MainTab.Screen name="Restaurants" component={RestaurantListScreen} options={{ lazy: true }} />
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

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="Personal" component={OnboardingPersonalScreen} />
      <OnboardingStack.Screen name="Dining" component={OnboardingDiningScreen} />
      <OnboardingStack.Screen name="Health" component={OnboardingHealthScreen} />
      <OnboardingStack.Screen name="Allergies" component={OnboardingAllergiesScreen} />
    </OnboardingStack.Navigator>
  );
}

function RootNavigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SPACING.md, color: COLORS.text, fontSize: FONT_SIZES.md }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.onboardingComplete ? (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigation />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}