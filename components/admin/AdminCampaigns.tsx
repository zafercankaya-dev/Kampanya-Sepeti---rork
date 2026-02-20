import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react-native';
import { Brand, Campaign, Category } from '@/types';
import colors from '@/constants/colors';

interface AdminCampaignsProps {
  campaigns: Campaign[];
  brands: Brand[];
  categories: Category[];
  onToggleStatus: (id: string) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
}

export function AdminCampaigns({ campaigns, brands, categories, onToggleStatus, onEdit, onDelete }: AdminCampaignsProps) {
  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>{campaigns.length} kampanya</Text>
      </View>
      {campaigns.map(campaign => {
        const brand = brands.find(b => b.id === campaign.brand_id);
        const category = categories.find(c => c.id === campaign.category_id);
        return (
          <View key={campaign.id} style={styles.campaignListItem}>
            <View style={styles.campaignListTop}>
              <View style={[styles.statusDot, { backgroundColor: campaign.status === 'active' ? colors.success : campaign.status === 'hidden' ? colors.textTertiary : colors.danger }]} />
              <View style={styles.campaignListInfo}>
                <Text style={styles.listItemName} numberOfLines={1}>{campaign.title}</Text>
                <Text style={styles.listItemMeta}>
                  {brand?.name ?? '?'} | {category?.name ?? '?'}
                  {campaign.discount_rate ? ` | %${campaign.discount_rate}` : ''}
                </Text>
              </View>
            </View>
            <View style={styles.campaignActions}>
              <Pressable
                style={[styles.campaignActionBtn, { backgroundColor: campaign.status === 'active' ? '#ECFDF5' : '#FEF3C7' }]}
                onPress={() => onToggleStatus(campaign.id)}
              >
                {campaign.status === 'active' ? (
                  <EyeOff size={14} color="#059669" />
                ) : (
                  <Eye size={14} color="#D97706" />
                )}
                <Text style={[styles.campaignActionText, { color: campaign.status === 'active' ? '#059669' : '#D97706' }]}>
                  {campaign.status === 'active' ? 'Gizle' : 'Aktif Et'}
                </Text>
              </Pressable>
              <Pressable style={[styles.campaignActionBtn, { backgroundColor: '#EEF2FF' }]} onPress={() => onEdit(campaign)}>
                <Pencil size={14} color="#4F46E5" />
                <Text style={[styles.campaignActionText, { color: '#4F46E5' }]}>Düzenle</Text>
              </Pressable>
              <Pressable style={[styles.campaignActionBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => onDelete(campaign.id)}>
                <Trash2 size={14} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  campaignListItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  campaignListTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  campaignListInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  listItemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  campaignActions: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  campaignActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  campaignActionText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
