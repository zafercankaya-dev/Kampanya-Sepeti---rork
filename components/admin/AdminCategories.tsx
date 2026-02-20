import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react-native';
import { Brand, Campaign, Category } from '@/types';
import colors from '@/constants/colors';

interface AdminCategoriesProps {
  categories: Category[];
  brands: Brand[];
  campaigns: Campaign[];
  iconMap: Record<string, React.ComponentType<{ size: number; color: string }>>;
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

export function AdminCategories({ categories, brands, campaigns, iconMap, onAdd, onEdit, onDelete }: AdminCategoriesProps) {
  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>{categories.length} kategori</Text>
        <Pressable style={styles.addButton} onPress={onAdd}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addButtonText}>Ekle</Text>
        </Pressable>
      </View>
      {categories.map(cat => {
        const IconComp = iconMap[cat.icon];
        const brandCount = brands.filter(b => b.category_ids.includes(cat.id)).length;
        const campaignCount = campaigns.filter(c => c.category_id === cat.id).length;
        return (
          <View key={cat.id} style={styles.listItem}>
            <View style={[styles.listItemIcon, { backgroundColor: cat.color + '18' }]}>
              {IconComp ? <IconComp size={20} color={cat.color} /> : <Tag size={20} color={cat.color} />}
            </View>
            <View style={styles.listItemInfo}>
              <Text style={styles.listItemName}>{cat.name}</Text>
              <Text style={styles.listItemMeta}>{brandCount} marka, {campaignCount} kampanya</Text>
            </View>
            <Pressable style={styles.iconBtn} onPress={() => onEdit(cat)} hitSlop={8}>
              <Pencil size={16} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => onDelete(cat.id)} hitSlop={8}>
              <Trash2 size={16} color={colors.danger} />
            </Pressable>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemInfo: {
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
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
