import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMenuByLocationAndDate, filterByDietaryTags, groupByMealAndStation, MenuItem, GroupedMenu } from '../utils/menuUtils';
import MenuCard from '../components/MenuCard';
import FilterChips from '../components/FilterChips';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import { useFavorites } from '../hooks/useFavorites';
import DatePicker from '../components/DatePicker';

type MenuScreenRouteProp = RouteProp<{
  MenuScreen: {
    location: string;
    date: string;
  };
}, 'MenuScreen'>;

interface Section {
  title: string;
  station: string;
  data: MenuItem[];
}

const MenuScreen: React.FC = () => {
  const route = useRoute<MenuScreenRouteProp>();
  const navigation = useNavigation();
  const { location, date } = route.params;
  
  const [selectedDate, setSelectedDate] = useState(date);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { favorites, toggleFavorite } = useFavorites();
  
  useEffect(() => {
    loadMenuData();
  }, [location, selectedDate]);
  
  useEffect(() => {
    // Apply filters when they change
    const filtered = selectedFilters.length > 0
      ? filterByDietaryTags(menuItems, selectedFilters)
      : menuItems;
    
    setFilteredItems(filtered);
  }, [menuItems, selectedFilters]);
  
  useEffect(() => {
    // Create sections from filtered items
    createSections();
  }, [filteredItems, selectedMealType]);
  
  const loadMenuData = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getMenuByLocationAndDate(location, selectedDate);
      setMenuItems(items);
      
      // Set default meal type if not already set
      if (!selectedMealType && items.length > 0) {
        const mealTypes = [...new Set(items.map(item => item.mealType || 'Other'))];
        setSelectedMealType(mealTypes[0]);
      }
    } catch (error) {
      console.error('Error loading menu data:', error);
      setError('Failed to load menu data. Please try again.');
      Alert.alert('Error', 'Failed to load menu data. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const createSections = () => {
    // Group items by meal type and station
    const grouped = groupByMealAndStation(filteredItems);
    
    // If a meal type is selected, only show that meal type
    const mealTypes = selectedMealType ? [selectedMealType] : Object.keys(grouped);
    
    // Create sections for SectionList
    const newSections: Section[] = [];
    
    mealTypes.forEach(mealType => {
      const stations = grouped[mealType] || {};
      
      Object.keys(stations).forEach(station => {
        newSections.push({
          title: mealType,
          station,
          data: stations[station],
        });
      });
    });
    
    setSections(newSections);
  };
  
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };
  
  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };
  
  const handleMealTypeChange = (mealType: string) => {
    setSelectedMealType(mealType === selectedMealType ? null : mealType);
  };
  
  const getMealTypes = () => {
    if (!menuItems || menuItems.length === 0) {
      return ['No Meals Available'];
    }
    return [...new Set(menuItems.map(item => item.mealType || 'Other'))];
  };
  
  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.station}</Text>
    </View>
  );
  
  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => {
    // Skip rendering section titles or header items
    if (item.isHeader) {
      return null;
    }
    
    return (
      <MenuCard
        item={item}
        index={index}
        isFavorite={item.id ? favorites.includes(item.id) : false}
        onFavoriteToggle={toggleFavorite}
      />
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMenuData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{location}</Text>
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <FilterChips
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          allowMultiple={true}
        />
      </View>
      
      <View style={styles.mealTypesContainer}>
        {getMealTypes().map((mealType) => (
          <TouchableOpacity
            key={mealType}
            style={[
              styles.mealTypeButton,
              selectedMealType === mealType && styles.mealTypeButtonSelected
            ]}
            onPress={() => handleMealTypeChange(mealType)}
          >
            <Text
              style={[
                styles.mealTypeText,
                selectedMealType === mealType && styles.mealTypeTextSelected
              ]}
            >
              {mealType}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No menu items found</Text>
          <Text style={styles.emptySubtext}>
            {selectedFilters.length > 0
              ? 'Try removing some filters'
              : 'This location might not have menu data for the selected date'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.id || item.foodName}-${index}`}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          showsVerticalScrollIndicator={false}
        />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorText: {
    marginTop: SPACING.md,
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mealTypesContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mealTypeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundLight,
  },
  mealTypeButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  mealTypeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  mealTypeTextSelected: {
    color: COLORS.white,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.md,
  },
  sectionHeader: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
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
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default MenuScreen;