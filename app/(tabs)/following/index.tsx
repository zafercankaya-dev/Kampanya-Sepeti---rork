import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart, Store, LayoutGrid, Tag, X, ShoppingBag } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { CampaignCard } from '@/components/CampaignCard';
import { brands } from '@/mocks/brands';
import { categories } from '@/mocks/categories';
import { campaigns } from '@/mocks/campaigns';
import { useFollow } from '@/contexts/FollowContext';
import { Campaign, Brand } from '@/types';
import colors from '@/constants/colors';

type Segment = 'brands' | 'campaigns';

export default function FollowingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { brandIds, toggleBrand, isFollowingBrand } = useFollow();
  const [segment, setSegment] = useState<Segment>('brands');
  const [brandsCategoryFilter, setBrandsCategoryFilter] = useState<string | null>(null);
  const [campaignsCategoryFilter, setCampaignsCategoryFilter] = useState<string | null>(null);
  const [campaignsBrandFilter, setCampaignsBrandFilter] = useState<string | null>(null);
  const segmentAnim = useRef(new Animated.Value(0)).current;

  const handleSegmentChange = useCallback((newSegment: Segment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSegment(newSegment);
    Animated.spring(segmentAnim, {
      toValue: newSegment === 'brands' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  }, [segmentAnim]);

  const filteredBrands = useMemo(() => {
    if (!brandsCategoryFilter) return brands;
    return brands.filter(b => b.category_ids.includes(brandsCategoryFilter));
  }, [brandsCategoryFilter]);

  const followedBrands = useMemo(() =>
    brands.filter(b => brandIds.includes(b.id)),
  [brandIds]);

  const followedCampaigns = useMemo(() => {
    let result = campaigns.filter(c =>
      c.status === 'active' && brandIds.includes(c.brand_id)
    );
    if (campaignsCategoryFilter) {
      result = result.filter(c => c.category_id === campaignsCategoryFilter);
    }
    if (campaignsBrandFilter) {
      result = result.filter(c => c.brand_id === campaignsBrandFilter);
    }
    return result;
  }, [brandIds, campaignsCategoryFilter, campaignsBrandFilter]);

  const campaignCategories = useMemo(() => {
    const activeCampaigns = campaigns.filter(c =>
      c.status === 'active' && brandIds.includes(c.brand_id)
    );
    const catIds = [...new Set(activeCampaigns.map(c => c.category_id))];
    return categories.filter(c => catIds.includes(c.id));
  }, [brandIds]);

  const campaignBrands = useMemo(() => {
    let activeCampaigns = campaigns.filter(c =>
      c.status === 'active' && brandIds.includes(c.brand_id)
    );
    if (campaignsCategoryFilter) {
      activeCampaigns = activeCampaigns.filter(c => c.category_id === campaignsCategoryFilter);
    }
    const bIds = [...new Set(activeCampaigns.map(c => c.brand_id))];
    return brands.filter(b => bIds.includes(b.id));
  }, [brandIds, campaignsCategoryFilter]);

  const handleCampaignPress = useCallback((campaign: Campaign) => {
    router.push({ pathname: '/campaign/[id]' as any, params: { id: campaign.id } });
  }, [router]);

  const handleToggleBrand = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleBrand(id);
  }, [toggleBrand]);

  const renderBrandItem = useCallback(({ item }: { item: Brand }) => {
    const following = isFollowingBrand(item.id);
    const brandCategories = categories.filter(c => item.category_ids.includes(c.id));

    return (
      <Pressable
        style={styles.brandCard}
        onPress={() => handleToggleBrand(item.id)}
        testID={`follow-brand-${item.id}`}
      >
        <Image source={{ uri: item.logo_url }} style={styles.brandLogo} contentFit="cover" />
        <View style={styles.brandInfo}>
          <Text style={styles.brandName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.brandMeta}>
            <Text style={styles.brandCampaignCount}>{item.campaign_count} kampanya</Text>
            {brandCategories.length > 0 && (
              <View style={styles.brandCategoryTags}>
                {brandCategories.slice(0, 2).map(cat => (
                  <View key={cat.id} style={[styles.miniTag, { backgroundColor: cat.color + '18' }]}>
                    <Text style={[styles.miniTagText, { color: cat.color }]}>{cat.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={[styles.followButton, following && styles.followButtonActive]}>
          <Heart
            size={14}
            color={following ? '#fff' : colors.primary}
            fill={following ? '#fff' : 'transparent'}
          />
          <Text style={[styles.followButtonText, following && styles.followButtonTextActive]}>
            {following ? 'Takipte' : 'Takip Et'}
          </Text>
        </View>
      </Pressable>
    );
  }, [isFollowingBrand, handleToggleBrand]);

  const renderSegmentControl = useCallback(() => (
    <View style={styles.segmentContainer}>
      <View style={styles.segmentTrack}>
        <Pressable
          style={[styles.segmentButton, segment === 'brands' && styles.segmentButtonActive]}
          onPress={() => handleSegmentChange('brands')}
          testID="segment-brands"
        >
          <Store size={15} color={segment === 'brands' ? '#fff' : colors.textSecondary} />
          <Text style={[styles.segmentText, segment === 'brands' && styles.segmentTextActive]}>
            Markalar
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentButton, segment === 'campaigns' && styles.segmentButtonActive]}
          onPress={() => handleSegmentChange('campaigns')}
          testID="segment-campaigns"
        >
          <Tag size={15} color={segment === 'campaigns' ? '#fff' : colors.textSecondary} />
          <Text style={[styles.segmentText, segment === 'campaigns' && styles.segmentTextActive]}>
            Kampanyalar
          </Text>
        </Pressable>
      </View>
    </View>
  ), [segment, handleSegmentChange]);

  const renderBrandsHeader = useCallback(() => (
    <View>
      {renderSegmentControl()}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Store size={18} color={colors.primary} />
          <Text style={styles.statValue}>{followedBrands.length}</Text>
          <Text style={styles.statLabel}>Takip Edilen</Text>
        </View>
        <View style={styles.statCard}>
          <ShoppingBag size={18} color={colors.accent} />
          <Text style={styles.statValue}>{brands.length}</Text>
          <Text style={styles.statLabel}>Toplam Marka</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategori Seçin</Text>
        <Text style={styles.sectionSubtitle}>Kategoriye göre markaları filtreleyin</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        <Pressable
          style={[styles.categoryChip, !brandsCategoryFilter && styles.categoryChipActive]}
          onPress={() => setBrandsCategoryFilter(null)}
        >
          <LayoutGrid size={14} color={!brandsCategoryFilter ? '#fff' : colors.textSecondary} />
          <Text style={[styles.categoryChipText, !brandsCategoryFilter && styles.categoryChipTextActive]}>Tümü</Text>
        </Pressable>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            style={[
              styles.categoryChip,
              brandsCategoryFilter === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
            ]}
            onPress={() => setBrandsCategoryFilter(prev => prev === cat.id ? null : cat.id)}
          >
            <View style={[styles.categoryDot, { backgroundColor: brandsCategoryFilter === cat.id ? '#fff' : cat.color }]} />
            <Text style={[
              styles.categoryChipText,
              brandsCategoryFilter === cat.id && styles.categoryChipTextActive,
            ]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.brandsHeader}>
        <Text style={styles.sectionTitle}>
          {brandsCategoryFilter
            ? `${categories.find(c => c.id === brandsCategoryFilter)?.name ?? ''} Markaları`
            : 'Tüm Markalar'}
        </Text>
        <Text style={styles.brandsCount}>{filteredBrands.length} marka</Text>
      </View>
    </View>
  ), [renderSegmentControl, brandsCategoryFilter, followedBrands.length, filteredBrands.length]);

  const renderCampaignsHeader = useCallback(() => (
    <View>
      {renderSegmentControl()}

      {followedCampaigns.length > 0 || campaignCategories.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kategoriye Göre Filtrele</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            <Pressable
              style={[styles.categoryChip, !campaignsCategoryFilter && styles.categoryChipActive]}
              onPress={() => { setCampaignsCategoryFilter(null); setCampaignsBrandFilter(null); }}
            >
              <LayoutGrid size={14} color={!campaignsCategoryFilter ? '#fff' : colors.textSecondary} />
              <Text style={[styles.categoryChipText, !campaignsCategoryFilter && styles.categoryChipTextActive]}>Tümü</Text>
            </Pressable>
            {campaignCategories.map(cat => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  campaignsCategoryFilter === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                ]}
                onPress={() => {
                  setCampaignsCategoryFilter(prev => prev === cat.id ? null : cat.id);
                  setCampaignsBrandFilter(null);
                }}
              >
                <View style={[styles.categoryDot, { backgroundColor: campaignsCategoryFilter === cat.id ? '#fff' : cat.color }]} />
                <Text style={[
                  styles.categoryChipText,
                  campaignsCategoryFilter === cat.id && styles.categoryChipTextActive,
                ]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {campaignBrands.length > 0 && (
            <>
              <View style={styles.brandFilterHeader}>
                <Text style={styles.sectionTitleSmall}>Markaya Göre</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              >
                <Pressable
                  style={[styles.brandFilterChip, !campaignsBrandFilter && styles.brandFilterChipActive]}
                  onPress={() => setCampaignsBrandFilter(null)}
                >
                  <Text style={[styles.brandFilterChipText, !campaignsBrandFilter && styles.brandFilterChipTextActive]}>Tümü</Text>
                </Pressable>
                {campaignBrands.map(b => (
                  <Pressable
                    key={b.id}
                    style={[styles.brandFilterChip, campaignsBrandFilter === b.id && styles.brandFilterChipActive]}
                    onPress={() => setCampaignsBrandFilter(prev => prev === b.id ? null : b.id)}
                  >
                    <Image source={{ uri: b.logo_url }} style={styles.brandFilterLogo} contentFit="cover" />
                    <Text style={[styles.brandFilterChipText, campaignsBrandFilter === b.id && styles.brandFilterChipTextActive]} numberOfLines={1}>
                      {b.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          {(campaignsCategoryFilter || campaignsBrandFilter) && (
            <Pressable
              style={styles.clearFilters}
              onPress={() => { setCampaignsCategoryFilter(null); setCampaignsBrandFilter(null); }}
            >
              <X size={12} color={colors.primary} />
              <Text style={styles.clearFiltersText}>Filtreleri Temizle</Text>
            </Pressable>
          )}

          <View style={styles.campaignsCountRow}>
            <Text style={styles.sectionTitle}>Takipteki Kampanyalar</Text>
          </View>
        </>
      ) : null}
    </View>
  ), [renderSegmentControl, campaignsCategoryFilter, campaignsBrandFilter, followedCampaigns.length, campaignCategories, campaignBrands]);

  const renderCampaignItem = useCallback(({ item }: { item: Campaign }) => (
    <CampaignCard
      campaign={item}
      onPress={handleCampaignPress}
      showFollowButton
    />
  ), [handleCampaignPress]);

  const renderEmptyBrands = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Store size={48} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>Bu kategoride marka yok</Text>
      <Text style={styles.emptyText}>Farklı bir kategori seçmeyi deneyin.</Text>
    </View>
  ), []);

  const renderEmptyCampaigns = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Tag size={48} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>
        {brandIds.length === 0 ? 'Henüz marka takip etmiyorsunuz' : 'Kampanya bulunamadı'}
      </Text>
      <Text style={styles.emptyText}>
        {brandIds.length === 0
          ? 'Markalar sekmesinden markaları takip ederek kampanyalarını burada görebilirsiniz.'
          : 'Filtreleri değiştirmeyi veya daha fazla marka takip etmeyi deneyin.'}
      </Text>
      {brandIds.length === 0 && (
        <Pressable
          style={styles.emptyAction}
          onPress={() => handleSegmentChange('brands')}
        >
          <Text style={styles.emptyActionText}>Markaları Keşfet</Text>
        </Pressable>
      )}
    </View>
  ), [brandIds.length, handleSegmentChange]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Takip Ettiklerim</Text>
      </View>

      {segment === 'brands' ? (
        <FlatList
          data={filteredBrands}
          keyExtractor={item => item.id}
          renderItem={renderBrandItem}
          ListHeaderComponent={renderBrandsHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyBrands}
        />
      ) : (
        <FlatList
          data={followedCampaigns}
          keyExtractor={item => item.id}
          renderItem={renderCampaignItem}
          ListHeaderComponent={renderCampaignsHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyCampaigns}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
  },
  listContent: {
    paddingBottom: 30,
  },
  segmentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 11,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textTertiary,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  brandsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  brandsCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textTertiary,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.borderLight,
  },
  brandInfo: {
    flex: 1,
    marginLeft: 12,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  brandMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  brandCampaignCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  brandCategoryTags: {
    flexDirection: 'row',
    gap: 4,
  },
  miniTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: 5,
  },
  followButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  followButtonTextActive: {
    color: '#fff',
  },
  brandFilterHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  brandFilterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  brandFilterChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    maxWidth: 90,
  },
  brandFilterChipTextActive: {
    color: '#fff',
  },
  brandFilterLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.borderLight,
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: colors.primary + '12',
    gap: 4,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  campaignsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
