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
import { useThemeStore } from '../../store/themeStore';

const SCREEN_H = Dimensions.get('window').height;


export default function ActivityScreen() {
  const { isDark, colors } = useThemeStore();
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);
  const [activeRange, setActiveRange] = useState('Week');

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
            <MainHeader actions={[{ icon: 'calendar-outline' }]} />
            <Text style={[typography.headingLarge, { fontSize: 28, color: colors.text }]}>Activity</Text>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
              {['Week', 'Month', 'Year'].map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setActiveRange(r)}
                  style={[s.filterPill, { backgroundColor: colors.bg }, activeRange === r && { backgroundColor: colors.accent + '20', borderColor: colors.accent, borderWidth: 1 }]}
                >
                  <Text style={[activeRange === r ? typography.filterActive : typography.filterInactive, { color: activeRange === r ? colors.accent : colors.textSecondary }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={[s.listBody, { backgroundColor: colors.bg }]}>
          <View style={[s.placeholderCard, { backgroundColor: isDark ? '#1C1C1E' : '#F9F9FB', borderColor: isDark ? '#2C2C2E' : '#EDEEF2' }]}>
            <Ionicons name="stats-chart" size={40} color={colors.textTertiary} />
            <Text style={[s.placeholderText, { color: colors.textSecondary }]}>Detailed insights coming soon</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 0 },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 15, paddingTop: Platform.OS === 'web' ? 10 : 0 },

  stickyFilterContainer: { zIndex: 10 },
  filterWrapper: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  filterRow: { gap: 8, alignItems: 'center' },
  filterPill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },

  listBody: { paddingHorizontal: 14, paddingBottom: 40 },
  placeholderCard: { height: 200, borderRadius: 24, borderStyle: 'dashed', borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  placeholderText: { fontFamily: 'Inter_500Medium', fontSize: 14, marginTop: 12 },
});
