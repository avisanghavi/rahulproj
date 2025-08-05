import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { MenuItem } from '../utils/menuUtils';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface MenuCardProps {
  item: MenuItem;
  index: number;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onAddToMealPlan?: (item: MenuItem) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ 
  item, 
  index, 
  isFavorite = false,
  onFavoriteToggle,
  onAddToMealPlan
}) => {
  
  const handleFavoritePress = () => {
    if (onFavoriteToggle && item.id) {
      onFavoriteToggle(item.id);
    }
  };
  
  const handleAddToMealPlan = () => {
    if (onAddToMealPlan) {
      onAddToMealPlan(item);
    }
  };
  
  const handlePress = () => {
    // For now, just toggle favorite on press
    handleFavoritePress();
  };

  // Get the display name - Firebase data might use 'name' instead of 'foodName'
  const displayName = item.foodName || item.name || 'Unknown Item';
  
  // Ensure item has tags array to avoid errors
  if (!item.tags) {
    item.tags = [];
  }
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100, type: 'timing', duration: 300 }}
      style={styles.container}
    >
      <Pressable 
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed
        ]}
        onPress={handlePress}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{displayName}</Text>
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={handleFavoritePress}
            >
              <Ionicons 
                name={isFavorite ? 'star' : 'star-outline'} 
                size={22} 
                color={isFavorite ? COLORS.warning : COLORS.textLight} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.details}>
            {item.category && (
              <Text style={styles.category}>{item.category}</Text>
            )}
            {item.servingSize && (
              <Text style={styles.servingSize}>{item.servingSize}</Text>
            )}
          </View>
          
          {(item.description || item.text) && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description} numberOfLines={2}>
                {item.description || item.text}
              </Text>
            </View>
          )}
          
          <View style={styles.footer}>
            <View style={styles.tagsContainer}>
              {item.tags && item.tags.length > 0 && item.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.priceContainer}>
              {item.price > 0 && (
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              )}
            </View>
          </View>
          
          {onAddToMealPlan && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddToMealPlan}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  cardPressed: {
    opacity: 0.9,
    backgroundColor: COLORS.backgroundLight,
  },
  content: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.md,
  },
  favoriteButton: {
    padding: SPACING.xs,
    marginRight: -SPACING.xs,
  },
  details: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    alignItems: 'center',
  },
  category: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginRight: SPACING.md,
  },
  servingSize: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  descriptionContainer: {
    marginTop: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  priceContainer: {
    marginLeft: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  addButton: {
    position: 'absolute',
    bottom: -SPACING.xs,
    right: -SPACING.xs,
    padding: SPACING.xs,
  },
});

export default MenuCard;