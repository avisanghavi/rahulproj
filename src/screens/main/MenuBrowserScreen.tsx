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
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../../constants/theme';
import { allMenuItems, diningLocations } from '../../data/mockData';
import { MenuItem, DiningLocation } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

export default function MenuBrowserScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
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

  const filteredItems = allMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  const categories = ['all', 'entree', 'side', 'dessert', 'beverage', 'snack'];

  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName);
    setShowLocationModal(false);
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const openLocationModal = () => {
    setShowLocationModal(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeLocationModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowLocationModal(false));
  };

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
  };

  const getLocationDisplayName = () => {
    if (selectedLocation === 'all') return 'All Locations';
    const location = diningLocations.find(loc => loc.name === selectedLocation);
    return location ? location.name.replace('Traditions at ', '').replace(' at Scott', '') : selectedLocation;
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
          <TouchableOpacity style={styles.addButton}>
            <LinearGradient
              colors={[COLORS.primary, '#AA0000']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={16} color={COLORS.background} />
              <Text style={styles.addButtonText}>Add to Plan</Text>
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

  const LocationModal = () => (
    showLocationModal && (
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
        <TouchableOpacity style={styles.modalBackground} onPress={closeLocationModal} />
        <Animatable.View 
          animation="slideInUp" 
          duration={300}
          style={styles.modernModal}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Location</Text>
            <TouchableOpacity onPress={closeLocationModal}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.modalItem, selectedLocation === 'all' && styles.selectedModalItem]}
              onPress={() => handleLocationSelect('all')}
            >
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={[styles.modalItemText, selectedLocation === 'all' && styles.selectedModalItemText]}>
                All Locations
              </Text>
              {selectedLocation === 'all' && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
            
            {diningLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[styles.modalItem, selectedLocation === location.name && styles.selectedModalItem]}
                onPress={() => handleLocationSelect(location.name)}
              >
                <Ionicons name="restaurant" size={20} color={COLORS.textSecondary} />
                <View style={styles.modalItemContent}>
                  <Text style={[styles.modalItemText, selectedLocation === location.name && styles.selectedModalItemText]}>
                    {location.name.replace('Traditions at ', '')}
                  </Text>
                  <Text style={styles.modalItemAddress}>{location.address}</Text>
                </View>
                {selectedLocation === location.name && (
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
    <View style={styles.container}>
      {/* Enhanced Header */}
      <Animatable.View animation="slideInDown" style={styles.modernHeader}>
        <LinearGradient
          colors={['#BB0000', '#990000']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Menu</Text>
          <Text style={styles.headerSubtitle}>Discover delicious meals</Text>
        </LinearGradient>
      </Animatable.View>

      {/* Enhanced Search Bar */}
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
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food, restaurants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholderTextColor={COLORS.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animatable.View>

      {/* Filters */}
      <Animatable.View animation="fadeInUp" delay={400} style={styles.filtersContainer}>
        <TouchableOpacity style={styles.locationButton} onPress={openLocationModal}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={styles.locationButtonText} numberOfLines={1}>
            {getLocationDisplayName()}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
        </TouchableOpacity>

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

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredItems.length} items found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>Sort by</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
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

      <LocationModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modernHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
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
}); 