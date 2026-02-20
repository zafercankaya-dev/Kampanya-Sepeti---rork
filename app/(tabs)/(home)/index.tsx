import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  StatusBar,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TrendingUp, Heart, LayoutGrid } from 'lucide-react-native';
import { Image } from 'react-native';
import { CampaignCard } from '@/components/CampaignCard';
import { CategoryCard } from '@/components/CategoryCard';
import { BrandCard } from '@/components/BrandCard';
import { FilterChip } from '@/components/FilterChip';
import { campaigns } from '@/mocks/campaigns';
import { categories } from '@/mocks/categories';
import { brands } from '@/mocks/brands';
import { useFollow } from '@/contexts/FollowContext';
import { Campaign, SortOption } from '@/types';
import colors from '@/constants/colors';

type SegmentType = 'all' | 'following';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest', label: 'Yeni' },
  { key: 'ending_soon', label: 'Biten' },
  { key: 'highest_discount', label: 'Yüksek İndirim' },
  { key: 'popular', label: 'Popüler' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { brandIds, categoryIds, toggleBrand, isFollowingBrand, isFollowingCategory } = useFollow();
  const [refreshing, setRefreshing] = useState(false);
  const [segment, setSegment] = useState<SegmentType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const segmentAnim = useRef(new Animated.Value(0)).current;

  const handleSegmentChange = useCallback((newSegment: SegmentType) => {
    setSegment(newSegment);
    setSelectedCategory(null);
    setSelectedBrand(null);
    Animated.spring(segmentAnim, {
      toValue: newSegment === 'all' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  }, [segmentAnim]);

  const visibleCategories = useMemo(() => {
    if (segment === 'following') {
      return categories.filter(c => categoryIds.includes(c.id));
    }
    return categories;
  }, [segment, categoryIds]);

  const visibleBrands = useMemo(() => {
    let result = brands;
    if (segment === 'following') {
      result = result.filter(b => brandIds.includes(b.id));
    }
    if (selectedCategory) {
      result = result.filter(b => b.category_ids.includes(selectedCategory));
    }
    return result;
  }, [segment, brandIds, selectedCategory]);

  const filteredCampaigns = useMemo(() => {
    let result = campaigns.filter(c => c.status === 'active');

    if (segment === 'following') {
      result = result.filter(c =>
        brandIds.includes(c.brand_id) || categoryIds.includes(c.category_id)
      );
    }

    if (selectedCategory) {
      result = result.filter(c => c.category_id === selectedCategory);
    }

    if (selectedBrand) {
      result = result.filter(c => c.brand_id === selectedBrand);
    }

    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'ending_soon':
        result.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        break;
      case 'highest_discount':
        result.sort((a, b) => (b.discount_rate ?? 0) - (a.discount_rate ?? 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.discount_rate ?? 0) - (a.discount_rate ?? 0));
        break;
    }

    return result;
  }, [segment, sortOption, selectedCategory, selectedBrand, brandIds, categoryIds]);

  const handleCampaignPress = useCallback((campaign: Campaign) => {
    router.push({ pathname: '/campaign/[id]' as any, params: { id: campaign.id } });
  }, [router]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCategoryPress = useCallback((id: string) => {
    setSelectedCategory(prev => prev === id ? null : id);
    setSelectedBrand(null);
  }, []);

  const handleBrandPress = useCallback((id: string) => {
    setSelectedBrand(prev => prev === id ? null : id);
  }, []);

  const segmentTranslateX = segmentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.segmentContainer}>
        <View style={styles.segmentTrack}>
          <Pressable
            style={[styles.segmentButton, segment === 'all' && styles.segmentButtonActive]}
            onPress={() => handleSegmentChange('all')}
          >
            <LayoutGrid size={16} color={segment === 'all' ? '#fff' : colors.textSecondary} />
            <Text style={[styles.segmentText, segment === 'all' && styles.segmentTextActive]}>Tümü</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentButton, segment === 'following' && styles.segmentButtonActive]}
            onPress={() => handleSegmentChange('following')}
          >
            <Heart size={16} color={segment === 'following' ? '#fff' : colors.textSecondary} />
            <Text style={[styles.segmentText, segment === 'following' && styles.segmentTextActive]}>Takip Ettiğim Markalar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionLabel}>Kategoriler</Text>
        <FlatList
          data={[{ id: '__all__', name: 'Tümü', icon: 'LayoutGrid', color: colors.primary } as any, ...visibleCategories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            if (item.id === '__all__') {
              return (
                <Pressable
                  style={[
                    styles.allChip,
                    !selectedCategory && styles.allChipActive,
                  ]}
                  onPress={() => { setSelectedCategory(null); setSelectedBrand(null); }}
                >
                  <LayoutGrid size={18} color={!selectedCategory ? '#fff' : colors.textSecondary} />
                  <Text style={[styles.allChipText, !selectedCategory && styles.allChipTextActive]}>Tümü</Text>
                </Pressable>
              );
            }
            return (
              <CategoryCard
                category={item}
                onPress={handleCategoryPress}
                isSelected={selectedCategory === item.id}
              />
            );
          }}
        />
      </View>

      <View style={styles.brandsSection}>
        <Text style={styles.sectionLabel}>Markalar</Text>
        <FlatList
          data={visibleBrands}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.brandsList}
          ListHeaderComponent={
            <Pressable
              style={[
                styles.allBrandChip,
                !selectedBrand && styles.allBrandChipActive,
              ]}
              onPress={() => setSelectedBrand(null)}
            >
              <Text style={[styles.allBrandChipText, !selectedBrand && styles.allBrandChipTextActive]}>Tümü</Text>
            </Pressable>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.brandChip,
                selectedBrand === item.id && styles.brandChipActive,
              ]}
              onPress={() => handleBrandPress(item.id)}
            >
              <Text
                style={[
                  styles.brandChipText,
                  selectedBrand === item.id && styles.brandChipTextActive,
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            segment === 'following' ? (
              <View style={styles.emptyBrandsHint}>
                <Text style={styles.emptyBrandsHintText}>Henüz marka takip etmiyorsunuz</Text>
              </View>
            ) : null
          }
        />
      </View>

      <View style={styles.sortSection}>
        <FlatList
          data={SORT_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              selected={sortOption === item.key}
              onPress={() => setSortOption(item.key)}
              color={colors.accent}
            />
          )}
        />
      </View>

      <View style={styles.resultsRow}>
        <TrendingUp size={16} color={colors.primary} />
        <Text style={styles.resultsCount}>{filteredCampaigns.length} kampanya</Text>
      </View>
    </View>
  ), [segment, sortOption, selectedCategory, selectedBrand, filteredCampaigns.length, handleCategoryPress, handleBrandPress, handleSegmentChange, visibleCategories, visibleBrands]);

  const renderCampaign = useCallback(({ item }: { item: Campaign }) => (
    <CampaignCard campaign={item} onPress={handleCampaignPress} />
  ), [handleCampaignPress]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Flame size={48} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>Kampanya bulunamadı</Text>
      <Text style={styles.emptyText}>
        {segment === 'following'
          ? 'Takip ettiğiniz marka veya kategorilerde aktif kampanya yok. Yeni markalar takip etmeyi deneyin!'
          : 'Seçili filtrelere uygun kampanya bulunamadı.'}
      </Text>
    </View>
  ), [segment]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logoImage} />
          <View>
            <Text style={styles.headerTitle}>Kampanya Sepeti</Text>
            <Text style={styles.headerSubtitle}>En iyi kampanyalar, fırsatlar, indirimler burada</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredCampaigns}
        renderItem={renderCampaign}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  segmentContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '700' as const,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  categoriesSection: {
    marginBottom: 14,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  allChip: {
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 6,
  },
  allChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  allChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  allChipTextActive: {
    color: '#fff',
    fontWeight: '700' as const,
  },
  brandsSection: {
    marginBottom: 12,
  },
  brandsList: {
    paddingHorizontal: 16,
  },
  allBrandChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  allBrandChipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  allBrandChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  allBrandChipTextActive: {
    color: '#fff',
  },
  brandChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  brandChipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  brandChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  brandChipTextActive: {
    color: '#fff',
  },
  emptyBrandsHint: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  emptyBrandsHintText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  sortSection: {
    marginBottom: 12,
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
