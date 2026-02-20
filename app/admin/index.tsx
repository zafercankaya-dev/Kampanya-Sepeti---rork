import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  X,
  Check,
  LayoutDashboard,
  Tag,
  Store,
  Megaphone,
  Globe,
  ShieldAlert,
  Monitor,
  Shirt,
  ShoppingCart,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  UtensilsCrossed,
} from 'lucide-react-native';
import { brands as mockBrands } from '@/mocks/brands';
import { categories as mockCategories } from '@/mocks/categories';
import { campaigns as mockCampaigns } from '@/mocks/campaigns';
import { crawlRules as mockCrawlRules } from '@/mocks/crawlRules';
import { Brand, Category, Campaign, CrawlRule } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminCategories } from '@/components/admin/AdminCategories';
import { AdminBrands } from '@/components/admin/AdminBrands';
import { AdminCampaigns } from '@/components/admin/AdminCampaigns';
import { AdminCrawler } from '@/components/admin/AdminCrawler';
import colors from '@/constants/colors';

type AdminTab = 'dashboard' | 'categories' | 'brands' | 'campaigns' | 'crawler';

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Monitor, Shirt, ShoppingCart, Home, Sparkles,
  Dumbbell, BookOpen, UtensilsCrossed,
};

interface EditCategoryForm {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface EditBrandForm {
  id: string;
  name: string;
  domain: string;
  logo_url: string;
  category_ids: string[];
}

interface EditCampaignForm {
  id: string;
  title: string;
  description: string;
  brand_id: string;
  category_id: string;
  discount_rate: string;
  status: 'active' | 'expired' | 'hidden';
}

interface EditCrawlRuleForm {
  id: string;
  brand_id: string;
  url: string;
  selector_title: string;
  selector_discount: string;
  selector_image: string;
  selector_description: string;
  schedule: 'hourly' | 'daily' | 'weekly';
  is_active: boolean;
}

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [categoriesList, setCategoriesList] = useState<Category[]>(mockCategories);
  const [brandsList, setBrandsList] = useState<Brand[]>(mockBrands);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>(mockCampaigns);
  const [crawlRulesList, setCrawlRulesList] = useState<CrawlRule[]>(mockCrawlRules);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EditCategoryForm | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<EditBrandForm | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EditCampaignForm | null>(null);
  const [showCrawlModal, setShowCrawlModal] = useState(false);
  const [editingCrawlRule, setEditingCrawlRule] = useState<EditCrawlRuleForm | null>(null);

  const handleBack = useCallback(() => { router.back(); }, [router]);

