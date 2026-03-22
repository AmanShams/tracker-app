import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import { MainHeader } from '../../components/main-header';
import { useBudgets } from '../../store/budgetStore';
import { useTransactions } from '../../store/transactionStore';

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


// ─── Profile Screen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { transactions, balance } = useTransactions();
  const { budgets } = useBudgets();
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);

  const stats = useMemo(() => {
    const totalSpent = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { totalSpent };
  }, [transactions]);

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  const balanceParts = useMemo(() => {
    const balanceStr = balance.toFixed(2);
    const [intPartRaw, decPart] = balanceStr.split('.');
    const intPart = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return { intPart, decPart };
  }, [balance]);

  const settings = [
    { id: '1', title: 'Personal Info', icon: 'person-outline' },
    { id: '2', title: 'Security', icon: 'shield-checkmark-outline' },
    { id: '3', title: 'Payment Methods', icon: 'card-outline' },
    { id: '4', title: 'Data & Privacy', icon: 'finger-print-outline' },
    { id: '5', title: 'Help & Support', icon: 'help-circle-outline' },
  ];

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* 1. Header (Fixed) */}
      <View style={s.pinnedHeader} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <MainHeader actions={[{ icon: 'notifications-outline' }]} />
            <View style={s.titleRow}>
              <Text style={[typography.headingLarge, { fontSize: 28 }]}>Profile</Text>
              <TouchableOpacity
                style={s.addBtnHeader}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={20} color={C.primary} />
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
      >
        {/* Profile Card & Balance */}
        <View style={s.profileTopSection}>
          <View style={s.avatarRow}>
            <View style={s.avatarOuter}>
              <View style={[s.avatarBox, { backgroundColor: C.accent + '12' }]}>
                <Text style={s.avatarInitials}>AD</Text>
              </View>
            </View>
            <View style={s.nameLines}>
              <Text style={s.profileName}>Aman Dev</Text>
              <View style={s.pillWrapper}>
                <View style={s.personalPill}>
                  <Text style={s.personalPillText}>Premium Plan</Text>
                </View>
              </View>
            </View>
          </View>
        </View>


        {/* Settings Menu List (Categories list style) */}
        <View style={s.menuListContainer}>
          {settings.map((item, i) => (
            <View key={item.id}>
              <TouchableOpacity activeOpacity={0.7} style={s.menuRow}>
                <View style={s.menuIconWrapper}>
                  <View style={[s.menuIconBox, { backgroundColor: '#F5F5F7', borderColor: '#E8E8ED' }]}>
                    <Ionicons name={item.icon as any} size={16} color={C.primary} />
                  </View>
                </View>
                <View style={s.menuTextSide}>
                  <Text style={s.menuTitleText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={12} color={C.tertiary} />
              </TouchableOpacity>
              {i < settings.length - 1 && <View style={s.menuSeparator} />}
            </View>
          ))}
        </View>

        {/* Footer Info */}
        <View style={s.footerSection}>
          <TouchableOpacity activeOpacity={0.7} style={s.logoutBtn}>
            <Text style={s.logoutText}>Sign Out</Text>
            <Ionicons name="log-out-outline" size={16} color="#FF3B30" />
          </TouchableOpacity>
          <Text style={s.appInfo}>MANs Tracker v1.2.4 · Built with love</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 20 },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: C.surface, zIndex: 100 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 5, paddingTop: Platform.OS === 'web' ? 10 : 0 },
  headerIconGroup: { flexDirection: 'row', gap: 8 },
  squareBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8ED' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtnHeader: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8ED' },

  profileTopSection: { paddingHorizontal: 16, marginTop: 5 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarOuter: { width: 60, height: 60, borderRadius: 22, borderWidth: 1, borderColor: '#f8f8f8', padding: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarBox: { width: 54, height: 54, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontFamily: 'Inter_700Bold', fontSize: 18, color: C.accent, letterSpacing: -1 },
  nameLines: { flex: 1 },
  profileName: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#111111', letterSpacing: -1 },
  pillWrapper: { flexDirection: 'row', marginTop: 2 },
  personalPill: { backgroundColor: C.accent + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  personalPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: C.accent },

  menuListContainer: { paddingHorizontal: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  menuIconWrapper: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#f8f8f8', padding: 1, marginRight: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  menuIconBox: { width: 34, height: 34, borderRadius: 10, borderWidth: 1.3, borderColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  menuTextSide: { flex: 1 },
  menuTitleText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#111111', letterSpacing: -0.3 },
  menuSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 40 + 12 },

  footerSection: { marginTop: 30, alignItems: 'center', paddingHorizontal: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 10 },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FF3B30' },
  appInfo: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#C7C7CC', marginTop: 10 },
});
