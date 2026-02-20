import React, { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { UserRole } from '@/types';

const AUTH_KEY = 'user_auth';

interface AuthState {
  role: UserRole;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [role, setRole] = useState<UserRole>('user');

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async (): Promise<AuthState> => {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (raw) return JSON.parse(raw);
      return { role: 'admin' };
    },
  });

  useEffect(() => {
    if (authQuery.data) {
      setRole(authQuery.data.role);
    }
  }, [authQuery.data]);

  const updateRole = useMutation({
    mutationFn: async (newRole: UserRole) => {
      const state: AuthState = { role: newRole };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
      return state;
    },
    onSuccess: (state) => {
      setRole(state.role);
    },
  });

  const toggleAdmin = useCallback(() => {
    const newRole: UserRole = role === 'admin' ? 'user' : 'admin';
    updateRole.mutate(newRole);
  }, [role, updateRole]);

  const isAdmin = role === 'admin';

  return {
    role,
    isAdmin,
    toggleAdmin,
    isLoading: authQuery.isLoading,
  };
});
