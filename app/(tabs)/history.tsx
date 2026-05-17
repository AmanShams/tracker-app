import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar, Dimensions, LayoutChangeEvent, Platform, TextInput, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MainHeader } from '../../components/main-header';
import { TransactionList } from '../../components/transaction-list';
import { useTransactions } from '../../store/transactionStore';
import { useThemeStore } from '../../store/themeStore';
import { typography } from '@/constants/typography';

export default function HistoryScreen() {
  const { transactions } = useTransactions();
  const { isDark, colors } = useThemeStore();
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Filter by Type
      if (activeFilter !== 'All' && tx.type.toLowerCase() !== activeFilter.toLowerCase()) {
        return false;
      }
      // 2. Filter by Search Query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = tx.name?.toLowerCase().includes(query);
        const matchesCategory = tx.categoryName?.toLowerCase().includes(query);
        const matchesNotes = tx.notes?.toLowerCase().includes(query);
        return matchesName || matchesCategory || matchesNotes;
      }
      return true;
    });
  }, [transactions, activeFilter, searchQuery]);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* 1. Header (FIXED) */}
      <View style={[s.pinnedHeader, { backgroundColor: colors.bg }]} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <MainHeader />
            <Text style={[typography.headingLarge, { fontSize: 28, lineHeight: 34, color: colors.text, marginBottom: 4 }]}>Transactions</Text>

            {/* Premium Search Bar */}
            <View style={[s.searchContainer, { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7', borderColor: isDark ? '#2C2C2E' : '#E8E8ED' }]}>
              <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[s.searchInput, { color: colors.text }]}
                placeholder="Search transactions..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow} style={{ marginTop: 12 }}>
              {['All', 'Expense', 'Income'].map((f) => {
                const isActive = f === activeFilter;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setActiveFilter(f)}
                    activeOpacity={0.7}
                    style={[
                      s.filterPill,
                      { backgroundColor: colors.bg, borderColor: colors.border },
                      isActive && { backgroundColor: colors.accent + '20', borderColor: colors.accent }
                    ]}
                  >
                    <Text style={[isActive ? typography.filterActive : typography.filterInactive, { color: isActive ? colors.accent : colors.textSecondary }]}>{f}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>

      {/* 2. Scrolling Content */}
      <ScrollView
        style={[s.scroll, { marginTop: pinnedHeaderH }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <TransactionList transactions={filteredTransactions} showFilter={false} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 10, paddingTop: Platform.OS === 'web' ? 10 : 0 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    paddingVertical: 8,
  },
  filterRow: {
    gap: 8,
    alignItems: 'center',
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
});
