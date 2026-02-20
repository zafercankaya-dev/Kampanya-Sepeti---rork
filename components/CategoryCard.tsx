import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import {
  Monitor, Shirt, ShoppingCart, Home, Sparkles,
  Dumbbell, BookOpen, UtensilsCrossed,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Category } from '@/types';
import { useFollow } from '@/contexts/FollowContext';
import colors from '@/constants/colors';

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Monitor, Shirt, ShoppingCart, Home, Sparkles,
  Dumbbell, BookOpen, UtensilsCrossed,
};

interface CategoryCardProps {
  category: Category;
  onPress?: (id: string) => void;
  isSelected?: boolean;
}

function CategoryCardInner({ category, onPress, isSelected }: CategoryCardProps) {
  const { isFollowingCategory, toggleCategory } = useFollow();
  const following = isSelected ?? isFollowingCategory(category.id);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const IconComponent = iconMap[category.icon];

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    if (onPress) {
      onPress(category.id);
    } else {
      toggleCategory(category.id);
    }
  }, [category.id, onPress, toggleCategory, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.card,
          following && { borderColor: category.color, borderWidth: 2, backgroundColor: category.color + '10' },
        ]}
        onPress={handlePress}
      >
        <View style={[styles.iconWrap, { backgroundColor: category.color + '18' }]}>
          {IconComponent && <IconComponent size={22} color={category.color} />}
        </View>
        <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
        {following ? (
          <View style={[styles.dot, { backgroundColor: category.color }]} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export const CategoryCard = React.memo(CategoryCardInner);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    width: 90,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
});
