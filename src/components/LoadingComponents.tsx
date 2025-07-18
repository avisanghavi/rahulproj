import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

export const SkeletonLoader: React.FC<{
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}> = ({ width, height, borderRadius = BORDER_RADIUS.md, style }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.surface, COLORS.border],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

export const MenuItemSkeleton: React.FC = () => (
  <View style={styles.menuItemSkeleton}>
    <View style={styles.skeletonHeader}>
      <SkeletonLoader width="70%" height={20} />
      <SkeletonLoader width="20%" height={20} />
    </View>
    <SkeletonLoader width="40%" height={14} style={{ marginVertical: SPACING.xs }} />
    <SkeletonLoader width="100%" height={14} style={{ marginBottom: SPACING.sm }} />
    
    <View style={styles.nutritionSkeleton}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.nutritionItem}>
          <SkeletonLoader width={30} height={12} />
          <SkeletonLoader width={25} height={16} style={{ marginTop: SPACING.xs }} />
        </View>
      ))}
    </View>
    
    <View style={styles.tagsSkeleton}>
      {[1, 2, 3].map(i => (
        <SkeletonLoader
          key={i}
          width={60 + i * 10}
          height={24}
          borderRadius={BORDER_RADIUS.lg}
          style={{ marginRight: SPACING.xs }}
        />
      ))}
    </View>
  </View>
);

export const DashboardSkeleton: React.FC = () => (
  <View style={styles.dashboardSkeleton}>
    {/* Header skeleton */}
    <View style={[styles.headerSkeleton, { backgroundColor: COLORS.primary }]}>
      <SkeletonLoader width="60%" height={32} style={{ marginBottom: SPACING.sm }} />
      <SkeletonLoader width="40%" height={18} />
    </View>

    {/* Meal plan card skeleton */}
    <View style={styles.mealPlanSkeleton}>
      <SkeletonLoader width="50%" height={24} style={{ marginBottom: SPACING.lg }} />
      
      <View style={styles.nutritionGridSkeleton}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.nutritionCardSkeleton}>
            <SkeletonLoader width="100%" height={40} />
            <SkeletonLoader width="60%" height={14} style={{ marginTop: SPACING.sm }} />
          </View>
        ))}
      </View>
      
      <SkeletonLoader width="100%" height={48} borderRadius={BORDER_RADIUS.lg} />
    </View>

    {/* Quick actions skeleton */}
    <View style={styles.actionsGridSkeleton}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.actionCardSkeleton}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <SkeletonLoader width="80%" height={16} style={{ marginTop: SPACING.sm }} />
          <SkeletonLoader width="60%" height={12} style={{ marginTop: SPACING.xs }} />
        </View>
      ))}
    </View>
  </View>
);

export const ChatMessageSkeleton: React.FC = () => (
  <View style={styles.chatMessageSkeleton}>
    <View style={styles.aiMessageSkeleton}>
      <View style={styles.aiHeaderSkeleton}>
        <SkeletonLoader width={16} height={16} borderRadius={8} />
        <SkeletonLoader width={60} height={14} style={{ marginLeft: SPACING.xs }} />
      </View>
      <SkeletonLoader width="90%" height={14} style={{ marginBottom: SPACING.xs }} />
      <SkeletonLoader width="70%" height={14} style={{ marginBottom: SPACING.xs }} />
      <SkeletonLoader width="50%" height={14} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  menuItemSkeleton: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  nutritionSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  tagsSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dashboardSkeleton: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSkeleton: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  mealPlanSkeleton: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  nutritionGridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  nutritionCardSkeleton: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '48%',
    marginBottom: SPACING.sm,
  },
  actionsGridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  actionCardSkeleton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chatMessageSkeleton: {
    padding: SPACING.lg,
  },
  aiMessageSkeleton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  aiHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
});

export default {
  SkeletonLoader,
  MenuItemSkeleton,
  DashboardSkeleton,
  ChatMessageSkeleton,
}; 