  if (!isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
            <ArrowLeft size={22} color="#1E293B" />
          </Pressable>
          <Text style={styles.topBarTitle}>Admin Paneli</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.accessDenied}>
          <ShieldAlert size={56} color={colors.danger} />
          <Text style={styles.accessDeniedTitle}>Erişim Engellendi</Text>
          <Text style={styles.accessDeniedText}>Bu sayfaya erişim yetkiniz bulunmamaktadır.</Text>
          <Pressable style={styles.accessDeniedBtn} onPress={handleBack}>
            <Text style={styles.accessDeniedBtnText}>Geri Dön</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const openAddCategory = () => {
    setEditingCategory({ id: '', name: '', icon: 'Tag', color: '#4A90D9' });
    setShowCategoryModal(true);
  };
  const openEditCategory = (cat: Category) => {
    setEditingCategory({ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color });
    setShowCategoryModal(true);
  };
  const saveCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) { Alert.alert('Hata', 'Kategori adı gerekli'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (editingCategory.id) {
      setCategoriesList(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: editingCategory.name, icon: editingCategory.icon, color: editingCategory.color } : c));
    } else {
      setCategoriesList(prev => [...prev, { id: `cat-${Date.now()}`, name: editingCategory.name, icon: editingCategory.icon, color: editingCategory.color }]);
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
  };
  const deleteCategory = (id: string) => {
    Alert.alert('Kategoriyi Sil', 'Bu kategoriyi silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => setCategoriesList(prev => prev.filter(c => c.id !== id)) },
    ]);
  };

  const openAddBrand = () => {
    setEditingBrand({ id: '', name: '', domain: '', logo_url: '', category_ids: [] });
    setShowBrandModal(true);
  };
  const openEditBrand = (brand: Brand) => {
    setEditingBrand({ id: brand.id, name: brand.name, domain: brand.domain, logo_url: brand.logo_url, category_ids: brand.category_ids });
    setShowBrandModal(true);
  };
  const saveBrand = () => {
    if (!editingBrand || !editingBrand.name.trim()) { Alert.alert('Hata', 'Marka adı gerekli'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (editingBrand.id) {
      setBrandsList(prev => prev.map(b => b.id === editingBrand.id ? { ...b, name: editingBrand.name, domain: editingBrand.domain, logo_url: editingBrand.logo_url, category_ids: editingBrand.category_ids } : b));
    } else {
      setBrandsList(prev => [...prev, { id: `brand-${Date.now()}`, name: editingBrand.name, domain: editingBrand.domain, logo_url: editingBrand.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop', campaign_count: 0, category_ids: editingBrand.category_ids }]);
    }
    setShowBrandModal(false);
    setEditingBrand(null);
  };
  const deleteBrand = (id: string) => {
    Alert.alert('Markayı Sil', 'Bu markayı silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => setBrandsList(prev => prev.filter(b => b.id !== id)) },
    ]);
  };
  const toggleBrandCategory = (catId: string) => {
    if (!editingBrand) return;
    setEditingBrand(prev => {
      if (!prev) return prev;
      const has = prev.category_ids.includes(catId);
      return { ...prev, category_ids: has ? prev.category_ids.filter(c => c !== catId) : [...prev.category_ids, catId] };
    });
  };

  const toggleCampaignStatus = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCampaignsList(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'hidden' as const : 'active' as const } : c));
  };
  const openEditCampaign = (campaign: Campaign) => {
    setEditingCampaign({ id: campaign.id, title: campaign.title, description: campaign.description, brand_id: campaign.brand_id, category_id: campaign.category_id, discount_rate: campaign.discount_rate?.toString() ?? '', status: campaign.status });
    setShowCampaignModal(true);
  };
  const saveCampaign = () => {
    if (!editingCampaign || !editingCampaign.title.trim()) { Alert.alert('Hata', 'Kampanya başlığı gerekli'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCampaignsList(prev => prev.map(c => c.id === editingCampaign.id ? { ...c, title: editingCampaign.title, description: editingCampaign.description, discount_rate: editingCampaign.discount_rate ? parseInt(editingCampaign.discount_rate, 10) : null, status: editingCampaign.status } : c));
    setShowCampaignModal(false);
    setEditingCampaign(null);
  };
  const deleteCampaign = (id: string) => {
    Alert.alert('Kampanyayı Sil', 'Bu kampanyayı silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => setCampaignsList(prev => prev.filter(c => c.id !== id)) },
    ]);
  };

  const openAddCrawlRule = () => {
    setEditingCrawlRule({ id: '', brand_id: brandsList[0]?.id ?? '', url: '', selector_title: '', selector_discount: '', selector_image: '', selector_description: '', schedule: 'daily', is_active: true });
    setShowCrawlModal(true);
  };
  const openEditCrawlRule = (rule: CrawlRule) => {
    setEditingCrawlRule({ id: rule.id, brand_id: rule.brand_id, url: rule.url, selector_title: rule.selector_title, selector_discount: rule.selector_discount, selector_image: rule.selector_image, selector_description: rule.selector_description, schedule: rule.schedule, is_active: rule.is_active });
    setShowCrawlModal(true);
  };
  const saveCrawlRule = () => {
    if (!editingCrawlRule || !editingCrawlRule.url.trim()) { Alert.alert('Hata', 'URL gerekli'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (editingCrawlRule.id) {
      setCrawlRulesList(prev => prev.map(r => r.id === editingCrawlRule.id ? { ...r, brand_id: editingCrawlRule.brand_id, url: editingCrawlRule.url, selector_title: editingCrawlRule.selector_title, selector_discount: editingCrawlRule.selector_discount, selector_image: editingCrawlRule.selector_image, selector_description: editingCrawlRule.selector_description, schedule: editingCrawlRule.schedule, is_active: editingCrawlRule.is_active } : r));
    } else {
      setCrawlRulesList(prev => [...prev, { id: `cr-${Date.now()}`, brand_id: editingCrawlRule.brand_id, url: editingCrawlRule.url, selector_title: editingCrawlRule.selector_title, selector_discount: editingCrawlRule.selector_discount, selector_image: editingCrawlRule.selector_image, selector_description: editingCrawlRule.selector_description, schedule: editingCrawlRule.schedule, is_active: editingCrawlRule.is_active, last_crawled_at: null, created_at: new Date().toISOString() }]);
    }
    setShowCrawlModal(false);
    setEditingCrawlRule(null);
  };
  const toggleCrawlRuleActive = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCrawlRulesList(prev => prev.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r));
  };
  const deleteCrawlRule = (id: string) => {
    Alert.alert('Crawler Kuralını Sil', 'Bu crawler kuralını silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => setCrawlRulesList(prev => prev.filter(r => r.id !== id)) },
    ]);
  };
  const simulateCrawl = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCrawlRulesList(prev => prev.map(r => r.id === id ? { ...r, last_crawled_at: new Date().toISOString() } : r));
    Alert.alert('Crawl Başlatıldı', 'Seçili URL için crawl işlemi simüle edildi.');
  };

  const TABS: { key: AdminTab; label: string; icon: React.ComponentType<{ size: number; color: string }> }[] = [
    { key: 'dashboard', label: 'Genel', icon: LayoutDashboard },
    { key: 'categories', label: 'Kategoriler', icon: Tag },
    { key: 'brands', label: 'Markalar', icon: Store },
    { key: 'campaigns', label: 'Kampanyalar', icon: Megaphone },
    { key: 'crawler', label: 'Crawler', icon: Globe },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <ArrowLeft size={22} color="#1E293B" />
        </Pressable>
        <Text style={styles.topBarTitle}>Admin Paneli</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBarScroll} contentContainerStyle={styles.tabBarContent}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab.key); }}
            >
              <tab.icon size={18} color={isActive ? '#4F46E5' : '#94A3B8'} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'dashboard' && <AdminDashboard campaigns={campaignsList} brands={brandsList} categories={categoriesList} crawlRules={crawlRulesList} onEditCampaign={openEditCampaign} />}
        {activeTab === 'categories' && <AdminCategories categories={categoriesList} brands={brandsList} campaigns={campaignsList} iconMap={iconMap} onAdd={openAddCategory} onEdit={openEditCategory} onDelete={deleteCategory} />}
        {activeTab === 'brands' && <AdminBrands brands={brandsList} categories={categoriesList} onAdd={openAddBrand} onEdit={openEditBrand} onDelete={deleteBrand} />}
        {activeTab === 'campaigns' && <AdminCampaigns campaigns={campaignsList} brands={brandsList} categories={categoriesList} onToggleStatus={toggleCampaignStatus} onEdit={openEditCampaign} onDelete={deleteCampaign} />}
        {activeTab === 'crawler' && <AdminCrawler crawlRules={crawlRulesList} brands={brandsList} onAdd={openAddCrawlRule} onEdit={openEditCrawlRule} onDelete={deleteCrawlRule} onToggleActive={toggleCrawlRuleActive} onSimulateCrawl={simulateCrawl} />}
      </ScrollView>

      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCategory?.id ? 'Kategori Düzenle' : 'Yeni Kategori'}</Text>
              <Pressable onPress={() => { setShowCategoryModal(false); setEditingCategory(null); }} hitSlop={12}>
                <X size={22} color="#1E293B" />
              </Pressable>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Kategori Adı</Text>
              <TextInput style={styles.formInput} value={editingCategory?.name ?? ''} onChangeText={t => setEditingCategory(prev => prev ? { ...prev, name: t } : prev)} placeholder="Kategori adı girin" placeholderTextColor="#94A3B8" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>İkon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.iconPickerRow}>
                  {Object.keys(iconMap).map(iconKey => {
                    const Ic = iconMap[iconKey];
                    const selected = editingCategory?.icon === iconKey;
                    return (
                      <Pressable key={iconKey} style={[styles.iconPickerItem, selected && { backgroundColor: (editingCategory?.color ?? '#4A90D9') + '20', borderColor: editingCategory?.color ?? '#4A90D9' }]} onPress={() => setEditingCategory(prev => prev ? { ...prev, icon: iconKey } : prev)}>
                        <Ic size={20} color={selected ? (editingCategory?.color ?? '#4A90D9') : '#94A3B8'} />
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Renk</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.colorPickerRow}>
                  {['#4A90D9', '#E8553A', '#2ED573', '#FF9F43', '#FF6B81', '#7C5CFC', '#17A2B8', '#FD7E14', '#6366F1', '#EC4899'].map(c => (
                    <Pressable key={c} style={[styles.colorDot, { backgroundColor: c }, editingCategory?.color === c && styles.colorDotSelected]} onPress={() => setEditingCategory(prev => prev ? { ...prev, color: c } : prev)} />
                  ))}
                </View>
              </ScrollView>
            </View>
            <Pressable style={styles.saveButton} onPress={saveCategory}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showBrandModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingBrand?.id ? 'Marka Düzenle' : 'Yeni Marka'}</Text>
              <Pressable onPress={() => { setShowBrandModal(false); setEditingBrand(null); }} hitSlop={12}>
                <X size={22} color="#1E293B" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Marka Adı</Text>
                <TextInput style={styles.formInput} value={editingBrand?.name ?? ''} onChangeText={t => setEditingBrand(prev => prev ? { ...prev, name: t } : prev)} placeholder="Marka adı girin" placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Domain</Text>
                <TextInput style={styles.formInput} value={editingBrand?.domain ?? ''} onChangeText={t => setEditingBrand(prev => prev ? { ...prev, domain: t } : prev)} placeholder="ornek.com" placeholderTextColor="#94A3B8" autoCapitalize="none" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Logo URL</Text>
                <TextInput style={styles.formInput} value={editingBrand?.logo_url ?? ''} onChangeText={t => setEditingBrand(prev => prev ? { ...prev, logo_url: t } : prev)} placeholder="https://..." placeholderTextColor="#94A3B8" autoCapitalize="none" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kategoriler</Text>
                <View style={styles.categoryChipsRow}>
                  {categoriesList.map(cat => {
                    const selected = editingBrand?.category_ids.includes(cat.id) ?? false;
                    return (
                      <Pressable key={cat.id} style={[styles.categoryChip, selected && { backgroundColor: cat.color + '20', borderColor: cat.color }]} onPress={() => toggleBrandCategory(cat.id)}>
                        <Text style={[styles.categoryChipText, selected && { color: cat.color }]}>{cat.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
            <Pressable style={styles.saveButton} onPress={saveBrand}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showCampaignModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kampanya Düzenle</Text>
              <Pressable onPress={() => { setShowCampaignModal(false); setEditingCampaign(null); }} hitSlop={12}>
                <X size={22} color="#1E293B" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Başlık</Text>
                <TextInput style={styles.formInput} value={editingCampaign?.title ?? ''} onChangeText={t => setEditingCampaign(prev => prev ? { ...prev, title: t } : prev)} placeholder="Kampanya başlığı" placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Açıklama</Text>
                <TextInput style={[styles.formInput, styles.formTextArea]} value={editingCampaign?.description ?? ''} onChangeText={t => setEditingCampaign(prev => prev ? { ...prev, description: t } : prev)} placeholder="Kampanya açıklaması" placeholderTextColor="#94A3B8" multiline numberOfLines={3} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>İndirim Oranı (%)</Text>
                <TextInput style={styles.formInput} value={editingCampaign?.discount_rate ?? ''} onChangeText={t => setEditingCampaign(prev => prev ? { ...prev, discount_rate: t } : prev)} placeholder="25" placeholderTextColor="#94A3B8" keyboardType="numeric" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Durum</Text>
                <View style={styles.statusRow}>
                  {(['active', 'hidden', 'expired'] as const).map(status => {
                    const selected = editingCampaign?.status === status;
                    const statusLabels: Record<string, string> = { active: 'Aktif', hidden: 'Gizli', expired: 'Süresi Dolmuş' };
                    const statusClr: Record<string, string> = { active: '#059669', hidden: '#6B7280', expired: '#DC2626' };
                    return (
                      <Pressable key={status} style={[styles.statusChip, selected && { backgroundColor: statusClr[status] + '18', borderColor: statusClr[status] }]} onPress={() => setEditingCampaign(prev => prev ? { ...prev, status } : prev)}>
                        <Text style={[styles.statusChipText, selected && { color: statusClr[status] }]}>{statusLabels[status]}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
            <Pressable style={styles.saveButton} onPress={saveCampaign}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showCrawlModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCrawlRule?.id ? 'Crawler Düzenle' : 'Yeni Crawler Kuralı'}</Text>
              <Pressable onPress={() => { setShowCrawlModal(false); setEditingCrawlRule(null); }} hitSlop={12}>
                <X size={22} color="#1E293B" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Marka</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryChipsRow}>
                    {brandsList.map(brand => {
                      const selected = editingCrawlRule?.brand_id === brand.id;
                      return (
                        <Pressable key={brand.id} style={[styles.categoryChip, selected && { backgroundColor: '#4F46E520', borderColor: '#4F46E5' }]} onPress={() => setEditingCrawlRule(prev => prev ? { ...prev, brand_id: brand.id } : prev)}>
                          <Text style={[styles.categoryChipText, selected && { color: '#4F46E5' }]}>{brand.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Crawl URL</Text>
                <TextInput style={styles.formInput} value={editingCrawlRule?.url ?? ''} onChangeText={t => setEditingCrawlRule(prev => prev ? { ...prev, url: t } : prev)} placeholder="https://www.ornek.com/kampanyalar" placeholderTextColor="#94A3B8" autoCapitalize="none" keyboardType="url" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Başlık Seçici (CSS)</Text>
                <TextInput style={styles.formInput} value={editingCrawlRule?.selector_title ?? ''} onChangeText={t => setEditingCrawlRule(prev => prev ? { ...prev, selector_title: t } : prev)} placeholder=".campaign-title" placeholderTextColor="#94A3B8" autoCapitalize="none" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>İndirim Seçici (CSS)</Text>
                <TextInput style={styles.formInput} value={editingCrawlRule?.selector_discount ?? ''} onChangeText={t => setEditingCrawlRule(prev => prev ? { ...prev, selector_discount: t } : prev)} placeholder=".discount-badge" placeholderTextColor="#94A3B8" autoCapitalize="none" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Görsel Seçici (CSS)</Text>
                <TextInput style={styles.formInput} value={editingCrawlRule?.selector_image ?? ''} onChangeText={t => setEditingCrawlRule(prev => prev ? { ...prev, selector_image: t } : prev)} placeholder=".campaign-image img" placeholderTextColor="#94A3B8" autoCapitalize="none" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Açıklama Seçici (CSS)</Text>
                <TextInput style={styles.formInput} value={editingCrawlRule?.selector_description ?? ''} onChangeText={t => setEditingCrawlRule(prev => prev ? { ...prev, selector_description: t } : prev)} placeholder=".campaign-desc" placeholderTextColor="#94A3B8" autoCapitalize="none" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Crawl Sıklığı</Text>
                <View style={styles.statusRow}>
                  {(['hourly', 'daily', 'weekly'] as const).map(schedule => {
                    const selected = editingCrawlRule?.schedule === schedule;
                    const scheduleLabels: Record<string, string> = { hourly: 'Saatlik', daily: 'Günlük', weekly: 'Haftalık' };
                    return (
                      <Pressable key={schedule} style={[styles.statusChip, selected && { backgroundColor: '#4F46E518', borderColor: '#4F46E5' }]} onPress={() => setEditingCrawlRule(prev => prev ? { ...prev, schedule } : prev)}>
                        <Text style={[styles.statusChipText, selected && { color: '#4F46E5' }]}>{scheduleLabels[schedule]}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
            <Pressable style={styles.saveButton} onPress={saveCrawlRule}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E293B',
  },
  tabBarScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    maxHeight: 52,
  },
  tabBarContent: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 5,
  },
  tabItemActive: {
    backgroundColor: '#EEF2FF',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  accessDeniedBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  accessDeniedBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalScrollContent: {
    maxHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E293B',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#64748B',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  iconPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconPickerItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: '#1E293B',
  },
  categoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
