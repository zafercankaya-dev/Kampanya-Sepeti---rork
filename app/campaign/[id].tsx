import React, { useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  Calendar,
  Tag,
  Heart,
  Share2,
  Store,
} from 'lucide-react-native';
import { campaigns } from '@/mocks/campaigns';
import { brands } from '@/mocks/brands';
import { categories } from '@/mocks/categories';
import { useFollow } from '@/contexts/FollowContext';
import colors from '@/constants/colors';

function daysLeft(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isFollowingBrand, toggleBrand } = useFollow();
  const scrollY = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const campaign = useMemo(() => campaigns.find(c => c.id === id), [id]);
  const brand = useMemo(() => campaign ? brands.find(b => b.id === campaign.brand_id) : null, [campaign]);
  const category = useMemo(() => campaign ? categories.find(c => c.id === campaign.category_id) : null, [campaign]);

  const remaining = campaign ? daysLeft(campaign.end_date) : 0;
  const isEndingSoon = remaining <= 2;
  const following = brand ? isFollowingBrand(brand.id) : false;

  const handleOpenSource = useCallback(async () => {
    if (!campaign) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    try {
      await WebBrowser.openBrowserAsync(campaign.source_url, {
        controlsColor: colors.primary,
        toolbarColor: colors.surface,
      });
    } catch {
      Linking.openURL(campaign.source_url);
    }
  }, [campaign, buttonScale]);

  const handleShare = useCallback(async () => {
    if (!campaign) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${campaign.title}\n\n${campaign.source_url}`,
      });
    } catch {
      console.log('Share cancelled');
    }
  }, [campaign]);

  const handleToggleFollow = useCallback(() => {
    if (brand) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleBrand(brand.id);
    }
  }, [brand, toggleBrand]);

  if (!campaign) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Kampanya bulunamadı</Text>
        <Pressable onPress={() => router.back()} style={styles.backButtonFallback}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </Pressable>
      </View>
    );
  }

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [50, 0, -60],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.imageWrapper}>
          <Animated.View style={{ transform: [{ translateY: imageTranslateY }] }}>
            <Image
              source={{ uri: campaign.image_url }}
              style={styles.heroImage}
              contentFit="cover"
              transition={300}
            />
          </Animated.View>
          <View style={styles.imageOverlay} />

          {campaign.discount_rate && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>%{campaign.discount_rate}</Text>
              <Text style={styles.discountLabel}>İNDİRİM</Text>
            </View>
          )}
        </View>

        <View style={[styles.backButton, { top: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButtonInner}
            hitSlop={10}
          >
            <ArrowLeft size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={[styles.actionButtons, { top: insets.top + 8 }]}>
          <Pressable onPress={handleShare} style={styles.actionBtn} hitSlop={10}>
            <Share2 size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.body}>
          {brand && (
            <View style={styles.brandSection}>
              <Image source={{ uri: brand.logo_url }} style={styles.brandLogo} contentFit="cover" />
              <View style={styles.brandInfo}>
                <Text style={styles.brandName}>{brand.name}</Text>
                <Text style={styles.brandDomain}>{brand.domain}</Text>
              </View>
              <Pressable
                style={[styles.followBtn, following && styles.followBtnActive]}
                onPress={handleToggleFollow}
              >
                <Heart
                  size={14}
                  color={following ? '#fff' : colors.primary}
                  fill={following ? '#fff' : 'transparent'}
                />
                <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
                  {following ? 'Takip Ediliyor' : 'Takip Et'}
                </Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.title}>{campaign.title}</Text>

          <View style={styles.metaRow}>
            {category && (
              <View style={[styles.categoryTag, { backgroundColor: category.color + '18' }]}>
                <Tag size={12} color={category.color} />
                <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
              </View>
            )}
            <View style={[styles.statusTag, isEndingSoon ? styles.statusUrgent : styles.statusNormal]}>
              <Clock size={12} color={isEndingSoon ? colors.danger : colors.textSecondary} />
              <Text style={[styles.statusText, isEndingSoon && { color: colors.danger }]}>
                {remaining === 0 ? 'Son Gün!' : `${remaining} gün kaldı`}
              </Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Calendar size={14} color={colors.textTertiary} />
              <Text style={styles.dateLabel}>Başlangıç:</Text>
              <Text style={styles.dateValue}>{formatDate(campaign.start_date)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Calendar size={14} color={isEndingSoon ? colors.danger : colors.textTertiary} />
              <Text style={styles.dateLabel}>Bitiş:</Text>
              <Text style={[styles.dateValue, isEndingSoon && { color: colors.danger }]}>
                {formatDate(campaign.end_date)}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Kampanya Detayı</Text>
            <Text style={styles.description}>{campaign.description}</Text>
          </View>

          <View style={styles.sourceSection}>
            <Store size={16} color={colors.textSecondary} />
            <Text style={styles.sourceLabel}>Kaynak:</Text>
            <Text style={styles.sourceUrl} numberOfLines={1}>{campaign.source_url}</Text>
          </View>
        </View>
      </Animated.ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Animated.View style={{ flex: 1, transform: [{ scale: buttonScale }] }}>
          <Pressable style={styles.ctaButton} onPress={handleOpenSource}>
            <ExternalLink size={18} color="#fff" />
            <Text style={styles.ctaText}>Kaynağa Git</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  backButtonFallback: {
    alignSelf: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  imageWrapper: {
    height: 280,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 340,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  discountText: {
    color: '#fff',
    fontWeight: '900' as const,
    fontSize: 22,
  },
  discountLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 20,
    paddingBottom: 100,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 14,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
  },
  brandInfo: {
    flex: 1,
    marginLeft: 10,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  brandDomain: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 1,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  followBtnTextActive: {
    color: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
    lineHeight: 30,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusNormal: {
    backgroundColor: colors.borderLight,
  },
  statusUrgent: {
    backgroundColor: colors.danger + '15',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  dateRow: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  sourceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
  },
  sourceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  sourceUrl: {
    fontSize: 12,
    color: colors.primary,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
