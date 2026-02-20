import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { SubscriptionPlan, UserSubscription } from '@/types';

const SUB_KEY = 'user_subscription';

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [subscription, setSubscription] = useState<UserSubscription>({
    plan: 'free',
    expiresAt: null,
  });

  const subQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: async (): Promise<UserSubscription> => {
      const raw = await AsyncStorage.getItem(SUB_KEY);
      if (raw) return JSON.parse(raw);
      return { plan: 'free', expiresAt: null };
    },
  });

  useEffect(() => {
    if (subQuery.data) {
      setSubscription(subQuery.data);
    }
  }, [subQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      const expiresAt = plan === 'free'
        ? null
        : new Date(Date.now() + (plan === 'premium_yearly' ? 365 : 30) * 86400000).toISOString();
      const sub: UserSubscription = { plan, expiresAt };
      await AsyncStorage.setItem(SUB_KEY, JSON.stringify(sub));
      return sub;
    },
    onSuccess: (sub) => {
      setSubscription(sub);
    },
  });

  const isPremium = subscription.plan !== 'free';

  const subscribe = useCallback((plan: SubscriptionPlan) => {
    updateMutation.mutate(plan);
  }, [updateMutation]);

  return {
    subscription,
    isPremium,
    subscribe,
    isLoading: subQuery.isLoading,
  };
});
