import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../../constants/theme';
import { allMenuItems } from '../../data/mockData';
import { MenuItem } from '../../types';

interface MealPlan {
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
  snacks: MenuItem[];
}

export default function MealPlannerScreen() {
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });

  const calculateTotals = () => {
    const allItems = [...mealPlan.breakfast, ...mealPlan.lunch, ...mealPlan.dinner, ...mealPlan.snacks];
    return {
      calories: allItems.reduce((sum, item) => sum + item.calories, 0),
      protein: allItems.reduce((sum, item) => sum + item.protein, 0),
      carbs: allItems.reduce((sum, item) => sum + item.carbs, 0),
      fat: allItems.reduce((sum, item) => sum + item.fat, 0),
      cost: allItems.reduce((sum, item) => sum + item.price, 0),
    };
  };

  const addToMeal = (item: MenuItem, mealType: keyof MealPlan) => {
    setMealPlan(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], item],
    }));
  };

  const removeFromMeal = (itemId: string, mealType: keyof MealPlan) => {
    setMealPlan(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter(item => item.id !== itemId),
    }));
  };

  const clearPlan = () => {
    setMealPlan({
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    });
  };

  const totals = calculateTotals();

  const MealSection = ({ title, mealType, items, icon }: {
    title: string;
    mealType: keyof MealPlan;
    items: MenuItem[];
    icon: string;
  }) => (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        <Ionicons name={icon as any} size={20} color={COLORS.primary} />
        <Text style={styles.mealTitle}>{title}</Text>
      </View>
      
      <View style={styles.mealItems}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>Tap + to add items</Text>
        ) : (
          items.map(item => (
            <View key={`${item.id}-${Math.random()}`} style={styles.mealItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                  {item.calories} cal • ${item.price.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => removeFromMeal(item.id, mealType)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const QuickAddItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity style={styles.quickAddItem}>
      <Text style={styles.quickAddName}>{item.name}</Text>
      <Text style={styles.quickAddDetails}>{item.calories} cal • ${item.price.toFixed(2)}</Text>
      
      <View style={styles.addButtons}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addToMeal(item, 'breakfast')}
        >
          <Text style={styles.addButtonText}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addToMeal(item, 'lunch')}
        >
          <Text style={styles.addButtonText}>L</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addToMeal(item, 'dinner')}
        >
          <Text style={styles.addButtonText}>D</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addToMeal(item, 'snacks')}
        >
          <Text style={styles.addButtonText}>S</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Nutrition Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Plan</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.calories}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.protein.toFixed(0)}g</Text>
            <Text style={styles.summaryLabel}>Protein</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.carbs.toFixed(0)}g</Text>
            <Text style={styles.summaryLabel}>Carbs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.fat.toFixed(0)}g</Text>
            <Text style={styles.summaryLabel}>Fat</Text>
          </View>
        </View>
        
        <View style={styles.costContainer}>
          <Text style={styles.costText}>Total Cost: ${totals.cost.toFixed(2)}</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearPlan}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Meal Sections */}
      <MealSection 
        title="Breakfast" 
        mealType="breakfast" 
        items={mealPlan.breakfast}
        icon="sunny"
      />
      <MealSection 
        title="Lunch" 
        mealType="lunch" 
        items={mealPlan.lunch}
        icon="partly-sunny"
      />
      <MealSection 
        title="Dinner" 
        mealType="dinner" 
        items={mealPlan.dinner}
        icon="moon"
      />
      <MealSection 
        title="Snacks" 
        mealType="snacks" 
        items={mealPlan.snacks}
        icon="cafe"
      />

      {/* Quick Add Section */}
      <View style={styles.quickAddSection}>
        <Text style={styles.sectionTitle}>Quick Add Items</Text>
        <Text style={styles.sectionSubtitle}>Tap B/L/D/S to add to meals</Text>
        
        {allMenuItems.slice(0, 8).map(item => (
          <QuickAddItem key={item.id} item={item} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  clearButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  clearButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  mealSection: {
    backgroundColor: COLORS.background,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mealTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  mealItems: {
    padding: SPACING.lg,
    minHeight: 80,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.md,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  itemDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  quickAddSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  quickAddItem: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  quickAddName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quickAddDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  addButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 40,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
}); 