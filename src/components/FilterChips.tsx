import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface FilterChip {
  id: string;
  label: string;
  icon?: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  allowMultiple?: boolean;
}

const DIETARY_FILTERS: FilterChip[] = [
  { id: 'all', label: 'All', icon: 'restaurant-outline' },
  { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf-outline' },
  { id: 'vegan', label: 'Vegan', icon: 'nutrition-outline' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: 'medical-outline' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: 'water-outline' },
  { id: 'nut-free', label: 'Nut-Free', icon: 'alert-circle-outline' },
];

const FilterChips: React.FC<FilterChipsProps> = ({ 
  filters = DIETARY_FILTERS, 
  selectedFilters, 
  onFilterChange,
  allowMultiple = false
}) => {
  
  const handleFilterPress = (filterId: string) => {
    if (filterId === 'all') {
      // If "All" is selected, clear all other filters
      onFilterChange([]);
      return;
    }
    
    if (allowMultiple) {
      // Toggle the selected filter
      if (selectedFilters.includes(filterId)) {
        onFilterChange(selectedFilters.filter(id => id !== filterId));
      } else {
        onFilterChange([...selectedFilters, filterId]);
      }
    } else {
      // Select only this filter
      onFilterChange([filterId]);
    }
  };
  
  const isFilterSelected = (filterId: string) => {
    if (filterId === 'all') {
      return selectedFilters.length === 0;
    }
    return selectedFilters.includes(filterId);
  };
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.chip,
            isFilterSelected(filter.id) && styles.chipSelected
          ]}
          onPress={() => handleFilterPress(filter.id)}
          activeOpacity={0.7}
        >
          {filter.icon && (
            <Ionicons 
              name={filter.icon as any} 
              size={16} 
              color={isFilterSelected(filter.id) ? COLORS.white : COLORS.primary} 
              style={styles.chipIcon}
            />
          )}
          <Text 
            style={[
              styles.chipText,
              isFilterSelected(filter.id) && styles.chipTextSelected
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipIcon: {
    marginRight: SPACING.xs,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
});

export default FilterChips;