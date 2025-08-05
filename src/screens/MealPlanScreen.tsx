import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMealPlan, MealPlan, NutritionSummary } from '../hooks/useMealPlan';
import { MenuItem, formatDate, getTodayDate } from '../utils/menuUtils';
import DatePicker from '../components/DatePicker';
import MenuCard from '../components/MenuCard';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const MealPlanScreen: React.FC = () => {
  const { user } = useAuth();
  const { 
    mealPlans, 
    loading, 
    createMealPlan, 
    deleteMealPlan, 
    removeItemFromMealPlan,
    calculateNutrition,
    refreshMealPlans
  } = useMealPlan();
  
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  useEffect(() => {
    if (!user) return;
    
    refreshMealPlans();
  }, [user]);
  
  useEffect(() => {
    // Find plan for selected date
    const plan = mealPlans.find(p => p.date === selectedDate);
    setSelectedPlan(plan || null);
    setPlanName(plan?.name || `Meal Plan for ${formatDisplayDate(selectedDate)}`);
    
    // Calculate nutrition if plan exists
    if (plan) {
      setNutritionSummary(calculateNutrition(plan.items));
    } else {
      setNutritionSummary({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    }
  }, [mealPlans, selectedDate]);
  
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };
  
  const handleCreatePlan = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a meal plan');
      return;
    }
    
    try {
      setIsCreatingPlan(true);
      
      const newPlanId = await createMealPlan({
        date: selectedDate,
        name: planName,
        items: []
      });
      
      if (newPlanId) {
        Alert.alert('Success', 'Meal plan created successfully');
        refreshMealPlans();
      } else {
        Alert.alert('Error', 'Failed to create meal plan');
      }
    } catch (error) {
      console.error('Error creating meal plan:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsCreatingPlan(false);
    }
  };
  
  const handleDeletePlan = () => {
    if (!selectedPlan) return;
    
    Alert.alert(
      'Delete Meal Plan',
      'Are you sure you want to delete this meal plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await deleteMealPlan(selectedPlan.id);
            if (success) {
              setSelectedPlan(null);
              refreshMealPlans();
            } else {
              Alert.alert('Error', 'Failed to delete meal plan');
            }
          }
        }
      ]
    );
  };
  
  const handleRemoveItem = async (itemId: string) => {
    if (!selectedPlan) return;
    
    const success = await removeItemFromMealPlan(selectedPlan.id, itemId);
    if (success) {
      refreshMealPlans();
    } else {
      Alert.alert('Error', 'Failed to remove item from meal plan');
    }
  };
  
  const renderMealPlanItem = ({ item, index }: { item: MenuItem; index: number }) => (
    <MenuCard
      item={item}
      index={index}
      onAddToMealPlan={() => {
        Alert.alert(
          'Remove Item',
          'Do you want to remove this item from your meal plan?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Remove', 
              style: 'destructive',
              onPress: () => handleRemoveItem(item.id || '')
            }
          ]
        );
      }}
    />
  );
  
  const renderEmptyPlan = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No meal plan for this date</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreatePlan}
        disabled={isCreatingPlan}
      >
        {isCreatingPlan ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.createButtonText}>Create Meal Plan</Text>
        )}
      </TouchableOpacity>
    </View>
  );
  
  const renderNutritionSummary = () => (
    <View style={styles.nutritionContainer}>
      <Text style={styles.nutritionTitle}>Nutrition Summary</Text>
      <View style={styles.nutritionGrid}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{nutritionSummary.calories}</Text>
          <Text style={styles.nutritionLabel}>Calories</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{nutritionSummary.protein.toFixed(1)}g</Text>
          <Text style={styles.nutritionLabel}>Protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{nutritionSummary.carbs.toFixed(1)}g</Text>
          <Text style={styles.nutritionLabel}>Carbs</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{nutritionSummary.fat.toFixed(1)}g</Text>
          <Text style={styles.nutritionLabel}>Fat</Text>
        </View>
      </View>
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading meal plans...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Meal Planner</Text>
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </View>
      
      {selectedPlan ? (
        <>
          <View style={styles.planHeader}>
            <TextInput
              style={styles.planNameInput}
              value={planName}
              onChangeText={setPlanName}
              placeholder="Plan Name"
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePlan}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
          
          {renderNutritionSummary()}
          
          <FlatList
            data={selectedPlan.items}
            keyExtractor={(item) => item.id || `${item.foodName}-${Math.random()}`}
            renderItem={renderMealPlanItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyItemsContainer}>
                <Text style={styles.emptyItemsText}>
                  No items in this meal plan yet.
                </Text>
                <Text style={styles.emptyItemsSubtext}>
                  Add items from the Menu Browser.
                </Text>
              </View>
            }
          />
        </>
      ) : (
        renderEmptyPlan()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  planNameInput: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '500',
    color: COLORS.text,
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  emptyItemsContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyItemsText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyItemsSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  nutritionContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  nutritionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  nutritionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});

export default MealPlanScreen;