import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar, Dimensions, LayoutChangeEvent, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { MainHeader } from '../../components/main-header';
import { TransactionList } from '../../components/transaction-list';
import { useTransactions } from '../../store/transactionStore';
import { useThemeStore } from '../../store/themeStore';
import { typography } from '@/constants/typography';

const SCREEN_H = Dimensions.get('window').height;

export default function HistoryScreen() {
  const { transactions } = useTransactions();
  const { isDark, colors } = useThemeStore();
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* 1. Header (FIXED) */}
      <View style={[s.pinnedHeader, { backgroundColor: colors.bg }]} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <MainHeader actions={[{ icon: 'search-outline' }]} />
            <Text style={[typography.headingLarge, { fontSize: 28, color: colors.text }]}>Transactions</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* 2. Scrolling Content */}
      <ScrollView
        style={[s.scroll, { marginTop: pinnedHeaderH }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <TransactionList transactions={transactions} />
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 0 },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 15, paddingTop: Platform.OS === 'web' ? 10 : 0 },
});
