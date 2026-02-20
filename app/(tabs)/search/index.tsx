import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Animated,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react-native';
import { CampaignCard } from '@/components/CampaignCard';
import { FilterChip } from '@/components/FilterChip';
import { campaigns } from '@/mocks/campaigns';
import { brands } from '@/mocks/brands';
import { categories } from '@/mocks/categories';
import { Campaign, SortOption } from '@/types';
import colors from '@/constants/colors';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest', label: 'Yeni Başlayan' },
  { key: 'ending_soon', label: 'Yakında Biten' },
  { key: 'highest_discount', label: 'Yüksek İndirim' },
  { key: 'popular', label: 'Popüler' },
];

const DISCOUNT_RANGES = [
  { key: 'any', label: 'Tüm İndirimler' },
  { key: '10+', label: '%10+' },
  { key: '25+', label: '%25+' },
  { key: '50+', label: '%50+' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [discountRange, setDiscountRange] = useState('any');
  const [showFilters, setShowFilters] = useState(false);
  const filterAnim = useRef(new Animated.Value(0)).current;

  const toggleFilters = useCallback(() => {
    const toValue = showFilters ? 0 : 1;
    setShowFilters(!showFilters);
    Animated.spring(filterAnim, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [showFilters, filterAnim]);

  const filteredCampaigns = useMemo(() => {
    let result = campaigns.filter(c => c.status === 'active');

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(c => {
        const brand = brands.find(b => b.id === c.brand_id);
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (brand && brand.name.toLowerCase().includes(q))
        );
      });
    }

    if (selectedBrands.length > 0) {
      result = result.filter(c => selectedBrands.includes(c.brand_id));
    }

    if (selectedCategories.length > 0) {
      result = result.filter(c => selectedCategories.includes(c.category_id));
    }

    if (discountRange !== 'any') {
      const min = parseInt(discountRange.replace('+', ''), 10);
      result = result.filter(c => (c.discount_rate ?? 0) >= min);
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
  }, [query, sortOption, selectedBrands, selectedCategories, discountRange]);

  const handleCampaignPress = useCallback((campaign: Campaign) => {
    router.push({ pathname: '/campaign/[id]' as any, params: { id: campaign.id } });
  }, [router]);

  const toggleBrandFilter = useCallback((id: string) => {
    setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  }, []);

  const toggleCategoryFilter = useCallback((id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }, []);

  const filterPanelHeight = filterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 320],
  });

  const renderHeader = useCallback(() => (
    <View>
      <Animated.View style={[styles.filterPanel, { height: filterPanelHeight, overflow: 'hidden' }]}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Kategori</Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <FilterChip
                label={item.name}
                selected={selectedCategories.includes(item.id)}
                onPress={() => toggleCategoryFilter(item.id)}
                color={item.color}
              />
            )}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Marka</Text>
          <FlatList
            data={brands}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <FilterChip
                label={item.name}
                selected={selectedBrands.includes(item.id)}
                onPress={() => toggleBrandFilter(item.id)}
              />
            )}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>İndirim Oranı</Text>
          <FlatList
            data={DISCOUNT_RANGES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.key}
            renderItem={({ item }) => (
              <FilterChip
                label={item.label}
                selected={discountRange === item.key}
                onPress={() => setDiscountRange(item.key)}
                color={colors.accent}
              />
            )}
          />
        </View>
      </Animated.View>

      <View style={styles.sortRow}>
        <FlatList
          data={SORT_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.key}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              selected={sortOption === item.key}
              onPress={() => setSortOption(item.key)}
            />
          )}
        />
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filteredCampaigns.length} sonuç</Text>
      </View>
    </View>
  ), [
    filterPanelHeight, selectedCategories, selectedBrands, discountRange,
    sortOption, filteredCampaigns.length, toggleCategoryFilter, toggleBrandFilter,
  ]);

  const activeFilterCount = selectedBrands.length + selectedCategories.length + (discountRange !== 'any' ? 1 : 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keşfet</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Marka, kampanya ara..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable style={styles.filterButton} onPress={toggleFilters}>
          <SlidersHorizontal size={18} color={showFilters ? colors.primary : colors.textSecondary} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <FlatList
        data={filteredCampaigns}
        renderItem={({ item }) => <CampaignCard campaign={item} onPress={handleCampaignPress} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Search size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptyText}>Farklı anahtar kelimeler veya filtreler deneyin.</Text>
          </View>
        }
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
  },
  filterPanel: {
    paddingHorizontal: 16,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  sortRow: {
    marginBottom: 8,
  },
  resultsRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
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
  },
});
