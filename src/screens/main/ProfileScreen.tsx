import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState({
    name: 'John Buckeye',
    age: '20',
    email: 'john.buckeye@osu.edu',
    year: 'sophomore',
    major: 'Computer Science',
    diningPlan: 'unlimited',
    calorieGoal: 2000,
    budget: 25,
    fitnessGoal: 'maintain',
    activityLevel: 'moderate',
    dietaryRestrictions: ['vegetarian'],
    allergens: [],
    preferredLocations: ['Traditions at Scott', 'Union Market', 'Courtside Cafe'],
    mealPreferences: {
      breakfast: 'light',
      lunch: 'balanced',
      dinner: 'hearty',
    },
    healthGoals: ['balanced-nutrition'],
  });

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showDiningPlanModal, setShowDiningPlanModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);

  const fitnessGoals = [
    { id: 'lose_weight', label: 'Lose Weight', icon: 'trending-down', description: 'Reduce body weight gradually' },
    { id: 'maintain', label: 'Maintain Weight', icon: 'remove', description: 'Keep current weight stable' },
    { id: 'gain_weight', label: 'Gain Weight', icon: 'trending-up', description: 'Increase body weight healthily' },
    { id: 'build_muscle', label: 'Build Muscle', icon: 'fitness', description: 'Increase muscle mass and strength' },
    { id: 'improve_endurance', label: 'Improve Endurance', icon: 'bicycle', description: 'Enhance cardiovascular fitness' },
    { id: 'general_health', label: 'General Health', icon: 'heart', description: 'Overall wellness and health' },
  ];

  const activityLevels = [
    { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { id: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
    { id: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
    { id: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
    { id: 'extremely_active', label: 'Extremely Active', description: 'Very hard exercise, training 2x/day' },
  ];

  const diningPlans = [
    { 
      id: 'unlimited', 
      name: 'Unlimited Plan', 
      description: 'Unlimited access to all-you-care-to-eat dining halls',
      price: '$2,890/semester',
      swipes: 'Unlimited',
      buckId: '$300'
    },
    { 
      id: 'block_230', 
      name: 'Block 230', 
      description: '230 meals per semester with flexibility',
      price: '$2,695/semester',
      swipes: '230 per semester',
      buckId: '$350'
    },
    { 
      id: 'block_160', 
      name: 'Block 160', 
      description: '160 meals per semester',
      price: '$2,295/semester',
      swipes: '160 per semester',
      buckId: '$400'
    },
    { 
      id: 'block_80', 
      name: 'Block 80', 
      description: '80 meals per semester',
      price: '$1,495/semester',
      swipes: '80 per semester',
      buckId: '$500'
    },
    { 
      id: 'off_campus', 
      name: 'Off-Campus Plan', 
      description: 'Flexible plan for off-campus students',
      price: '$500-1,500/semester',
      swipes: 'Variable',
      buckId: '$200-800'
    },
  ];

  const healthGoals = [
    { id: 'balanced-nutrition', label: 'Balanced Nutrition', icon: 'nutrition' },
    { id: 'high-protein', label: 'High Protein', icon: 'fitness' },
    { id: 'low-sodium', label: 'Low Sodium', icon: 'water' },
    { id: 'high-fiber', label: 'High Fiber', icon: 'leaf' },
    { id: 'heart-healthy', label: 'Heart Healthy', icon: 'heart' },
    { id: 'brain-health', label: 'Brain Health', icon: 'bulb' },
  ];

  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 
    'kosher', 'halal', 'nut-free', 'soy-free', 'pescatarian'
  ];

  const allergenOptions = [
    'nuts', 'dairy', 'eggs', 'soy', 'wheat', 'fish', 'shellfish', 'sesame'
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

  const BudgetModal = () => (
    <Modal visible={showBudgetModal} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Daily Budget</Text>
            <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalDescription}>
            Set your daily food budget to help plan cost-effective meals
          </Text>
          
          <View style={styles.budgetSliderContainer}>
            <Text style={styles.budgetLabel}>Daily Budget: ${userProfile.budget}</Text>
            <View style={styles.budgetOptions}>
              {[15, 20, 25, 30, 35, 40, 45, 50].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.budgetOption,
                    userProfile.budget === amount && styles.selectedBudgetOption
                  ]}
                  onPress={() => setUserProfile({...userProfile, budget: amount})}
                >
                  <Text style={[
                    styles.budgetOptionText,
                    userProfile.budget === amount && styles.selectedBudgetOptionText
                  ]}>
                    ${amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.modalSaveButton}
            onPress={() => setShowBudgetModal(false)}
          >
            <Text style={styles.modalSaveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const DiningPlanModal = () => (
    <Modal visible={showDiningPlanModal} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>OSU Dining Plan</Text>
            <TouchableOpacity onPress={() => setShowDiningPlanModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.diningPlansContainer}>
            {diningPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.diningPlanOption,
                  userProfile.diningPlan === plan.id && styles.selectedDiningPlan
                ]}
                onPress={() => setUserProfile({...userProfile, diningPlan: plan.id})}
              >
                <View style={styles.diningPlanHeader}>
                  <Text style={[
                    styles.diningPlanName,
                    userProfile.diningPlan === plan.id && styles.selectedDiningPlanText
                  ]}>
                    {plan.name}
                  </Text>
                  <Text style={styles.diningPlanPrice}>{plan.price}</Text>
                </View>
                <Text style={styles.diningPlanDescription}>{plan.description}</Text>
                <View style={styles.diningPlanDetails}>
                  <Text style={styles.diningPlanDetail}>Swipes: {plan.swipes}</Text>
                  <Text style={styles.diningPlanDetail}>BuckID: {plan.buckId}</Text>
                </View>
                {userProfile.diningPlan === plan.id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.modalSaveButton}
            onPress={() => setShowDiningPlanModal(false)}
          >
            <Text style={styles.modalSaveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const UserInfoModal = () => (
    <Modal visible={showUserInfoModal} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Personal Information</Text>
            <TouchableOpacity onPress={() => setShowUserInfoModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.userInfoContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={userProfile.name}
                onChangeText={(text) => setUserProfile({...userProfile, name: text})}
                placeholder="Enter your full name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={userProfile.age}
                onChangeText={(text) => setUserProfile({...userProfile, age: text})}
                placeholder="Enter your age"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year at OSU</Text>
              <View style={styles.optionsGrid}>
                {['freshman', 'sophomore', 'junior', 'senior', 'graduate'].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.optionButton,
                      userProfile.year === year && styles.selectedOption
                    ]}
                    onPress={() => setUserProfile({...userProfile, year})}
                  >
                    <Text style={[
                      styles.optionText,
                      userProfile.year === year && styles.selectedOptionText
                    ]}>
                      {year.charAt(0).toUpperCase() + year.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Major</Text>
              <TextInput
                style={styles.textInput}
                value={userProfile.major}
                onChangeText={(text) => setUserProfile({...userProfile, major: text})}
                placeholder="Enter your major"
              />
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={styles.modalSaveButton}
            onPress={() => setShowUserInfoModal(false)}
          >
            <Text style={styles.modalSaveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <LinearGradient
          colors={['#BB0000', '#990000']}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={COLORS.background} />
          </View>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          <Text style={styles.userDetails}>
            {userProfile.year.charAt(0).toUpperCase() + userProfile.year.slice(1)} • {userProfile.major}
          </Text>
        </LinearGradient>

        {/* Personal Information */}
        <ProfileSection title="Personal Information">
          <SettingItem
            icon="person-circle"
            title="Basic Information"
            subtitle={`${userProfile.age} years old • ${userProfile.year} • ${userProfile.major}`}
            onPress={() => setShowUserInfoModal(true)}
          />
          
          <SettingItem
            icon="restaurant"
            title="OSU Dining Plan"
            subtitle={diningPlans.find(p => p.id === userProfile.diningPlan)?.name || 'Not selected'}
            onPress={() => setShowDiningPlanModal(true)}
          />
        </ProfileSection>

        {/* Goals & Preferences */}
        <ProfileSection title="Health & Fitness Goals">
          <View style={styles.goalGrid}>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Daily Calories</Text>
              <Text style={styles.goalValue}>{userProfile.calorieGoal}</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Daily Budget</Text>
              <TouchableOpacity onPress={() => setShowBudgetModal(true)}>
                <Text style={[styles.goalValue, { color: COLORS.primary }]}>${userProfile.budget}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.subSectionTitle}>Fitness Goal</Text>
          <View style={styles.fitnessGoals}>
            {fitnessGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalOption,
                  userProfile.fitnessGoal === goal.id && styles.selectedGoal,
                ]}
                onPress={() => setUserProfile({...userProfile, fitnessGoal: goal.id})}
              >
                <Ionicons 
                  name={goal.icon as any} 
                  size={20} 
                  color={userProfile.fitnessGoal === goal.id ? COLORS.background : COLORS.primary} 
                />
                <View style={styles.goalContent}>
                  <Text style={[
                    styles.goalText,
                    userProfile.fitnessGoal === goal.id && styles.selectedGoalText
                  ]}>
                    {goal.label}
                  </Text>
                  <Text style={[
                    styles.goalDescription,
                    userProfile.fitnessGoal === goal.id && styles.selectedGoalDescription
                  ]}>
                    {goal.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subSectionTitle}>Activity Level</Text>
          <View style={styles.activityLevels}>
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.goalOption,
                  userProfile.activityLevel === level.id && styles.selectedGoal,
                ]}
                onPress={() => setUserProfile({...userProfile, activityLevel: level.id})}
              >
                <Text style={[
                  styles.goalText,
                  userProfile.activityLevel === level.id && styles.selectedGoalText
                ]}>
                  {level.label}
                </Text>
                <Text style={[
                  styles.goalDescription,
                  userProfile.activityLevel === level.id && styles.selectedGoalDescription
                ]}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ProfileSection>

        {/* Enhanced Dietary Preferences */}
        <ProfileSection title="Dietary Preferences">
          <Text style={styles.subSectionTitle}>Dietary Restrictions</Text>
          <View style={styles.dietaryOptions}>
            {dietaryOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dietaryOption,
                  userProfile.dietaryRestrictions.includes(option) && styles.selectedDietary,
                ]}
                onPress={() => {
                  const newRestrictions = userProfile.dietaryRestrictions.includes(option)
                    ? userProfile.dietaryRestrictions.filter(r => r !== option)
                    : [...userProfile.dietaryRestrictions, option];
                  setUserProfile({...userProfile, dietaryRestrictions: newRestrictions});
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

          <Text style={styles.subSectionTitle}>Allergens to Avoid</Text>
          <View style={styles.dietaryOptions}>
            {allergenOptions.map((allergen) => (
              <TouchableOpacity
                key={allergen}
                style={[
                  styles.allergenOption,
                  userProfile.allergens.includes(allergen) && styles.selectedAllergen,
                ]}
                onPress={() => {
                  const newAllergens = userProfile.allergens.includes(allergen)
                    ? userProfile.allergens.filter(a => a !== allergen)
                    : [...userProfile.allergens, allergen];
                  setUserProfile({...userProfile, allergens: newAllergens});
                }}
              >
                <Ionicons 
                  name="warning" 
                  size={16} 
                  color={userProfile.allergens.includes(allergen) ? COLORS.background : COLORS.warning} 
                />
                <Text style={[
                  styles.allergenText,
                  userProfile.allergens.includes(allergen) && styles.selectedAllergenText
                ]}>
                  {allergen}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subSectionTitle}>Health Goals</Text>
          <View style={styles.healthGoalsGrid}>
            {healthGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.healthGoalOption,
                  userProfile.healthGoals.includes(goal.id) && styles.selectedHealthGoal,
                ]}
                onPress={() => {
                  const newGoals = userProfile.healthGoals.includes(goal.id)
                    ? userProfile.healthGoals.filter(g => g !== goal.id)
                    : [...userProfile.healthGoals, goal.id];
                  setUserProfile({...userProfile, healthGoals: newGoals});
                }}
              >
                <Ionicons 
                  name={goal.icon as any} 
                  size={20} 
                  color={userProfile.healthGoals.includes(goal.id) ? COLORS.background : COLORS.primary} 
                />
                <Text style={[
                  styles.healthGoalText,
                  userProfile.healthGoals.includes(goal.id) && styles.selectedHealthGoalText
                ]}>
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ProfileSection>

        {/* Preferred Dining Locations */}
        <ProfileSection title="Preferred Dining Locations">
          <View style={styles.locationsGrid}>
            {diningLocations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.locationOption,
                  userProfile.preferredLocations.includes(location) && styles.selectedLocation,
                ]}
                onPress={() => {
                  const newLocations = userProfile.preferredLocations.includes(location)
                    ? userProfile.preferredLocations.filter(l => l !== location)
                    : [...userProfile.preferredLocations, location];
                  setUserProfile({...userProfile, preferredLocations: newLocations});
                }}
              >
                <Ionicons 
                  name="restaurant" 
                  size={16} 
                  color={userProfile.preferredLocations.includes(location) ? COLORS.background : COLORS.primary} 
                />
                <Text style={[
                  styles.locationName,
                  userProfile.preferredLocations.includes(location) && styles.selectedLocationText
                ]}>
                  {location.replace('Traditions at ', '').replace(' at Scott', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
            onPress={() => setShowUserInfoModal(true)}
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

        {/* Footer Spacing */}
        <View style={styles.footerSpacing} />
      </ScrollView>

      <BudgetModal />
      <DiningPlanModal />
      <UserInfoModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xxl + 20,
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
    marginBottom: SPACING.xs,
  },
  userDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    opacity: 0.8,
  },
  section: {
    backgroundColor: COLORS.background,
    margin: SPACING.md,
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
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
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
    color: COLORS.text,
  },
  subSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
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
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGoal: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  goalText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedGoalText: {
    color: COLORS.background,
  },
  goalDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  selectedGoalDescription: {
    color: COLORS.background,
    opacity: 0.9,
  },
  activityLevels: {
    marginBottom: SPACING.lg,
  },
  dietaryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  dietaryOption: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedDietary: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  dietaryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedDietaryText: {
    color: COLORS.background,
  },
  allergenOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  selectedAllergen: {
    backgroundColor: COLORS.warning,
  },
  allergenText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  selectedAllergenText: {
    color: COLORS.background,
  },
  healthGoalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  healthGoalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: '45%',
  },
  selectedHealthGoal: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  healthGoalText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  selectedHealthGoalText: {
    color: COLORS.background,
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedLocation: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  locationName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  selectedLocationText: {
    color: COLORS.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '500',
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
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  footerSpacing: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    margin: SPACING.lg,
    maxHeight: '80%',
    minWidth: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  modalSaveButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Budget modal styles
  budgetSliderContainer: {
    marginBottom: SPACING.lg,
  },
  budgetLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  budgetOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  budgetOption: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    margin: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedBudgetOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  budgetOptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  selectedBudgetOptionText: {
    color: COLORS.background,
  },
  // Dining plan modal styles
  diningPlansContainer: {
    maxHeight: 400,
  },
  diningPlanOption: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  selectedDiningPlan: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  diningPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  diningPlanName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  selectedDiningPlanText: {
    color: COLORS.primary,
  },
  diningPlanPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  diningPlanDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  diningPlanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diningPlanDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  // User info modal styles
  userInfoContainer: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: COLORS.background,
  },
}); 