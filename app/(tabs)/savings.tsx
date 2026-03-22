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
import { useBudgets } from '../../store/budgetStore';
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
function StatValueRow({ label, amount, color }: { label: string; amount: number; color?: string }) {
  const amountStr = amount.toFixed(2);
  const [intPartRaw, decPart] = amountStr.split('.');
  const intPart = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <View style={s.statBoxCompact}>
      <Text style={s.statLabelSmall}>{label}</Text>
      <View style={s.statValueLine}>
        <Text style={[s.statInt, color ? { color } : {}]}>{intPart}</Text>
        <Text style={[s.statDec, color ? { color } : {}]}>.{decPart}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SavingsScreen() {
  const router = useRouter();
  const { budgets, deleteBudget } = useBudgets();
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);

  // Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const stats = useMemo(() => {
    const totalAllocated = budgets.reduce((acc, b) => acc + b.amount, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;
    return { totalAllocated, totalSpent, totalRemaining };
  }, [budgets]);

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

      {/* 1. Header (Fixed) */}
      <View style={s.pinnedHeader} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <Header />
            <View style={s.titleRow}>
              <Text style={[typography.headingLarge, { fontSize: 28 }]}>Budgets</Text>
              <TouchableOpacity
                style={s.addBtnHeader}
                activeOpacity={0.7}
                onPress={() => router.push('/set-budget')}
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
        {/* Simple Summary (Home Balance Style) */}
        <View style={s.summaryContainerSmall}>
          <StatValueRow label="Total Remaining" amount={stats.totalRemaining} />
          <View style={s.vDivider} />
          <StatValueRow label="Total Spent" amount={stats.totalSpent} color="#FF3B30" />
        </View>

        {/* Budgets List (Categories List Style) */}
        <View style={s.listBodyCompact}>
          {budgets.map((item, i) => {
            const remaining = Math.max(0, item.amount - item.spent);
            const progress = Math.min((remaining / item.amount) * 100, 100);

            return (
              <View key={item.id}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={s.listRow}
                  onPress={() => router.push({
                    pathname: '/add-transaction',
                    params: { budgetId: item.id }
                  })}
                >
                  {/* Vertical Progress Bar on the Left */}
                  <View style={s.vProgressContainer}>
                    <View style={s.vProgressTrack}>
                      <View style={[s.vProgressFill, { height: `${progress}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>

                  <View style={s.iconWrapperCompact}>
                    <View style={[s.iconBoxCompact, { backgroundColor: item.color + '12', borderColor: item.color + '20' }]}>
                      <Ionicons name={item.icon as any} size={15} color={item.color} />
                    </View>
                  </View>

                  <View style={s.textColContainer}>
                    <Text style={[typography.txTitle, { fontSize: 15 }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[typography.txSubtitle, { fontSize: 11, marginTop: 1 }]} numberOfLines={1}>
                      {item.linkedCategoryName} · Rs {remaining.toLocaleString()} left
                    </Text>
                  </View>

                  <View style={s.actionRowCompact}>
                    <TouchableOpacity activeOpacity={0.7} style={s.actionBtnCompact}>
                      <Ionicons name="pencil-outline" size={16} color={C.tertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={s.actionBtnCompact} onPress={() => handleDeleteTrigger(item.id, item.name)}>
                      <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                {i < budgets.length - 1 && <View style={s.separatorAligned} />}
              </View>
            );
          })}

          {budgets.length === 0 && (
            <View style={s.emptyCenter}>
              <Ionicons name="wallet-outline" size={36} color={C.tertiary} />
              <Text style={s.emptyTextSmall}>No active budgets</Text>
            </View>
          )}
        </View>

        <ConfirmModal
          visible={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => deleteId && deleteBudget(deleteId)}
          title="Delete Budget"
          message={`Remove "${deleteName}"? Linked transactions will be unlinked.`}
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

  // Summary Row (Identical to Home Balance style)
  summaryContainerSmall: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, marginTop: 5 },
  vDivider: { width: 1, height: 50, backgroundColor: '#F0F0F3', marginHorizontal: 20 },
  statBoxCompact: { flex: 1 },
  statLabelSmall: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#8E8E93', letterSpacing: -0.8, marginBottom: -5 },
  statValueLine: { flexDirection: 'row', alignItems: 'baseline' },
  statInt: { fontFamily: 'Inter_700Bold', fontSize: 44, fontWeight: '700', color: '#3A3A3A', letterSpacing: -2, lineHeight: 52 },
  statDec: { fontFamily: 'Inter_400Regular', fontSize: 22, color: '#9A9A9E', letterSpacing: -0.3, lineHeight: 52, marginLeft: 1 },

  // List (Categories Style)
  listBodyCompact: { paddingHorizontal: 16 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  vProgressContainer: { width: 3, height: 36, marginRight: 12 },
  vProgressTrack: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 1.5, overflow: 'hidden', justifyContent: 'flex-end' },
  vProgressFill: { width: '100%', borderRadius: 1.5 },

  iconWrapperCompact: { width: 44, height: 44, borderRadius: 13, borderWidth: 1, borderColor: '#f8f8f8', padding: 1, marginRight: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  iconBoxCompact: { width: 38, height: 38, borderRadius: 11, borderWidth: 1.3, borderColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  textColContainer: { flex: 1, marginRight: 10 },
  actionRowCompact: { flexDirection: 'row', gap: 4 },
  actionBtnCompact: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  separatorAligned: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 3 + 12 + 44 + 12 }, // Aligned to vBar + margins + icon

  emptyCenter: { alignItems: 'center', paddingTop: 60 },
  emptyTextSmall: { fontFamily: 'Inter_400Regular', fontSize: 13, color: C.tertiary, marginTop: 8 },
});
