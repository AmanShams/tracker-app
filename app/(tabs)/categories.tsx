import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { typography } from '@/constants/typography';
import { CategoryType, useCategories } from '../../store/categoryStore';
import { ConfirmModal } from '../../components/confirm-modal';

const C = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  dark: '#111111',
  primary: '#111111',
  secondary: '#8E8E93',
  tertiary: '#C7C7CC',
  accent: '#7C6EEA',
  green: '#16A34A',
  separator: '#F0F0F3',
};

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <View style={s.header}>
      <View style={s.logoRow}>
        <Text style={s.logoText}>MANs Tracker</Text>
      </View>
      <View style={s.headerIconGroup}>
        <TouchableOpacity activeOpacity={0.7} style={s.squareBtn}>
          <Ionicons name="settings-outline" size={16} color={C.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Shared Components ─────────────────────────────────────────────────────────
function CategoriesTabs({ active, onSelect }: { active: CategoryType; onSelect: (f: CategoryType) => void }) {
  const tabs: CategoryType[] = ['expense', 'income'];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
      {tabs.map((f) => {
        const isActive = f === active;
        const label = f.charAt(0).toUpperCase() + f.slice(1);
        return (
          <TouchableOpacity
            key={f}
            onPress={() => onSelect(f)}
            activeOpacity={0.7}
            style={[s.filterPill, isActive && s.filterPillActive]}
          >
            <Text style={isActive ? typography.filterActive : typography.filterInactive}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, deleteCategory } = useCategories();
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);

  // New state for custom modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const filteredCategories = categories.filter(cat => cat.type === activeTab);

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  const handleDeleteTrigger = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* 1. Header (FIXED) */}
      <View style={s.pinnedHeader} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <Header />
            <View style={s.titleRow}>
              <Text style={[typography.headingLarge, { fontSize: 28 }]}>Categories</Text>
              <TouchableOpacity
                style={s.addBtnHeader}
                activeOpacity={0.7}
                onPress={() => router.push('/create-category')}
              >
                <Ionicons name="add" size={24} color={C.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* 2. Scrolling Content */}
      <ScrollView
        style={[s.scroll, { marginTop: pinnedHeaderH }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        stickyHeaderIndices={[0]}
      >
        {/* Sticky Filter Only (BELT REMOVED) */}
        <View style={s.stickyFilterContainer}>
          <View style={s.filterWrapper}>
            <CategoriesTabs active={activeTab} onSelect={setActiveTab} />
          </View>
        </View>

        {/* Categories List Body */}
        <View style={s.listBody}>
          <View style={s.list}>
            {filteredCategories.map((item, i) => (
              <View key={item.id}>
                <View style={s.row}>
                  <View style={s.iconOuter}>
                    <View style={[s.iconBox, { backgroundColor: item.color + '12', borderColor: item.color + '20' }]}>
                      <Ionicons name={item.icon as any} size={15} color={item.color} />
                    </View>
                  </View>
                  <View style={s.textSide}>
                    <Text style={typography.txTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={[typography.txSubtitle, { marginTop: 1 }]} numberOfLines={1}>Created: {item.createdAt}</Text>
                  </View>
                  <View style={s.actions}>
                    <TouchableOpacity activeOpacity={0.7} style={s.miniBtn}>
                      <Ionicons name="pencil-outline" size={16} color={C.tertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={s.miniBtn} onPress={() => handleDeleteTrigger(item.id, item.name)}>
                      <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
                {i < filteredCategories.length - 1 && <View style={s.separator} />}
              </View>
            ))}
            {filteredCategories.length === 0 && (
              <View style={{ paddingTop: 40, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', color: '#999', fontSize: 14 }}>No categories yet</Text>
              </View>
            )}
          </View>
        </View>

        <ConfirmModal
          visible={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => deleteId && deleteCategory(deleteId)}
          title="Delete Category"
          message={`Delete "${deleteName}"? This action cannot be undone.`}
        />

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 0 },

  pinnedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    zIndex: 100,
  },
  headerContentPadded: {
    paddingHorizontal: 16,
    paddingBottom: 15,
    paddingTop: Platform.OS === 'web' ? 10 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 10,
    marginBottom: 5,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoText: { fontFamily: 'Inter_700Bold', fontSize: 18, fontWeight: '700', letterSpacing: -1, fontStyle: "italic", color: '#111111' },
  headerIconGroup: { flexDirection: 'row', gap: 8 },
  squareBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8ED' },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtnHeader: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8ED' },

  stickyFilterContainer: { backgroundColor: C.surface, zIndex: 10 },
  filterWrapper: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
  filterRow: { gap: 8, alignItems: 'center' },
  filterPill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F4F4F6' },
  filterPillActive: { backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: C.dark },

  listBody: { backgroundColor: C.surface, paddingHorizontal: 14, paddingBottom: 40 },
  list: {},
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  iconOuter: { width: 44, height: 44, borderRadius: 13, borderWidth: 1, borderColor: '#f8f8f8', padding: 1, marginRight: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: 11, borderWidth: 1.3, borderColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  textSide: { flex: 1, marginRight: 8 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 44 + 12 },

  actions: { flexDirection: 'row', gap: 4 },
  miniBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
});
