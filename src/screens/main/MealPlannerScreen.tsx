import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../../constants/theme';
import { allMenuItems } from '../../data/mockData';
import { MenuItem } from '../../types';

interface CartItem extends MenuItem {
  quantity: number;
  scheduledMeal?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  scheduledDate?: Date;
}

interface WeeklyPlan {
  [key: string]: {
    breakfast: CartItem[];
    lunch: CartItem[];
    dinner: CartItem[];
    snack: CartItem[];
  };
}

export default function MealPlannerScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'cart' | 'weekly' | 'budget'>('cart');
  const [diningPlan] = useState('scarlet_14'); // This would come from user profile

  const getDiningPlanInfo = () => {
    const plans = {
      scarlet_14: { swipesPerWeek: 14, name: 'Scarlet 14' },
      gray_10: { swipesPerWeek: 10, name: 'Gray 10' },
      traditions: { swipesPerWeek: 21, name: 'Traditions' }, // 3 meals x 7 days
      carmen_1: { swipesTotal: 165, name: 'Carmen 1' },
      carmen_2: { swipesTotal: 110, name: 'Carmen 2' },
    };
    return plans[diningPlan as keyof typeof plans] || plans.scarlet_14;
  };

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const scheduleItem = (item: CartItem, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', date: Date) => {
    const dateKey = date.toDateString();
    const currentDayPlan = weeklyPlan[dateKey] || { breakfast: [], lunch: [], dinner: [], snack: [] };
    
    setWeeklyPlan({
      ...weeklyPlan,
      [dateKey]: {
        ...currentDayPlan,
        [mealType]: [...currentDayPlan[mealType], { ...item, scheduledMeal: mealType, scheduledDate: date }]
      }
    });
    
    // Remove from cart
    removeFromCart(item.id);
  };

  const calculateCartTotals = () => {
    return cartItems.reduce((totals, item) => ({
      items: totals.items + item.quantity,
      cost: totals.cost + (item.price * item.quantity),
      calories: totals.calories + (item.calories * item.quantity),
      protein: totals.protein + (item.protein * item.quantity),
    }), { items: 0, cost: 0, calories: 0, protein: 0 });
  };

  const getWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const calculateWeeklySwipes = () => {
    const weekDates = getWeekDates();
    return weekDates.reduce((total, date) => {
      const dayPlan = weeklyPlan[date.toDateString()];
      if (!dayPlan) return total;
      
      const daySwipes = Object.values(dayPlan).flat().length;
      return total + daySwipes;
    }, 0);
  };

  const totals = calculateCartTotals();
  const planInfo = getDiningPlanInfo();
  const weeklySwipes = calculateWeeklySwipes();

  const CartView = () => (
    <View style={styles.cartContainer}>
      <Text style={styles.sectionTitle}>Shopping Cart ({totals.items} items)</Text>
      
      {cartItems.length === 0 ? (
        <Animatable.View animation="fadeIn" style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartText}>Browse the menu to add items to your cart</Text>
        </Animatable.View>
      ) : (
        <>
          <ScrollView style={styles.cartItems}>
            {cartItems.map((item, index) => (
              <Animatable.View
                key={item.id}
                animation="slideInRight"
                delay={index * 100}
                style={styles.cartItem}
              >
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemDetails}>
                    {item.calories} cal • ${item.price.toFixed(2)} each
                  </Text>
                  <Text style={styles.cartItemLocation}>{item.location}</Text>
                </View>
                
                <View style={styles.cartItemControls}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.scheduleButton}
                    onPress={() => {
                      Alert.alert(
                        'Schedule Meal',
                        'When would you like to eat this?',
                        [
                          { text: 'Breakfast', onPress: () => scheduleItem(item, 'breakfast', selectedDate) },
                          { text: 'Lunch', onPress: () => scheduleItem(item, 'lunch', selectedDate) },
                          { text: 'Dinner', onPress: () => scheduleItem(item, 'dinner', selectedDate) },
                          { text: 'Snack', onPress: () => scheduleItem(item, 'snack', selectedDate) },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="calendar" size={16} color={COLORS.background} />
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            ))}
          </ScrollView>
          
          <View style={styles.cartSummary}>
            <View style={styles.cartTotals}>
              <View style={styles.cartTotalRow}>
                <Text style={styles.cartTotalLabel}>Total Cost:</Text>
                <Text style={styles.cartTotalValue}>${totals.cost.toFixed(2)}</Text>
              </View>
              <View style={styles.cartTotalRow}>
                <Text style={styles.cartTotalLabel}>Total Calories:</Text>
                <Text style={styles.cartTotalValue}>{totals.calories}</Text>
              </View>
              <View style={styles.cartTotalRow}>
                <Text style={styles.cartTotalLabel}>Total Protein:</Text>
                <Text style={styles.cartTotalValue}>{totals.protein.toFixed(0)}g</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.checkoutButton}>
              <LinearGradient
                colors={[COLORS.primary, '#AA0000']}
                style={styles.checkoutButtonGradient}
              >
                <Ionicons name="bag" size={20} color={COLORS.background} />
                <Text style={styles.checkoutButtonText}>Order via Grubhub</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const WeeklyView = () => (
    <View style={styles.weeklyContainer}>
      <Text style={styles.sectionTitle}>Weekly Meal Plan</Text>
      
      <View style={styles.diningPlanInfo}>
        <Text style={styles.diningPlanText}>
          {planInfo.name} Plan - {weeklySwipes}/{('swipesPerWeek' in planInfo) ? planInfo.swipesPerWeek : '∞'} swipes used this week
        </Text>
        {('swipesPerWeek' in planInfo) && (
          <View style={styles.swipeProgressBar}>
            <View 
              style={[
                styles.swipeProgress, 
                { width: `${Math.min((weeklySwipes / planInfo.swipesPerWeek) * 100, 100)}%` }
              ]} 
            />
          </View>
        )}
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll}>
        {getWeekDates().map((date, index) => {
          const dayPlan = weeklyPlan[date.toDateString()];
          const daySwipes = dayPlan ? Object.values(dayPlan).flat().length : 0;
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <TouchableOpacity
              key={date.toDateString()}
              style={[styles.dayCard, isToday && styles.todayCard]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayName, isToday && styles.todayText]}>
                {date.toLocaleDateString('en', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dayDate, isToday && styles.todayText]}>
                {date.getDate()}
              </Text>
              <Text style={styles.daySwipes}>{daySwipes} meals</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Selected day details would go here */}
      <View style={styles.selectedDayPlan}>
        <Text style={styles.selectedDayTitle}>
          {selectedDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        {/* Add meal sections for the selected day */}
      </View>
    </View>
  );

  const BudgetView = () => (
    <View style={styles.budgetContainer}>
      <Text style={styles.sectionTitle}>Budget Tracking</Text>
      
      <View style={styles.budgetCard}>
        <Text style={styles.budgetTitle}>Weekly Spending</Text>
        <Text style={styles.budgetAmount}>${totals.cost.toFixed(2)}</Text>
        <Text style={styles.budgetSubtext}>of $175 weekly budget</Text>
        
        <View style={styles.budgetProgressBar}>
          <View style={[styles.budgetProgress, { width: `${Math.min((totals.cost / 175) * 100, 100)}%` }]} />
        </View>
      </View>
      
      {/* Add more budget tracking features */}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with view mode toggle */}
      <View style={styles.header}>
        <View style={styles.headerTabs}>
          {[
            { key: 'cart', label: 'Cart', icon: 'cart' },
            { key: 'weekly', label: 'Weekly', icon: 'calendar' },
            { key: 'budget', label: 'Budget', icon: 'wallet' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.headerTab, viewMode === tab.key && styles.activeHeaderTab]}
              onPress={() => setViewMode(tab.key as any)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={viewMode === tab.key ? COLORS.background : COLORS.textSecondary} 
              />
              <Text style={[
                styles.headerTabText,
                viewMode === tab.key && styles.activeHeaderTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content based on view mode */}
      {viewMode === 'cart' && <CartView />}
      {viewMode === 'weekly' && <WeeklyView />}
      {viewMode === 'budget' && <BudgetView />}

      {/* Quick add popular items */}
      <View style={styles.quickAdd}>
        <Text style={styles.quickAddTitle}>Quick Add Popular Items</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allMenuItems.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickAddItem}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.quickAddName}>{item.name}</Text>
              <Text style={styles.quickAddPrice}>${item.price.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
  },
  headerTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.xs,
  },
  activeHeaderTab: {
    backgroundColor: COLORS.primary,
  },
  headerTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  activeHeaderTabText: {
    color: COLORS.background,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    margin: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cartContainer: {
    flex: 1,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyCartTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyCartText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  cartItems: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cartItemDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  cartItemLocation: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  cartItemControls: {
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  quantityButton: {
    padding: SPACING.xs,
  },
  quantityText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SPACING.sm,
    minWidth: 30,
    textAlign: 'center',
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  cartSummary: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cartTotals: {
    marginBottom: SPACING.lg,
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cartTotalLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  cartTotalValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  checkoutButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  checkoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  checkoutButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.background,
    marginLeft: SPACING.sm,
  },
  weeklyContainer: {
    flex: 1,
  },
  diningPlanInfo: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  diningPlanText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  swipeProgressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
  },
  swipeProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  weekScroll: {
    paddingHorizontal: SPACING.lg,
  },
  dayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  todayCard: {
    backgroundColor: COLORS.primary,
  },
  dayName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  dayDate: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  daySwipes: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  todayText: {
    color: COLORS.background,
  },
  selectedDayPlan: {
    margin: SPACING.lg,
  },
  selectedDayTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  budgetContainer: {
    flex: 1,
  },
  budgetCard: {
    backgroundColor: COLORS.background,
    margin: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  budgetTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  budgetAmount: {
    fontSize: FONT_SIZES.header,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  budgetSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  budgetProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
  budgetProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  quickAdd: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickAddTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickAddItem: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 120,
  },
  quickAddName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quickAddPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
}); 