import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Clock, ExternalLink, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Campaign } from '@/types';
import { brands } from '@/mocks/brands';
import { categories } from '@/mocks/categories';
import { useFollow } from '@/contexts/FollowContext';
import colors from '@/constants/colors';

interface CampaignCardProps {
  campaign: Campaign;
  onPress: (campaign: Campaign) => void;
  showFollowButton?: boolean;
}

function daysLeft(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function CampaignCardInner({ campaign, onPress, showFollowButton = true }: CampaignCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const { isFollowingBrand, toggleBrand } = useFollow();
  const brand = brands.find(b => b.id === campaign.brand_id);
  const category = categories.find(c => c.id === campaign.category_id);
  const remaining = daysLeft(campaign.end_date);
  const isEndingSoon = remaining <= 2;
  const following = brand ? isFollowingBrand(brand.id) : false;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleFollowPress = useCallback(() => {
    if (!brand) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.35, duration: 100, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    toggleBrand(brand.id);
  }, [brand, toggleBrand, heartScale]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPress={() => onPress(campaign)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={`campaign-card-${campaign.id}`}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: campaign.image_url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          {campaign.discount_rate != null && campaign.discount_rate > 0 ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>%{campaign.discount_rate}</Text>
            </View>
          ) : null}
          {isEndingSoon ? (
            <View style={styles.urgentBadge}>
              <Clock size={10} color="#fff" />
              <Text style={styles.urgentText}>
                {remaining === 0 ? 'Son Gün!' : `${remaining} gün kaldı`}
              </Text>
            </View>
          ) : null}
          {showFollowButton && brand ? (
            <Pressable
              style={[styles.followBadge, following && styles.followBadgeActive]}
              onPress={handleFollowPress}
              hitSlop={8}
              testID={`campaign-follow-${campaign.id}`}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Heart
                  size={14}
                  color={following ? '#fff' : '#fff'}
                  fill={following ? '#fff' : 'transparent'}
                />
              </Animated.View>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.content}>
          <View style={styles.meta}>
            {brand && (
              <View style={styles.brandRow}>
                <Image
                  source={{ uri: brand.logo_url }}
                  style={styles.brandLogo}
                  contentFit="cover"
                />
                <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
                {showFollowButton && (
                  <Pressable onPress={handleFollowPress} hitSlop={6}>
                    <Text style={[styles.followText, following && styles.followTextActive]}>
                      {following ? 'Takipte' : 'Takip Et'}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
            {category && (
              <View style={[styles.categoryTag, { backgroundColor: category.color + '18' }]}>
                <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>{campaign.title}</Text>

          <View style={styles.footer}>
            {!isEndingSoon && remaining > 0 ? (
              <View style={styles.timeRow}>
                <Clock size={12} color={colors.textTertiary} />
                <Text style={styles.timeText}>{remaining} gün kaldı</Text>
              </View>
            ) : null}
            <View style={styles.sourceRow}>
              <ExternalLink size={11} color={colors.primary} />
              <Text style={styles.sourceText}>Kaynağa Git</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const CampaignCard = React.memo(CampaignCardInner);

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 170,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountText: {
    color: '#fff',
    fontWeight: '800' as const,
    fontSize: 14,
  },
  urgentBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgentText: {
    color: '#fff',
    fontWeight: '700' as const,
    fontSize: 11,
  },
  followBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followBadgeActive: {
    backgroundColor: colors.primary,
  },
  content: {
    padding: 14,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  brandLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.borderLight,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    flex: 1,
  },
  followText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.primary,
    marginLeft: 4,
  },
  followTextActive: {
    color: colors.textTertiary,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600' as const,
  },
});
