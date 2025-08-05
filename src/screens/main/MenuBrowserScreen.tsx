import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS, OSU_BRANDING, TYPOGRAPHY } from '../../constants/theme';
import { Keyboard } from 'react-native';
import { MenuItem, DiningLocation } from '../../types';
import { getAllMenuItems, getDiningLocations, searchMenuItems } from '../../services/dataService';

const { width: screenWidth } = Dimensions.get('window');

export default function MenuBrowserScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRestaurantSearchFocused, setIsRestaurantSearchFocused] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [diningLocations, setDiningLocations] = useState<DiningLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused]);

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [menuItems, locations] = await Promise.all([
          getAllMenuItems(),
          getDiningLocations(),
        ]);
        setAllMenuItems(menuItems);
        setDiningLocations(locations);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get unique restaurants from menu items
  const availableRestaurants = [...new Set(allMenuItems.map(item => item.location))];
  
  // Filter restaurants based on search
  const filteredRestaurants = availableRestaurants.filter(restaurant => 
    restaurant.toLowerCase().includes(restaurantSearchQuery.toLowerCase())
  );
  
  // Get items for selected restaurant
  const restaurantItems = allMenuItems.filter(item => 
    selectedLocation === 'all' || item.location === selectedLocation
  );
  
  const filteredItems = restaurantItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'calories':
          return a.calories - b.calories;
        case 'popularity':
          return (b.calories || 0) - (a.calories || 0); // Using calories as proxy for popularity
        default:
          return 0;
      }
    });

  const categories = ['all', 'entree', 'side', 'dessert', 'beverage', 'snack'];



  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
  };

  const addToCart = (itemId: string) => {
    const newCartItems = new Set(cartItems);
    newCartItems.add(itemId);
    setCartItems(newCartItems);
  };

  const removeFromCart = (itemId: string) => {
    const newCartItems = new Set(cartItems);
    newCartItems.delete(itemId);
    setCartItems(newCartItems);
  };



  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      entree: COLORS.primary,
      side: COLORS.success,
      dessert: COLORS.warning,
      beverage: COLORS.info,
      snack: COLORS.secondary,
    };
    return colors[category] || COLORS.textSecondary;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      all: 'grid',
      entree: 'restaurant',
      side: 'leaf',
      dessert: 'ice-cream',
      beverage: 'cafe',
      snack: 'fast-food',
    };
    return icons[category] || 'ellipse';
  };

  // Grubhub-inspired modern card design
  const MenuItemCard = ({ item, index }: { item: MenuItem; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 50}
      duration={600}
      style={styles.modernCard}
    >
      <TouchableOpacity 
        style={styles.cardContainer}
        activeOpacity={0.95}
      >
        {/* Food Image Placeholder */}
        <View style={styles.imageContainer}>
          <LinearGradient
            colors={[`${getCategoryColor(item.category)}20`, `${getCategoryColor(item.category)}40`]}
            style={styles.imagePlaceholder}
          >
            <Ionicons 
              name={getCategoryIcon(item.category) as any} 
              size={32} 
              color={getCategoryColor(item.category)} 
            />
          </LinearGradient>
          
          {/* Favorite Button */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons 
              name={favorites.has(item.id) ? 'heart' : 'heart-outline'} 
              size={18} 
              color={favorites.has(item.id) ? COLORS.primary : COLORS.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.modernItemName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.modernPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </View>

          {item.description && (
            <Text style={styles.modernDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {/* Location and Category */}
          <View style={styles.metaInfo}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.locationText}>
                {item.location.replace('Traditions at ', '').replace(' at Scott', '')}
              </Text>
            </View>
            
            <View style={[styles.categoryChip, { backgroundColor: `${getCategoryColor(item.category)}15` }]}>
              <Text style={[styles.categoryChipText, { color: getCategoryColor(item.category) }]}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
            </View>
          </View>

          {/* Nutrition Info */}
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <Ionicons name="flame-outline" size={14} color={COLORS.primary} />
              <Text style={styles.nutritionText}>{item.calories} cal</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Ionicons name="fitness-outline" size={14} color={COLORS.success} />
              <Text style={styles.nutritionText}>{item.protein}g protein</Text>
            </View>
          </View>

          {/* Allergen Info */}
          {item.allergens.length > 0 && (
            <View style={styles.allergenContainer}>
              <Ionicons name="warning-outline" size={12} color={COLORS.warning} />
              <Text style={styles.allergenText}>
                Contains: {item.allergens.join(', ')}
              </Text>
            </View>
          )}

          {/* Add to Cart Button */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => cartItems.has(item.id) ? removeFromCart(item.id) : addToCart(item.id)}
          >
            <LinearGradient
              colors={cartItems.has(item.id) ? [COLORS.success, '#228B22'] : [COLORS.primary, '#AA0000']}
              style={styles.addButtonGradient}
            >
              <Ionicons 
                name={cartItems.has(item.id) ? "checkmark" : "add"} 
                size={16} 
                color={COLORS.background} 
              />
              <Text style={styles.addButtonText}>
                {cartItems.has(item.id) ? "Added" : "Add to Cart"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const CategoryFilter = ({ category }: { category: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryFilter,
        selectedCategory === category && styles.selectedCategoryFilter
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Ionicons 
        name={getCategoryIcon(category) as any} 
        size={16} 
        color={selectedCategory === category ? COLORS.background : COLORS.textSecondary} 
      />
      <Text style={[
        styles.categoryFilterText,
        selectedCategory === category && styles.selectedCategoryFilterText
      ]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </TouchableOpacity>
  );



  const SortModal = () => (
    showSortModal && (
      <Animated.View 
        style={[
          styles.modalOverlay,
          {
            opacity: modalAnimation,
            transform: [{
              scale: modalAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity style={styles.modalBackground} onPress={() => setShowSortModal(false)} />
        <Animatable.View 
          animation="slideInUp" 
          duration={300}
          style={styles.modernModal}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {[
              { key: 'name', label: 'Name (A-Z)', icon: 'text' },
              { key: 'price', label: 'Price (Low to High)', icon: 'trending-up' },
              { key: 'price-high', label: 'Price (High to Low)', icon: 'trending-down' },
              { key: 'calories', label: 'Calories (Low to High)', icon: 'flame' },
              { key: 'popularity', label: 'Popularity', icon: 'star' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[styles.modalItem, sortBy === option.key && styles.selectedModalItem]}
                onPress={() => {
                  setSortBy(option.key);
                  setShowSortModal(false);
                }}
              >
                <Ionicons name={option.icon as any} size={20} color={COLORS.textSecondary} />
                <Text style={[styles.modalItemText, sortBy === option.key && styles.selectedModalItemText]}>
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animatable.View>
      </Animated.View>
    )
  );

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF5F5', '#FFE6E6', '#FFCCCC']}
      style={styles.container}
    >
      {/* Enhanced OSU-Themed Header */}
      <Animatable.View animation="slideInDown" style={styles.modernHeader}>
        <LinearGradient
          colors={COLORS.scarletGradient}
          style={styles.headerGradient}
        >
          {/* Campus Icons Background */}
          <View style={styles.campusIconsBackground}>
            <Animatable.Text 
              animation="pulse" 
              iterationCount="infinite"
              style={styles.campusIcon}
            >
              {OSU_BRANDING.stadium}
            </Animatable.Text>
            <Animatable.Text 
              animation="pulse" 
              iterationCount="infinite"
              delay={500}
              style={styles.campusIcon}
            >
              {OSU_BRANDING.campus}
            </Animatable.Text>
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Dining Menu {OSU_BRANDING.buckeye}</Text>
              <View style={styles.headerAccent} />
            </View>
            <Text style={styles.headerSubtitle}>Fuel your Buckeye spirit with great food</Text>
          </View>
        </LinearGradient>
      </Animatable.View>

      {/* Restaurant Search Bar */}
      <Animatable.View animation="fadeInUp" delay={200} style={styles.searchContainer}>
        <Animated.View style={[
          styles.searchBar,
          {
            borderColor: searchAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [COLORS.border, COLORS.primary],
            }),
          }
        ]}>
          <Ionicons name="restaurant" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for restaurants..."
            value={restaurantSearchQuery}
            onChangeText={setRestaurantSearchQuery}
            onFocus={() => setIsRestaurantSearchFocused(true)}
            onBlur={() => setIsRestaurantSearchFocused(false)}
            placeholderTextColor={COLORS.textSecondary}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (restaurantSearchQuery.trim()) {
                Keyboard.dismiss();
              }
            }}
          />
          {restaurantSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setRestaurantSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animatable.View>

      {/* Restaurant Selection */}
      {filteredRestaurants.length > 0 && (
        <Animatable.View animation="fadeInUp" delay={300} style={styles.restaurantContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.restaurantScroll}
            contentContainerStyle={styles.restaurantScrollContent}
          >
            {filteredRestaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant}
                style={[
                  styles.restaurantChip,
                  selectedLocation === restaurant && styles.selectedRestaurantChip
                ]}
                onPress={() => setSelectedLocation(restaurant)}
              >
                <Ionicons 
                  name="restaurant" 
                  size={16} 
                  color={selectedLocation === restaurant ? COLORS.background : COLORS.primary} 
                />
                <Text style={[
                  styles.restaurantChipText,
                  selectedLocation === restaurant && styles.selectedRestaurantChipText
                ]}>
                  {restaurant.replace('Traditions at ', '').replace(' at Scott', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animatable.View>
      )}

      {/* Food Search Bar - Only show when restaurant is selected */}
      {selectedLocation !== 'all' && (
        <Animatable.View animation="fadeInUp" delay={400} style={styles.searchContainer}>
          <Animated.View style={[
            styles.searchBar,
            {
              borderColor: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [COLORS.border, COLORS.primary],
              }),
            }
          ]}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search for food in ${selectedLocation.replace('Traditions at ', '').replace(' at Scott', '')}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  Keyboard.dismiss();
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animatable.View>
      )}

      {/* Category Filters */}
      <Animatable.View animation="fadeInUp" delay={400} style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <CategoryFilter key={category} category={category} />
          ))}
        </ScrollView>
      </Animatable.View>

      {/* Results Header with Separate Sort Button */}
      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsText}>
            {filteredItems.length} items found
          </Text>
          {selectedLocation !== 'all' && (
            <Text style={styles.selectedRestaurantText}>
              in {selectedLocation.replace('Traditions at ', '').replace(' at Scott', '')}
            </Text>
          )}
        </View>
      </View>
      
      {/* Separate Sort Button */}
      <View style={styles.sortContainer}>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
          <Ionicons name="funnel-outline" size={16} color={COLORS.primary} />
          <Text style={styles.sortButtonText}>Sort by {sortBy === 'name' ? 'Name' : sortBy === 'price' ? 'Price (Low)' : sortBy === 'price-high' ? 'Price (High)' : sortBy === 'calories' ? 'Calories' : 'Popularity'}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Menu Items Grid */}
      <FlatList
        data={filteredItems}
        renderItem={({ item, index }) => <MenuItemCard item={item} index={index} />}
        keyExtractor={(item) => item.id}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuList}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Floating Cart Button */}
      {cartItems.size > 0 && (
        <Animatable.View
          animation="bounceInUp"
          style={styles.floatingCartButton}
        >
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('MealPlanner' as never)}
          >
            <LinearGradient
              colors={[COLORS.primary, '#AA0000']}
              style={styles.cartButtonGradient}
            >
              <Ionicons name="cart" size={20} color={COLORS.background} />
              <Text style={styles.cartButtonText}>
                Cart ({cartItems.size})
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      )}

      <SortModal />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modernHeader: {
    paddingTop: 0,
  },
  headerGradient: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZES.header,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.background,
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    ...SHADOWS.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: '70%',
  },
  locationButtonText: {
    flex: 1,
    marginHorizontal: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContainer: {
    paddingRight: SPACING.lg,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCategoryFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryFilterText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedCategoryFilterText: {
    color: COLORS.background,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  resultsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  sortContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
  },
  sortButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    marginHorizontal: SPACING.xs,
  },
  menuList: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  modernCard: {
    marginBottom: SPACING.lg,
  },
  cardContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.xs,
    ...SHADOWS.light,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  modernItemName: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  priceContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  modernPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modernDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  categoryChip: {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  nutritionRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  nutritionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  allergenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  allergenText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
  },
  addButton: {
    marginTop: SPACING.sm,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  addButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modernModal: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  selectedModalItem: {
    backgroundColor: COLORS.surface,
  },
  modalItemContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  modalItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedModalItemText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalItemAddress: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 100,
    right: SPACING.lg,
    zIndex: 1000,
  },
  cartButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  cartButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.background,
    marginLeft: SPACING.sm,
  },
  
  // Enhanced OSU Header Styles
  campusIconsBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    opacity: 0.2,
  },
  campusIcon: {
    fontSize: 40,
    marginHorizontal: SPACING.sm,
  },
  headerContent: {
    zIndex: 1,
  },
  headerTitleContainer: {
    alignItems: 'flex-start',
  },
  headerAccent: {
    width: 50,
    height: 3,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    marginTop: SPACING.xs,
  },
  // Restaurant selection styles
  restaurantContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  restaurantScroll: {
    maxHeight: 60,
  },
  restaurantScrollContent: {
    paddingRight: SPACING.lg,
  },
  restaurantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedRestaurantChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  restaurantChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  selectedRestaurantChipText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  selectedRestaurantText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
}); 