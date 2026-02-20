import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Plus, Pencil, Trash2, Globe, Play, Pause, Clock, Link } from 'lucide-react-native';
import { Brand, CrawlRule } from '@/types';
import colors from '@/constants/colors';

interface AdminCrawlerProps {
  crawlRules: CrawlRule[];
  brands: Brand[];
  onAdd: () => void;
  onEdit: (rule: CrawlRule) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onSimulateCrawl: (id: string) => void;
}

export function AdminCrawler({ crawlRules, brands, onAdd, onEdit, onDelete, onToggleActive, onSimulateCrawl }: AdminCrawlerProps) {
  const scheduleLabels: Record<string, string> = { hourly: 'Saatlik', daily: 'Günlük', weekly: 'Haftalık' };

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>{crawlRules.length} crawler kuralı</Text>
        <Pressable style={styles.addButton} onPress={onAdd}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addButtonText}>Ekle</Text>
        </Pressable>
      </View>

      <View style={styles.crawlerInfoBox}>
        <Globe size={18} color="#4F46E5" />
        <Text style={styles.crawlerInfoText}>
          Crawler kuralları, belirtilen URL'lerdeki kampanyaları otomatik olarak tarar ve sisteme ekler. Her kural için CSS seçicileri tanımlayarak başlık, indirim oranı, görsel ve açıklama bilgilerini çekebilirsiniz.
        </Text>
      </View>

      {crawlRules.map(rule => {
        const brand = brands.find(b => b.id === rule.brand_id);
        const lastCrawled = rule.last_crawled_at
          ? new Date(rule.last_crawled_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          : 'Henüz çalışmadı';
        return (
          <View key={rule.id} style={styles.crawlerCard}>
            <View style={styles.crawlerCardHeader}>
              <View style={[styles.crawlerStatusIndicator, { backgroundColor: rule.is_active ? '#059669' : '#94A3B8' }]} />
              <View style={styles.crawlerCardInfo}>
                <Text style={styles.crawlerBrandName}>{brand?.name ?? 'Bilinmeyen Marka'}</Text>
                <View style={styles.crawlerUrlRow}>
                  <Link size={12} color="#64748B" />
                  <Text style={styles.crawlerUrl} numberOfLines={1}>{rule.url}</Text>
                </View>
              </View>
            </View>

            <View style={styles.crawlerMetaRow}>
              <View style={styles.crawlerMetaItem}>
                <Clock size={12} color="#64748B" />
                <Text style={styles.crawlerMetaText}>{scheduleLabels[rule.schedule]}</Text>
              </View>
              <View style={styles.crawlerMetaItem}>
                <Text style={styles.crawlerMetaLabel}>Son crawl:</Text>
                <Text style={styles.crawlerMetaText}>{lastCrawled}</Text>
              </View>
            </View>

            <View style={styles.crawlerSelectorsPreview}>
              <Text style={styles.crawlerSelectorLabel}>Seçiciler:</Text>
              <Text style={styles.crawlerSelectorValue} numberOfLines={1}>
                title: {rule.selector_title || '-'} | discount: {rule.selector_discount || '-'}
              </Text>
            </View>

            <View style={styles.crawlerActions}>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: rule.is_active ? '#FEF3C7' : '#ECFDF5' }]}
                onPress={() => onToggleActive(rule.id)}
              >
                {rule.is_active ? <Pause size={14} color="#D97706" /> : <Play size={14} color="#059669" />}
                <Text style={[styles.actionText, { color: rule.is_active ? '#D97706' : '#059669' }]}>
                  {rule.is_active ? 'Duraklat' : 'Başlat'}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: '#F0FDF4' }]}
                onPress={() => onSimulateCrawl(rule.id)}
              >
                <Play size={14} color="#16A34A" />
                <Text style={[styles.actionText, { color: '#16A34A' }]}>Şimdi Çalıştır</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]} onPress={() => onEdit(rule)}>
                <Pencil size={14} color="#4F46E5" />
              </Pressable>
              <Pressable style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => onDelete(rule.id)}>
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
  crawlerInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  crawlerInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#4F46E5',
    lineHeight: 18,
  },
  crawlerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  crawlerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  crawlerStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  crawlerCardInfo: {
    flex: 1,
  },
  crawlerBrandName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1E293B',
  },
  crawlerUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  crawlerUrl: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
  },
  crawlerMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  crawlerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crawlerMetaLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  crawlerMetaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  crawlerSelectorsPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  crawlerSelectorLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#94A3B8',
    marginBottom: 3,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  crawlerSelectorValue: {
    fontSize: 11,
    color: '#64748B',
  },
  crawlerActions: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
