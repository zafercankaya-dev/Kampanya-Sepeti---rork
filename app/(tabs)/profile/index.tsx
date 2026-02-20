import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Crown,
  Bell,
  Shield,
  Star,
  ChevronRight,
  Zap,
  Check,
  Info,
  Settings2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useFollow } from '@/contexts/FollowContext';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionPlan } from '@/types';
import colors from '@/constants/colors';

const PLANS: {
  key: SubscriptionPlan;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}[] = [
  {
    key: 'free',
    name: 'Ücretsiz',
    price: '₺0',
    period: '',
    features: [
      'Sınırlı marka takibi (5)',
      'Temel filtreler',
      'Günlük bildirim limiti',
      'Reklamlı deneyim',
    ],
  },
  {
    key: 'premium_monthly',
    name: 'Premium Aylık',
    price: '₺49.99',
    period: '/ay',
    popular: true,
    features: [
      'Sınırsız marka takibi',
      'Gelişmiş filtreler',
      'Öncelikli bildirimler',
      'Reklamsız deneyim',
      'Anahtar kelime takibi',
      'Yakında bitecek uyarıları',
    ],
  },
  {
    key: 'premium_yearly',
    name: 'Premium Yıllık',
    price: '₺399.99',
    period: '/yıl',
    features: [
      'Aylık plana göre %33 tasarruf',
      'Tüm Premium özellikler',
      'Sınırsız marka takibi',
      'Gelişmiş filtreler',
      'Öncelikli bildirimler',
      'Reklamsız deneyim',
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { subscription, isPremium, subscribe } = useSubscription();
  const { brandIds, categoryIds } = useFollow();
  const { isAdmin, toggleAdmin } = useAuth();

  const handleSubscribe = useCallback((plan: SubscriptionPlan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (plan === 'free') {
      Alert.alert('Abonelik İptali', 'Premium aboneliğinizi iptal etmek istediğinize emin misiniz?', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'İptal Et', style: 'destructive', onPress: () => subscribe(plan) },
      ]);
    } else {
      subscribe(plan);
      Alert.alert('Tebrikler! 🎉', `${plan === 'premium_monthly' ? 'Aylık' : 'Yıllık'} Premium aboneliğiniz aktif edildi.`);
    }
  }, [subscribe]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{brandIds.length}</Text>
            <Text style={styles.statLabel}>Marka</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{categoryIds.length}</Text>
            <Text style={styles.statLabel}>Kategori</Text>
          </View>
          <View style={[styles.statCard, isPremium && styles.statCardPremium]}>
            <Crown size={20} color={isPremium ? colors.premiumDark : colors.textTertiary} />
            <Text style={[styles.statLabel, isPremium && { color: colors.premiumDark }]}>
              {isPremium ? 'Premium' : 'Ücretsiz'}
            </Text>
          </View>
        </View>

        {!isPremium ? (
          <Pressable style={styles.premiumBanner} onPress={() => handleSubscribe('premium_monthly')}>
            <View style={styles.premiumBannerContent}>
              <View style={styles.premiumIconWrap}>
                <Zap size={20} color="#fff" />
              </View>
              <View style={styles.premiumBannerText}>
                <Text style={styles.premiumBannerTitle}>Premium'a Geç</Text>
                <Text style={styles.premiumBannerDesc}>Sınırsız takip, gelişmiş filtreler ve daha fazlası</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.accent} />
          </Pressable>
        ) : null}

        <Text style={styles.sectionTitle}>Abonelik Planları</Text>

        {PLANS.map(plan => {
          const isActive = subscription.plan === plan.key;
          return (
            <Pressable
              key={plan.key}
              style={[
                styles.planCard,
                isActive && styles.planCardActive,
                plan.popular && !isActive && styles.planCardPopular,
              ]}
              onPress={() => !isActive && handleSubscribe(plan.key)}
            >
              {plan.popular && !isActive ? (
                <View style={styles.popularBadge}>
                  <Star size={10} color="#fff" />
                  <Text style={styles.popularText}>Popüler</Text>
                </View>
              ) : null}
              {isActive ? (
                <View style={styles.activeBadge}>
                  <Check size={10} color="#fff" />
                  <Text style={styles.activeText}>Aktif</Text>
                </View>
              ) : null}
              <View style={styles.planHeader}>
                <Text style={[styles.planName, isActive && styles.planNameActive]}>
                  {plan.name}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.planPrice, isActive && styles.planPriceActive]}>
                    {plan.price}
                  </Text>
                  {plan.period ? (
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.planFeatures}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check size={14} color={isActive ? colors.primary : colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>
          {isAdmin ? (
            <Pressable style={styles.adminMenuItem} onPress={() => router.push('/admin' as any)}>
              <View style={styles.adminIconWrap}>
                <Settings2 size={20} color="#fff" />
              </View>
              <View style={styles.adminMenuText}>
                <Text style={styles.adminMenuLabel}>Admin Paneli</Text>
                <Text style={styles.adminMenuDesc}>Kategori, marka ve kampanya yönetimi</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </Pressable>
          ) : null}
          {[
            { icon: Bell, label: 'Bildirim Ayarları' },
            { icon: Shield, label: 'Gizlilik Politikası' },
            { icon: Info, label: 'Hakkında' },
          ].map((item, idx) => (
            <Pressable key={idx} style={styles.menuItem}>
              <item.icon size={20} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statCardPremium: {
    backgroundColor: colors.badgePremium,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600' as const,
  },
  premiumBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '40',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  premiumBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  premiumBannerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  planCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '06',
  },
  planCardPopular: {
    borderColor: colors.accent + '60',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
    marginBottom: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
    marginBottom: 8,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  planNameActive: {
    color: colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  planPriceActive: {
    color: colors.primary,
  },
  planPeriod: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  planFeatures: {
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  menuSection: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  adminMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#4F46E5' + '30',
  },
  adminIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminMenuText: {
    flex: 1,
  },
  adminMenuLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#4F46E5',
  },
  adminMenuDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
