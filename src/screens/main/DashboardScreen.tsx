import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../../constants/theme';
import { sampleMealPlans } from '../../data/mockData';
import { TabParamList } from '../../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type NavigationProp = BottomTabNavigationProp<TabParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const todaysPlan = sampleMealPlans[0]; // Use first sample plan
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Pulse animation for nutrition cards
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => {
      pulse.stop();
      clearInterval(timer);
    };
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return { greeting: 'Good Morning!', subtitle: 'Ready for a nutritious day?', icon: 'sunny' };
    } else if (hour >= 12 && hour < 17) {
      return { greeting: 'Good Afternoon!', subtitle: 'How about a healthy lunch?', icon: 'partly-sunny' };
    } else if (hour >= 17 && hour < 21) {
      return { greeting: 'Good Evening!', subtitle: 'Time for dinner planning?', icon: 'cloudy' };
    } else {
      return { greeting: 'Good Night!', subtitle: 'Planning tomorrow\'s meals?', icon: 'moon' };
    }
  };

  const { greeting, subtitle, icon } = getTimeBasedGreeting();

  const handleOrderOnGrubhub = () => {
    const grubhubUrl = 'https://www.grubhub.com/restaurant/ohio-state-university-dining/';
    Linking.openURL(grubhubUrl);
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const NutritionCard = ({ 
    title, 
    value, 
    unit, 
    color, 
    icon,
    delay = 0 
  }: {
    title: string;
    value: number;
    unit: string;
    color: string;
    icon: string;
    delay?: number;
  }) => (
    <Animatable.View 
      animation="bounceInUp" 
      delay={delay}
      style={[styles.nutritionCard, { borderLeftColor: color }]}
    >
      <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
        <View style={styles.nutritionHeader}>
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={styles.nutritionTitle}>{title}</Text>
        </View>
        <Text style={[styles.nutritionValue, { color }]}>
          {value}
          <Text style={styles.nutritionUnit}>{unit}</Text>
        </Text>
      </Animated.View>
    </Animatable.View>
  );

  const ActionCard = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    delay = 0,
    gradient = false 
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress?: () => void;
    delay?: number;
    gradient?: boolean;
  }) => (
    <Animatable.View animation="fadeInUp" delay={delay} style={styles.actionCardContainer}>
      <TouchableOpacity 
        style={styles.actionCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {gradient ? (
          <LinearGradient
            colors={[COLORS.primary, '#AA0000']}
            style={styles.actionCardGradient}
          >
            <Ionicons name={icon as any} size={32} color={COLORS.background} />
            <Text style={[styles.actionTitle, { color: COLORS.background }]}>{title}</Text>
            <Text style={[styles.actionSubtitle, { color: COLORS.background, opacity: 0.9 }]}>{subtitle}</Text>
          </LinearGradient>
        ) : (
          <>
            <View style={[styles.iconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
              <Ionicons name={icon as any} size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={['#BB0000', '#990000', '#770000']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animatable.View animation="slideInDown" duration={800}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </Animatable.View>
          
          {/* Floating elements */}
          <Animatable.View 
            animation="fadeIn" 
            delay={600}
            style={styles.floatingIcon}
          >
            <Ionicons name={icon as any} size={40} color="rgba(255,255,255,0.2)" />
          </Animatable.View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* AI Meal Plan Section */}
        <Animatable.View animation="slideInUp" delay={400} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Animatable.View animation="bounceIn" delay={600}>
              <LinearGradient
                colors={[COLORS.primary, '#AA0000']}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="sparkles" size={20} color={COLORS.background} />
              </LinearGradient>
            </Animatable.View>
            <Text style={styles.sectionTitle}>Today's AI Meal Plan</Text>
          </View>
          
          <View style={styles.mealPlanCard}>
            <Animatable.View animation="fadeInDown" delay={800}>
              <Text style={styles.planName}>{todaysPlan.name}</Text>
              <Text style={styles.planDescription}>
                Optimized for your fitness goals and budget
              </Text>
            </Animatable.View>
            
            {/* Enhanced Nutrition Overview */}
            <View style={styles.nutritionGrid}>
              <NutritionCard 
                title="Calories" 
                value={todaysPlan.totalCalories} 
                unit=" kcal" 
                color={COLORS.primary}
                icon="flame"
                delay={1000}
              />
              <NutritionCard 
                title="Protein" 
                value={todaysPlan.totalProtein} 
                unit="g" 
                color={COLORS.success}
                icon="fitness"
                delay={1100}
              />
              <NutritionCard 
                title="Carbs" 
                value={todaysPlan.totalCarbs} 
                unit="g" 
                color={COLORS.info}
                icon="leaf"
                delay={1200}
              />
              <NutritionCard 
                title="Fat" 
                value={todaysPlan.totalFat} 
                unit="g" 
                color={COLORS.warning}
                icon="water"
                delay={1300}
              />
            </View>

            {/* Enhanced Cost Container */}
            <Animatable.View animation="slideInLeft" delay={1400} style={styles.costContainer}>
              <LinearGradient
                colors={['#28A745', '#20A33C']}
                style={styles.costBadge}
              >
                <Ionicons name="wallet" size={16} color={COLORS.background} />
                <Text style={styles.costText}>
                  ${todaysPlan.totalCost.toFixed(2)}
                </Text>
              </LinearGradient>
              <Text style={styles.costLabel}>Total Budget</Text>
            </Animatable.View>

            {/* Enhanced Order Button */}
            <Animatable.View animation="bounceIn" delay={1600}>
              <TouchableOpacity 
                style={styles.orderButton}
                onPress={handleOrderOnGrubhub}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#BB0000', '#990000']}
                  style={styles.orderButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="bag" size={20} color={COLORS.background} />
                  <Text style={styles.orderButtonText}>Order on Grubhub</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.background} />
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </Animatable.View>

        {/* Enhanced Quick Actions */}
        <Animatable.View animation="slideInUp" delay={600} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <ActionCard
              icon="restaurant"
              title="Menu"
              subtitle="Browse dining options"
              onPress={() => navigation.navigate('MenuBrowser')}
              delay={1800}
            />
            
            <ActionCard
              icon="chatbox-ellipses"
              title="BrutusAI"
              subtitle="Meal recommendations"
              onPress={() => navigation.navigate('BrutusAI')}
              delay={1900}
              gradient={true}
            />
            
            <ActionCard
              icon="calendar"
              title="Cart & Plan"
              subtitle="Manage your meals"
              onPress={() => navigation.navigate('MealPlanner')}
              delay={2000}
            />
            
            <ActionCard
              icon="person"
              title="Profile"
              subtitle="Account settings"
              onPress={() => navigation.navigate('Profile')}
              delay={2100}
            />
          </View>
        </Animatable.View>

        {/* Recent Activity Section */}
        <Animatable.View animation="fadeIn" delay={800} style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.recentActivityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Completed meal plan</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="heart" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Saved new favorite</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Bottom padding for better scrolling */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  floatingIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  greeting: {
    fontSize: FONT_SIZES.header,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.background,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    marginTop: 120, // Height of the header
  },
  section: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mealPlanCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.heavy,
  },
  planName: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  planDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  nutritionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    width: '48%',
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.medium,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  nutritionTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  nutritionValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  nutritionUnit: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
  },
  costText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.background,
    marginLeft: SPACING.xs,
  },
  costLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  orderButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  orderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  orderButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.background,
    marginHorizontal: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  actionCardContainer: {
    width: '47%',
    marginBottom: SPACING.lg,
    aspectRatio: 1,
  },
  actionCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    ...SHADOWS.medium,
  },
  actionCardGradient: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    lineHeight: FONT_SIZES.md * 1.2,
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.xs * 1.3,
  },
  recentActivityCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
}); 