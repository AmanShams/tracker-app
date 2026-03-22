import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
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
import { MainHeader } from '../../components/main-header';

const SCREEN_H = Dimensions.get('window').height;

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


export default function ActivityScreen() {
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);
  const [activeRange, setActiveRange] = useState('Week');

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* 1. Header (FIXED) */}
      <View style={s.pinnedHeader} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <MainHeader actions={[{ icon: 'calendar-outline' }]} />
            <Text style={[typography.headingLarge, { fontSize: 28 }]}>Activity</Text>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
              {['Week', 'Month', 'Year'].map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setActiveRange(r)}
                  style={[s.filterPill, activeRange === r && s.filterPillActive]}
                >
                  <Text style={activeRange === r ? typography.filterActive : typography.filterInactive}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={s.listBody}>
          <View style={s.placeholderCard}>
            <Ionicons name="stats-chart" size={40} color={C.tertiary} />
            <Text style={s.placeholderText}>Detailed insights coming soon</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 0 },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: C.surface, zIndex: 100 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 15, paddingTop: Platform.OS === 'web' ? 10 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 10, marginBottom: 5 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoText: { fontFamily: 'Inter_700Bold', fontSize: 18, fontWeight: '700', letterSpacing: -1, fontStyle: "italic", color: '#111111' },
  headerIconGroup: { flexDirection: 'row', gap: 8 },
  squareBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8ED' },

  stickyFilterContainer: { backgroundColor: C.surface, zIndex: 10 },
  filterWrapper: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
  filterRow: { gap: 8, alignItems: 'center' },
  filterPill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F4F4F6' },
  filterPillActive: { backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: C.dark },

  listBody: { backgroundColor: C.surface, paddingHorizontal: 14, paddingBottom: 40 },
  placeholderCard: { height: 200, backgroundColor: '#F9F9FB', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#EDEEF2', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  placeholderText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#A0A0A5', marginTop: 12 },
});
