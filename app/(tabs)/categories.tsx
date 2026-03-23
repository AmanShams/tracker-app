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
import { ConfirmModal } from '../../components/confirm-modal';
import { MainHeader } from '../../components/main-header';
import { CategoryType, useCategories } from '../../store/categoryStore';
import { useThemeStore } from '../../store/themeStore';
import { Animated } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef } from 'react';

const AnimatedListItem = ({ children, index, isFocused }: { children: React.ReactNode, index: number, isFocused: boolean }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setIsReady(true);
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    } else {
      setIsReady(false);
    }
  }, [index, isFocused]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View style={{ opacity: isReady ? opacity : 0, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

// ─── Shared Components ─────────────────────────────────────────────────────────
function CategoriesTabs({ active, onSelect }: { active: CategoryType; onSelect: (f: CategoryType) => void }) {
  const tabs: CategoryType[] = ['expense', 'income'];
  const { colors } = useThemeStore();
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
            style={[s.filterPill, { backgroundColor: colors.bg }, isActive && { backgroundColor: colors.accent + '20', borderColor: colors.accent, borderWidth: 1 }]}
          >
            <Text style={[isActive ? typography.filterActive : typography.filterInactive, { color: isActive ? colors.accent : colors.textSecondary }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, deleteCategory } = useCategories();
  const { isDark, colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const isFocused = useIsFocused(); // Added isFocused track
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
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* 1. Sticky Pinned Header */}
      <View style={[s.pinnedHeader, { backgroundColor: colors.bg }]} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <MainHeader actions={[{ icon: 'settings-outline' }]} />
            <View style={s.titleRow}>
              <Text style={[typography.headingLarge, { fontSize: 28, color: colors.text }]}>Categories</Text>
              <TouchableOpacity
                // style={[s.addBtnHeader, { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7', borderColor: isDark ? '#2C2C2E' : '#E8E8ED' }]}
                activeOpacity={0.7}
                onPress={() => router.push('/create-category')}
              >
                <Ionicons name="add" size={24} color={colors.text} />
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
        <View style={[s.stickyFilterContainer, { backgroundColor: colors.bg }]}>
          <View style={[s.filterWrapper, { borderBottomColor: colors.separator }]}>
            <CategoriesTabs active={activeTab} onSelect={setActiveTab} />
          </View>
        </View>

        {/* List Section */}
        <View style={[s.listBody, { backgroundColor: colors.bg }]}>
          <View style={[s.list, { backgroundColor: colors.bg }]}>
            {filteredCategories.map((item, i) => (
              <AnimatedListItem key={item.id} index={i} isFocused={isFocused}>
                <View>
                  <View style={s.row}>
                    <View style={[s.iconOuter, { backgroundColor: colors.surface, borderColor: isDark ? '#1C1C1E' : '#f8f8f8' }]}>
                      <View style={[s.iconBox, { backgroundColor: item.color + '12', borderColor: isDark ? item.color + '40' : item.color + '20' }]}>
                        <Ionicons name={item.icon as any} size={15} color={item.color} />
                      </View>
                    </View>
                    <View style={s.textSide}>
                      <Text style={[typography.txTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[typography.txSubtitle, { marginTop: 1, color: colors.textSecondary }]} numberOfLines={1}>Created: {item.createdAt}</Text>
                    </View>
                    <View style={s.actions}>
                      <TouchableOpacity 
                        activeOpacity={0.7} 
                        style={s.miniBtn}
                        onPress={() => router.push({
                          pathname: '/create-category',
                          params: { editId: item.id }
                        })}
                      >
                        <Ionicons name="pencil-outline" size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.7} style={s.miniBtn} onPress={() => handleDeleteTrigger(item.id, item.name)}>
                        <Ionicons name="trash-outline" size={16} color={colors.red} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {i < filteredCategories.length - 1 && <View style={[s.separator, { backgroundColor: colors.separator }]} />}
                </View>
              </AnimatedListItem>
            ))}
            {filteredCategories.length === 0 && (
              <View style={{ paddingTop: 40, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', color: colors.textTertiary, fontSize: 14 }}>No categories yet</Text>
              </View>
            )}
          </View>
        </View>

        <ConfirmModal
          visible={!!deleteId}
          onClose={() => { setDeleteId(null); setDeleteName(""); }}
          onConfirm={() => {
            if (deleteId) {
              deleteCategory(deleteId);
              setDeleteId(null);
            }
          }}
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
  root: { flex: 1 },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 0 },

  pinnedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContentPadded: {
    paddingHorizontal: 16,
    paddingBottom: 15,
    paddingTop: Platform.OS === 'web' ? 10 : 0,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtnHeader: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  stickyFilterContainer: { zIndex: 10 },
  filterWrapper: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  filterRow: { gap: 8, alignItems: 'center' },
  filterPill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },

  listBody: { paddingHorizontal: 14, paddingBottom: 40 },
  list: {},
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  iconOuter: { width: 44, height: 44, borderRadius: 13, borderWidth: 1, padding: 1, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: 11, borderWidth: 1.3, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  textSide: { flex: 1, marginRight: 8 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 44 + 12 },

  actions: { flexDirection: 'row', gap: 4 },
  miniBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
});
