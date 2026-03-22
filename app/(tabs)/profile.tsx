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
import { useThemeStore } from '../../store/themeStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { transactions, balance } = useTransactions();
  const { budgets } = useBudgets();
  const { isDark, mode, setMode, toggleTheme, colors } = useThemeStore();
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  const getThemeDisplay = () => {
    switch (mode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'light-dark-nav': return 'Light (Dark Nav)';
      case 'dark-light-nav': return 'Dark (Light Nav)';
      default: return 'Theme';
    }
  };

  type SettingItem = { id: string; title: string; icon: string; isToggle?: boolean; isThemeRow?: boolean; };

  const settings: SettingItem[] = [
    { id: '1', title: 'Personal Info', icon: 'person-outline' },
    { id: '2', title: 'Security', icon: 'shield-checkmark-outline' },
    { id: 'dark_mode', title: `Theme: ${getThemeDisplay()}`, icon: isDark ? 'moon' : 'moon-outline', isThemeRow: true },
    { id: '3', title: 'Payment Methods', icon: 'card-outline' },
    { id: '4', title: 'Data & Privacy', icon: 'finger-print-outline' },
    { id: '5', title: 'Help & Support', icon: 'help-circle-outline' },
  ];

  return (
    <View style={[s.root, { backgroundColor: colors.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* 1. Header (Fixed) */}
      <View style={[s.pinnedHeader, { backgroundColor: colors.surface }]} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <MainHeader 
              actions={[{ icon: 'notifications-outline' }]} 
            />
            <View style={s.titleRow}>
               <Text style={[typography.headingLarge, { fontSize: 28, color: colors.text }]}>Profile</Text>
               <TouchableOpacity 
                 style={[s.addBtnHeader, { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7', borderColor: isDark ? '#2C2C2E' : '#E8E8ED' }]} 
                 activeOpacity={0.7}
               >
                 <Ionicons name="settings-outline" size={20} color={colors.text} />
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
        {/* Profile Card */}
        <View style={s.profileTopSection}>
          <View style={s.avatarRow}>
             <View style={[s.avatarOuter, { backgroundColor: colors.surface, borderColor: isDark ? '#1C1C1E' : '#f8f8f8' }]}>
                <View style={[s.avatarBox, { backgroundColor: colors.accent + '12' }]}>
                   <Text style={[s.avatarInitials, { color: colors.accent }]}>AD</Text>
                </View>
             </View>
             <View style={s.nameLines}>
                <Text style={[s.profileName, { color: colors.text }]}>Aman Dev</Text>
                <View style={s.pillWrapper}>
                   <View style={[s.personalPill, { backgroundColor: colors.accent + '15' }]}>
                      <Text style={[s.personalPillText, { color: colors.accent }]}>Premium Plan</Text>
                   </View>
                </View>
             </View>
          </View>
        </View>

        {/* Settings Menu List */}
        <View style={s.menuListContainer}>
          {settings.map((item, i) => (
             <View key={item.id}>
                <TouchableOpacity 
                   activeOpacity={0.7} 
                   style={s.menuRow}
                   onPress={item.isToggle ? toggleTheme : undefined}
                >
                   <View style={s.menuIconWrapper}>
                      <View style={[s.menuIconBox, { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7', borderColor: isDark ? '#2C2C2E' : '#E8E8ED' }]}>
                         <Ionicons name={item.icon as any} size={16} color={colors.text} />
                      </View>
                   </View>
                   <View style={s.menuTextSide}>
                      <Text style={[s.menuTitleText, { color: colors.text }]}>{item.title}</Text>
                   </View>
                   {item.isThemeRow ? (
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                         {([
                           { m: 'light', icon: 'sunny' },
                           { m: 'light-dark-nav', icon: 'partly-sunny' },
                           { m: 'dark', icon: 'moon' },
                           { m: 'dark-light-nav', icon: 'moon-outline' },
                         ] as const).map(t => (
                           <TouchableOpacity
                             key={t.m}
                             activeOpacity={0.7}
                             onPress={() => setMode(t.m)}
                             style={[
                               s.themeIconBtn,
                               { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7', borderColor: isDark ? '#2C2C2E' : '#E8E8ED' },
                               mode === t.m && { backgroundColor: colors.accent + '20', borderColor: colors.accent }
                             ]}
                           >
                             <Ionicons name={t.icon as any} size={15} color={mode === t.m ? colors.accent : colors.textTertiary} />
                           </TouchableOpacity>
                         ))}
                      </View>
                   ) : item.isToggle ? (
                      <View style={[s.toggleTrack, { backgroundColor: isDark ? colors.accent : (isDark ? '#3A3A3C' : '#EAEAED') }, isDark && { backgroundColor: '#32D74B' }]}>
                         <View style={[s.toggleKnob, isDark && s.toggleKnobActive]} />
                      </View>
                   ) : (
                      <Ionicons name="chevron-forward" size={12} color={colors.textTertiary} />
                   )}
                </TouchableOpacity>
                {i < settings.length - 1 && <View style={[s.menuSeparator, { backgroundColor: colors.separator }]} />}
             </View>
          ))}
        </View>

        {/* Footer Info */}
        <View style={s.footerSection}>
           <TouchableOpacity activeOpacity={0.7} style={s.logoutBtn}>
              <Text style={[s.logoutText, { color: colors.red }]}>Sign Out</Text>
              <Ionicons name="log-out-outline" size={16} color={colors.red} />
           </TouchableOpacity>
           <Text style={[s.appInfo, { color: colors.textTertiary }]}>MANs Tracker v1.2.4 · Built with love</Text>
        </View>
        
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 20 },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 5, paddingTop: Platform.OS === 'web' ? 10 : 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtnHeader: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  profileTopSection: { paddingHorizontal: 16, marginTop: 5 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarOuter: { width: 60, height: 60, borderRadius: 22, borderWidth: 1, padding: 1, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarBox: { width: 54, height: 54, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: -1 },
  nameLines: { flex: 1 },
  profileName: { fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -1 },
  pillWrapper: { flexDirection: 'row', marginTop: 2 },
  personalPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  personalPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  menuListContainer: { paddingHorizontal: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  menuIconWrapper: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, padding: 1, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  menuIconBox: { width: 34, height: 34, borderRadius: 10, borderWidth: 1.3, justifyContent: 'center', alignItems: 'center' },
  menuTextSide: { flex: 1 },
  menuTitleText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, letterSpacing: -0.3 },
  menuSeparator: { height: StyleSheet.hairlineWidth, marginLeft: 40 + 12 },

  footerSection: { marginTop: 30, alignItems: 'center', paddingHorizontal: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 10 },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  appInfo: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 10 },

  toggleTrack: { width: 34, height: 18, borderRadius: 10, paddingHorizontal: 2, justifyContent: 'center' },
  toggleKnob: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFFFFF' },
  toggleKnobActive: { alignSelf: 'flex-end' },

  themeIconBtn: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
});
