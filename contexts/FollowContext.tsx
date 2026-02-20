import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

const FOLLOW_BRANDS_KEY = 'follow_brands';
const FOLLOW_CATEGORIES_KEY = 'follow_categories';

interface FollowState {
  brandIds: string[];
  categoryIds: string[];
}

export const [FollowProvider, useFollow] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [brandIds, setBrandIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const followQuery = useQuery({
    queryKey: ['follows'],
    queryFn: async (): Promise<FollowState> => {
      const [brandsRaw, catsRaw] = await Promise.all([
        AsyncStorage.getItem(FOLLOW_BRANDS_KEY),
        AsyncStorage.getItem(FOLLOW_CATEGORIES_KEY),
      ]);
      return {
        brandIds: brandsRaw ? JSON.parse(brandsRaw) : [],
        categoryIds: catsRaw ? JSON.parse(catsRaw) : [],
      };
    },
  });

  useEffect(() => {
    if (followQuery.data) {
      setBrandIds(followQuery.data.brandIds);
      setCategoryIds(followQuery.data.categoryIds);
    }
  }, [followQuery.data]);

  const syncBrands = useMutation({
    mutationFn: async (ids: string[]) => {
      await AsyncStorage.setItem(FOLLOW_BRANDS_KEY, JSON.stringify(ids));
    },
  });

  const syncCategories = useMutation({
    mutationFn: async (ids: string[]) => {
      await AsyncStorage.setItem(FOLLOW_CATEGORIES_KEY, JSON.stringify(ids));
    },
  });

  const toggleBrand = useCallback((id: string) => {
    setBrandIds(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      syncBrands.mutate(next);
      return next;
    });
  }, [syncBrands]);

  const toggleCategory = useCallback((id: string) => {
    setCategoryIds(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      syncCategories.mutate(next);
      return next;
    });
  }, [syncCategories]);

  const isFollowingBrand = useCallback((id: string) => brandIds.includes(id), [brandIds]);
  const isFollowingCategory = useCallback((id: string) => categoryIds.includes(id), [categoryIds]);

  return {
    brandIds,
    categoryIds,
    toggleBrand,
    toggleCategory,
    isFollowingBrand,
    isFollowingCategory,
    isLoading: followQuery.isLoading,
  };
});
