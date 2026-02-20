import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Brand } from '@/types';
import colors from '@/constants/colors';

interface BrandCardProps {
  brand: Brand;
  isFollowing: boolean;
  onToggleFollow: (id: string) => void;
}

function BrandCardInner({ brand, isFollowing, onToggleFollow }: BrandCardProps) {
  const heartScale = useRef(new Animated.Value(1)).current;

  const handleFollow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onToggleFollow(brand.id);
  }, [brand.id, onToggleFollow, heartScale]);

  return (
    <View style={styles.card}>
      <Image source={{ uri: brand.logo_url }} style={styles.logo} contentFit="cover" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{brand.name}</Text>
        <Text style={styles.count}>{brand.campaign_count} kampanya</Text>
      </View>
      <Pressable onPress={handleFollow} hitSlop={8}>
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <Heart
            size={22}
            color={isFollowing ? colors.primary : colors.textTertiary}
            fill={isFollowing ? colors.primary : 'transparent'}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

export const BrandCard = React.memo(BrandCardInner);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.borderLight,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  count: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
