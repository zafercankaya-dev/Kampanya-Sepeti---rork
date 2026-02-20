import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Megaphone, Check, Store, Tag, Globe, ChevronRight } from 'lucide-react-native';
import { Brand, Campaign, CrawlRule, Category } from '@/types';
import colors from '@/constants/colors';

interface AdminDashboardProps {
  campaigns: Campaign[];
  brands: Brand[];
  categories: Category[];
  crawlRules: CrawlRule[];
  onEditCampaign: (campaign: Campaign) => void;
}

export function AdminDashboard({ campaigns, brands, categories, crawlRules, onEditCampaign }: AdminDashboardProps) {
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalBrands: brands.length,
    totalCategories: categories.length,
    activeCrawlers: crawlRules.filter(c => c.is_active).length,
    totalCrawlers: crawlRules.length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: '#EEF2FF' }]}>
          <Megaphone size={24} color="#4F46E5" />
          <Text style={[styles.statBoxValue, { color: '#4F46E5' }]}>{stats.totalCampaigns}</Text>
          <Text style={styles.statBoxLabel}>Toplam Kampanya</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#ECFDF5' }]}>
          <Check size={24} color="#059669" />
          <Text style={[styles.statBoxValue, { color: '#059669' }]}>{stats.activeCampaigns}</Text>
          <Text style={styles.statBoxLabel}>Aktif Kampanya</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#FFF7ED' }]}>
          <Store size={24} color="#EA580C" />
          <Text style={[styles.statBoxValue, { color: '#EA580C' }]}>{stats.totalBrands}</Text>
          <Text style={styles.statBoxLabel}>Marka</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#FDF2F8' }]}>
          <Tag size={24} color="#DB2777" />
          <Text style={[styles.statBoxValue, { color: '#DB2777' }]}>{stats.totalCategories}</Text>
          <Text style={styles.statBoxLabel}>Kategori</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#F0FDF4' }]}>
          <Globe size={24} color="#16A34A" />
          <Text style={[styles.statBoxValue, { color: '#16A34A' }]}>{stats.activeCrawlers}/{stats.totalCrawlers}</Text>
          <Text style={styles.statBoxLabel}>Aktif Crawler</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Son Eklenen Kampanyalar</Text>
      {campaigns.slice(0, 5).map(campaign => {
        const brand = brands.find(b => b.id === campaign.brand_id);
        return (
          <Pressable key={campaign.id} style={styles.recentItem} onPress={() => onEditCampaign(campaign)}>
            <View style={styles.recentLeft}>
              <View style={[styles.statusDot, { backgroundColor: campaign.status === 'active' ? colors.success : colors.textTertiary }]} />
              <View style={styles.recentInfo}>
                <Text style={styles.recentTitle} numberOfLines={1}>{campaign.title}</Text>
                <Text style={styles.recentMeta}>
                  {brand?.name ?? 'Bilinmeyen'}
                  {campaign.discount_rate ? ` | %${campaign.discount_rate}` : ''}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'flex-start',
    gap: 8,
  },
  statBoxValue: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  statBoxLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E293B',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  recentLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  recentMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
