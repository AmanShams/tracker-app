import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useCallback, useMemo } from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutChangeEvent,
} from 'react-native';

import { typography } from '@/constants/typography';
import { useSavings } from '../../store/savingsStore';

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

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ item, onAdd }: { item: any, onAdd: (id: string) => void }) {
  const progress = Math.min(1, item.currentAmount / item.targetAmount);
  return (
    <View style={s.goalCard}>
      <View style={s.goalHeader}>
        <View style={[s.iconBox, { backgroundColor: item.color + '15' }]}>
          <Ionicons name={item.icon} size={18} color={item.color} />
        </View>
        <View style={s.goalInfo}>
          <Text style={typography.txTitle}>{item.name}</Text>
          <Text style={typography.txSubtitle}>Target: Rs {item.targetAmount.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={s.miniAddBtn} onPress={() => onAdd(item.id)}>
           <Ionicons name="add" size={16} color={C.primary} />
        </TouchableOpacity>
      </View>

      <View style={s.progressRow}>
        <View style={s.progressContainer}>
           <View style={[s.progressBar, { width: `${progress * 100}%`, backgroundColor: item.color }]} />
        </View>
      </View>

      <View style={s.amountRow}>
        <Text style={s.amountText}>Saved: Rs {item.currentAmount.toLocaleString()}</Text>
        <Text style={s.percentText}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
}

export default function SavingsScreen() {
  const router = useRouter();
  const { goals, updateAmount } = useSavings();
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);

  const totalSaved = useMemo(() => goals.reduce((acc, g) => acc + g.currentAmount, 0), [goals]);

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* 1. Header (Fixed) */}
      <View style={s.pinnedHeader} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <Header />
            <View style={s.titleRow}>
               <Text style={[typography.headingLarge, { fontSize: 28 }]}>Savings</Text>
               <TouchableOpacity 
                 style={s.addBtnHeader} 
                 activeOpacity={0.7}
                 onPress={() => {}} // Could link to create-goal
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
      >
        {/* Total Summary Row (Clean White Style) */}
        <View style={s.summarySection}>
           <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>Total Saved</Text>
              <Text style={[typography.display, { fontSize: 34, marginTop: 5 }]}>Rs {totalSaved.toLocaleString()}</Text>
           </View>
        </View>

        <View style={s.listBody}>
          <Text style={s.sectionTitle}>Your Goals</Text>
          {goals.map((item) => (
            <GoalCard 
              key={item.id} 
              item={item} 
              onAdd={(id) => updateAmount(id, 100)} 
            />
          ))}
          {goals.length === 0 && (
            <View style={s.emptyState}>
              <Ionicons name="leaf" size={40} color={C.tertiary} />
              <Text style={s.emptyText}>Start a saving pot today</Text>
            </View>
          )}
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
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 15, paddingTop: Platform.OS === 'web' ? 10 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 10, marginBottom: 5 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoText: { fontFamily: 'Inter_700Bold', fontSize: 18, fontWeight: '700', letterSpacing: -1, fontStyle: "italic", color: '#111111' },
  headerIconGroup: { flexDirection: 'row', gap: 8 },
  squareBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8ED' },
  
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtnHeader: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8ED' },

  summarySection: { paddingHorizontal: 16, marginBottom: 20 },
  summaryCard: { backgroundColor: '#F9F9FB', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#F0F0F3' },
  summaryLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  listBody: { paddingHorizontal: 16 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: C.primary, marginBottom: 15, marginLeft: 4 },
  
  goalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#F0F0F3', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconBox: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  goalInfo: { flex: 1 },
  miniAddBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center' },
  
  progressRow: { height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, marginBottom: 10, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  progressContainer: { flex: 1 },
  
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: C.primary },
  percentText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: C.primary },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: C.tertiary, marginTop: 10 },
});
