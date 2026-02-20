import React, { useRef, useCallback } from 'react';
import { Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

function FilterChipInner({ label, selected, onPress, color }: FilterChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const activeColor = color ?? colors.primary;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  }, [onPress, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.chip,
          selected
            ? { backgroundColor: activeColor, borderColor: activeColor }
            : { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={handlePress}
      >
        <Text
          style={[
            styles.chipText,
            { color: selected ? '#fff' : colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export const FilterChip = React.memo(FilterChipInner);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
