import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState({
    name: 'John Buckeye',
    email: 'john.buckeye@osu.edu',
    calorieGoal: 2000,
    budget: 25,
    fitnessGoal: 'maintain',
    dietaryRestrictions: ['vegetarian'],
    preferredLocations: ['Traditions at Scott', 'Union Market', 'Courtside Cafe'],
  });

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const fitnessGoals = [
    { id: 'lose_weight', label: 'Lose Weight', icon: 'trending-down' },
    { id: 'maintain', label: 'Maintain Weight', icon: 'remove' },
    { id: 'gain_weight', label: 'Gain Weight', icon: 'trending-up' },
    { id: 'build_muscle', label: 'Build Muscle', icon: 'fitness' },
  ];

  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'
  ];

  const diningLocations = [
    'Traditions at Scott',
    'Traditions at Kennedy', 
    'Traditions at Morrill',
    'Marketplace on Neil',
    "Sloopy's Diner",
    'Union Market',
    "Woody's Tavern",
    'Espress-OH',
    'Courtside Cafe',
    'Juice',
    'Juice North',
    'Berry Cafe',
    'Terra Byte Cafe',
    'Curl Market',
    'The Campus Grind - McPherson',
    'Mirror Lake Eatery',
    "Oxley's by the Numbers",
    'Oxleys To Go',
    'Crane Cafe',
    'Hamilton Cafe'
  ];

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color={COLORS.background} />
        </View>
        <Text style={styles.userName}>{userProfile.name}</Text>
        <Text style={styles.userEmail}>{userProfile.email}</Text>
      </View>

      {/* Goals & Preferences */}
      <ProfileSection title="Goals & Preferences">
        <View style={styles.goalGrid}>
          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Daily Calories</Text>
            <Text style={styles.goalValue}>{userProfile.calorieGoal}</Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Daily Budget</Text>
            <Text style={styles.goalValue}>${userProfile.budget}</Text>
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Fitness Goal</Text>
        <View style={styles.fitnessGoals}>
          {fitnessGoals.map(goal => (
            <TouchableOpacity 
              key={goal.id}
              style={[
                styles.goalOption,
                userProfile.fitnessGoal === goal.id && styles.selectedGoal
              ]}
              onPress={() => setUserProfile(prev => ({ ...prev, fitnessGoal: goal.id }))}
            >
              <Ionicons 
                name={goal.icon as any} 
                size={20} 
                color={userProfile.fitnessGoal === goal.id ? COLORS.background : COLORS.primary} 
              />
              <Text style={[
                styles.goalText,
                userProfile.fitnessGoal === goal.id && styles.selectedGoalText
              ]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subSectionTitle}>Dietary Restrictions</Text>
        <View style={styles.dietaryOptions}>
          {dietaryOptions.map(option => (
            <TouchableOpacity 
              key={option}
              style={[
                styles.dietaryChip,
                userProfile.dietaryRestrictions.includes(option) && styles.selectedDietary
              ]}
              onPress={() => {
                setUserProfile(prev => ({
                  ...prev,
                  dietaryRestrictions: prev.dietaryRestrictions.includes(option)
                    ? prev.dietaryRestrictions.filter(r => r !== option)
                    : [...prev.dietaryRestrictions, option]
                }));
              }}
            >
              <Text style={[
                styles.dietaryText,
                userProfile.dietaryRestrictions.includes(option) && styles.selectedDietaryText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ProfileSection>

      {/* Dining Preferences */}
      <ProfileSection title="Preferred Dining Locations">
        {diningLocations.map(location => (
          <View key={location} style={styles.locationItem}>
            <Text style={styles.locationName}>{location}</Text>
            <Switch
              value={userProfile.preferredLocations.includes(location)}
              onValueChange={(value) => {
                setUserProfile(prev => ({
                  ...prev,
                  preferredLocations: value
                    ? [...prev.preferredLocations, location]
                    : prev.preferredLocations.filter(l => l !== location)
                }));
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
            />
          </View>
        ))}
      </ProfileSection>

      {/* App Settings */}
      <ProfileSection title="App Settings">
        <SettingItem
          icon="notifications"
          title="Notifications"
          subtitle="Meal reminders and updates"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
            />
          }
        />
        
        <SettingItem
          icon="moon"
          title="Dark Mode"
          subtitle="Coming soon"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
              disabled
            />
          }
        />
      </ProfileSection>

      {/* Account Actions */}
      <ProfileSection title="Account">
        <SettingItem
          icon="create"
          title="Edit Profile"
          subtitle="Update your information"
        />
        
        <SettingItem
          icon="help-circle"
          title="Help & Support"
          subtitle="Get help with the app"
        />
        
        <SettingItem
          icon="information-circle"
          title="About BuckeyeGrub"
          subtitle="Version 1.0.0"
        />
        
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ProfileSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.background,
    opacity: 0.9,
  },
  section: {
    backgroundColor: COLORS.background,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  goalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  goalItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  goalLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  goalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  fitnessGoals: {
    marginBottom: SPACING.lg,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGoal: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  selectedGoalText: {
    color: COLORS.background,
  },
  dietaryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietaryChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedDietary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dietaryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  selectedDietaryText: {
    color: COLORS.background,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
}); 