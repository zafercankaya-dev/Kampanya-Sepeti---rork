import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Plus, Pencil, Trash2 } from 'lucide-react-native';
import { Brand, Category } from '@/types';
import colors from '@/constants/colors';

interface AdminBrandsProps {
  brands: Brand[];
  categories: Category[];
  onAdd: () => void;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
}

export function AdminBrands({ brands, categories, onAdd, onEdit, onDelete }: AdminBrandsProps) {
  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>{brands.length} marka</Text>
        <Pressable style={styles.addButton} onPress={onAdd}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addButtonText}>Ekle</Text>
        </Pressable>
      </View>
      {brands.map(brand => {
        const catNames = brand.category_ids
          .map(cid => categories.find(c => c.id === cid)?.name)
          .filter(Boolean)
          .join(', ');
        return (
          <View key={brand.id} style={styles.listItem}>
            <Image source={{ uri: brand.logo_url }} style={styles.brandLogo} contentFit="cover" />
            <View style={styles.listItemInfo}>
              <Text style={styles.listItemName}>{brand.name}</Text>
              <Text style={styles.listItemMeta}>{brand.domain}</Text>
              {catNames ? <Text style={styles.listItemCats}>{catNames}</Text> : null}
            </View>
            <Pressable style={styles.iconBtn} onPress={() => onEdit(brand)} hitSlop={8}>
              <Pencil size={16} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => onDelete(brand.id)} hitSlop={8}>
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
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
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
  listItemCats: {
    fontSize: 11,
    color: '#4F46E5',
    marginTop: 2,
    fontWeight: '500' as const,
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
