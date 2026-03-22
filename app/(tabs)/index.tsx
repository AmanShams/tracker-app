import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { BeltButton } from '../../components/belt-button';
import { Budget, useBudgets } from '../../store/budgetStore';
import { Transaction as TxType, useTransactions } from '../../store/transactionStore';

const SCREEN_H = Dimensions.get('window').height;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  dark: '#111111',
  darkCard: '#1C1C1E',
  primary: '#111111',
  secondary: '#8E8E93',
  tertiary: '#C7C7CC',
  accent: '#7C6EEA',
  green: '#16A34A',
  separator: '#F0F0F3',
};

const SPACE = { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32 };
const FILTERS = ['All', 'Expense', 'Income'];

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <View style={s.header}>
      <View style={s.logoRow}>
        <Text style={s.logoText}>MANs Tracker</Text>
      </View>
      <View style={s.headerIconGroup}>
        <TouchableOpacity activeOpacity={0.7} style={s.squareBtn}>
          <Ionicons name="stats-chart-outline" size={16} color={C.primary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={s.squareBtn}>
          <Ionicons name="card-outline" size={16} color={C.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Balance Card ─────────────────────────────────────────────────────────────
function BalanceCard() {
  const { balance } = useTransactions();
  const balanceStr = balance.toFixed(2);
  const [intPartRaw, decPart] = balanceStr.split('.');
  const intPart = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <View style={s.balanceBlock}>
      <View style={s.balanceLabelRow}>
        <Text style={s.balanceLabelText}>Balance</Text>
        <TouchableOpacity activeOpacity={0.8} style={s.personalPill}>
          <Text style={s.personalPillText}>Personal Account</Text>
          <Ionicons name="chevron-forward" size={10} color="rgba(255,255,255,0.85)" style={{ marginLeft: 1 }} />
        </TouchableOpacity>
      </View>

      <View style={s.balanceAmountRow}>
        <Text style={[s.balanceInteger, balance < 0 && { color: '#FF3B30' }]}>{intPart}</Text>
        <Text style={[s.balanceDecimal, balance < 0 && { color: '#FF3B30' }]}>.{decPart}</Text>
      </View>
    </View>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards() {
  const { budgets } = useBudgets();
  const router = useRouter();

  return (
    <View style={s.statCardsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.statScroll}
        decelerationRate="fast"
      >
        {budgets.length === 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[s.statCard, { borderStyle: 'dashed', borderColor: '#D1D1D6' }]}
            onPress={() => router.push('/set-budget')}
          >
            <View style={[s.statCardInner, { justifyContent: 'center', alignItems: 'center' }]}>
              <View style={[s.statIconBox, { backgroundColor: '#F2F2F7', width: 32, height: 32, borderRadius: 10 }]}>
                <Ionicons name="add" size={20} color="#8E8E93" />
              </View>
              <Text style={[s.statCardTitle, { color: '#8E8E93', marginTop: 8 }]}>Set Budget</Text>
            </View>
          </TouchableOpacity>
        ) : (
          budgets.map((budget: Budget) => {
            const remaining = Math.max(0, budget.amount - budget.spent);
            const progress = Math.min((remaining / budget.amount) * 100, 100);
            return (
              <TouchableOpacity
                key={budget.id}
                style={s.statCard}
                activeOpacity={0.8}
                onPress={() => router.push({
                  pathname: '/add-transaction',
                  params: { budgetId: budget.id }
                })}
              >
                <View style={s.statCardInner}>
                  <View style={s.statCardTop}>
                    <View style={[s.statIconBox, { backgroundColor: budget.color + '12' }]}>
                      <Ionicons name={budget.icon as any} size={14} color={budget.color} />
                    </View>
                    <Ionicons name="chevron-forward" size={10} color={C.tertiary} />
                  </View>

                  <View style={s.statContent}>
                    <Text style={s.statCardTitle} numberOfLines={1}>{budget.name}</Text>
                    <Text style={s.statCardSubtitle} numberOfLines={1}>{budget.linkedCategoryName}</Text>
                  </View>

                  <View style={s.statProgressSection}>
                    <View style={s.progressTrack}>
                      <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: budget.color }]} />
                    </View>

                    <View style={s.statAmountRow}>
                      <Text style={s.statRemainingText}>Rs {remaining.toLocaleString()}</Text>
                      <Text style={s.statPercentText}>{Math.round(progress)}%</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ─── Action Belt ─────────────────────────────────────────────────────────────
function ActionBelt() {
  const router = useRouter();
  const actions = [
    { label: 'Spent', icon: <Ionicons name="add-outline" size={18} color="#FFF" />, route: '/add-transaction', type: 'expense' },
    { label: 'Receive', icon: <Ionicons name="arrow-down-outline" size={15} color="#FFF" />, route: '/add-transaction', type: 'income' },
    { label: 'Add', icon: <Ionicons name="add-outline" size={18} color="#FFF" />, route: '/set-budget' },
  ];

  return (
    <View style={s.beltOuter}>
      <View style={s.beltRow}>
        {actions.map((a) => (
          <BeltButton
            key={a.label}
            label={a.label}
            icon={a.icon}
            onPress={() => {
              if (a.route) {
                router.push({ pathname: a.route as any, params: a.type ? { type: a.type } : {} });
              }
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const isFocused = useIsFocused();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [pinnedHeaderH, setPinnedHeaderH] = useState(180);

  const scrollY = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      listAnim.setValue(0);
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]);

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter === 'All') return true;
    return tx.type.toLowerCase() === activeFilter.toLowerCase();
  });

  const listTranslateY = listAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_H * 0.8, 0]
  });

  const statParallaxY = scrollY.interpolate({
    inputRange: [-100, 0, 1000],
    outputRange: [0, 0, 1000],
    extrapolate: 'clamp'
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      <View style={s.pinnedHeader} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <Header />
            <BalanceCard />
          </View>
        </SafeAreaView>
      </View>

      <Animated.ScrollView
        style={[s.scroll, { marginTop: pinnedHeaderH }]}
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={s.scrollContent}
        scrollEventThrottle={1}
        stickyHeaderIndices={[1]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <Animated.View
          style={{
            zIndex: 1,
            transform: [{ translateY: statParallaxY }],
            paddingHorizontal: 10,
            paddingTop: 0,
            paddingBottom: 3,
          }}
        >
          <StatCards />
        </Animated.View>

        <View style={s.stickyBumper}>
          <View style={s.shadowWrapper}>
            <View style={s.overlapSheet}>
              <ActionBelt />
            </View>
          </View>

          <View style={{ backgroundColor: C.dark }}>
            <View style={s.txSectionHeaderSticky}>
              <View style={s.txHeaderMain}>
                <Text style={[typography.headingLarge, { fontSize: 24 }]}>Transactions</Text>
                <TouchableOpacity activeOpacity={0.7}><Text style={typography.link}>View all ›</Text></TouchableOpacity>
              </View>
              <TransactionTabs active={activeFilter} onSelect={setActiveFilter} />
            </View>
          </View>
        </View>

        <Animated.View style={[s.txListBody, { transform: [{ translateY: listTranslateY }] }]}>
          <View style={s.txList}>
            {filteredTransactions.map((item, i) => (
              <TransactionItem
                key={item.id}
                item={item}
                last={i === filteredTransactions.length - 1}
                budgetName={item.budgetId ? budgets.find(b => b.id === item.budgetId)?.name : undefined}
              />
            ))}
            {filteredTransactions.length === 0 && (
              <View style={{ paddingTop: 40, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', color: '#999', fontSize: 14 }}>No transactions yet</Text>
              </View>
            )}
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ─── Shared Components ─────────────────────────────────────────────────────────
function TransactionTabs({ active, onSelect }: { active: string; onSelect: (f: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
      {FILTERS.map((f) => {
        const isActive = f === active;
        return (
          <TouchableOpacity key={f} onPress={() => onSelect(f)} activeOpacity={0.7} style={[s.filterPill, isActive && s.filterPillActive]}>
            <Text style={isActive ? typography.filterActive : typography.filterInactive}>{f}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function TransactionItem({ item, last, budgetName }: { item: TxType; last: boolean; budgetName?: string }) {
  const isIncome = item.type === 'income';
  return (
    <>
      <View style={s.txRow}>
        <View style={s.txIconOuter}>
          <View style={[s.txIconBox, { backgroundColor: item.categoryColor + '12', borderColor: item.categoryColor + '20' }]}>
            <Ionicons name={item.categoryIcon as any} size={15} color={item.categoryColor} />
          </View>
        </View>
        <View style={s.txText}>
          <Text style={typography.txTitle} numberOfLines={1}>{item.name}</Text>
          <View style={s.subRow}>
            <Text style={typography.txSubtitle} numberOfLines={1}>{item.categoryName} · {item.date}</Text>
            {budgetName && (
              <View style={s.budgetBadge}>
                <Ionicons name="wallet-outline" size={10} color={C.secondary} />
                <Text style={s.budgetText}>{budgetName}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={s.txAmountCol}>
          <Text style={isIncome ? typography.amountPositive : typography.amountNegative}>
            {isIncome ? '+' : '−'}Rs {item.amount.toLocaleString()}
          </Text>
        </View>
      </View>
      {!last && <View style={s.txSeparator} />}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 0 },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: C.surface, zIndex: 100 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 0, paddingTop: Platform.OS === 'web' ? 10 : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 6 : 6,
    marginBottom: 6,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoText: { fontFamily: 'Inter_700Bold', fontSize: 18, fontWeight: '700', letterSpacing: -1, fontStyle: "italic", color: '#111111' },
  headerIconGroup: { flexDirection: 'row', gap: 8 },
  squareBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E8E8ED' },
  balanceBlock: { marginBottom: 0 },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -5 },
  balanceLabelText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#8E8E93', letterSpacing: -1.2 },
  personalPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7C6EEA', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, gap: 2 },
  personalPillText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF', letterSpacing: 0 },
  balanceAmountRow: { flexDirection: 'row', alignItems: 'baseline' },
  balanceInteger: { fontFamily: 'Inter_700Bold', fontSize: 44, fontWeight: '700', letterSpacing: -2, color: '#3a3a3aff', lineHeight: 52 },
  balanceDecimal: { fontFamily: 'Inter_400Regular', fontSize: 22, color: '#9A9A9E', letterSpacing: -0.3, lineHeight: 52, marginLeft: 1 },
  statCardsContainer: { marginBottom: 3 },
  statScroll: { gap: 6, paddingHorizontal: 0, paddingBottom: 0 },
  statCard: { width: 130, height: 130, borderRadius: 18, borderWidth: 1, borderColor: '#f2f2f2', padding: 1, backgroundColor: '#FFFFFF' },
  statCardInner: { flex: 1, borderRadius: 18, borderWidth: 1.5, borderColor: '#eaeaeb', backgroundColor: '#FFFFFF', padding: 10, justifyContent: 'space-between' },
  statCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIconBox: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  statContent: { marginTop: 0 },
  statCardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#111111', letterSpacing: -0.3 },
  statCardSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#8E8E93', marginTop: 0 },
  statProgressSection: { marginTop: 2 },
  progressTrack: { width: '100%', height: 4, backgroundColor: '#F2F2F7', borderRadius: 2, overflow: 'hidden', marginBottom: 5 },
  progressFill: { height: '100%', borderRadius: 2 },
  statAmountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statRemainingText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#111', letterSpacing: -0.8 },
  statPercentText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#111' },

  stickyBumper: { backgroundColor: 'transparent', overflow: 'visible', zIndex: 10 },
  shadowWrapper: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -12 }, shadowOpacity: 0.3, shadowRadius: 15 },
      android: { elevation: 30, shadowColor: '#000' },
      web: { filter: 'drop-shadow(0px -15px 15px rgba(0,0,0,0.3))' }
    }),
    borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: 'transparent', overflow: 'visible',
  },
  overlapSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: C.dark, overflow: 'hidden' },
  beltOuter: { paddingVertical: 5 },
  beltRow: { flexDirection: 'row', alignItems: 'center', gap: 0, justifyContent: 'center' },

  txSectionHeaderSticky: { backgroundColor: C.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 14, paddingTop: 16 },
  txHeaderMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  txListBody: { backgroundColor: C.surface, paddingHorizontal: 14, paddingBottom: 40, zIndex: 5 },
  filterRow: { gap: 8, marginBottom: 10, alignItems: 'center' },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F4F4F6', borderWidth: StyleSheet.hairlineWidth, borderColor: '#E5E5EA' },
  filterPillActive: { backgroundColor: '#F3EFFE', borderColor: '#D8CCFA' },
  txList: {},
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  txIconOuter: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#f8f8f8', padding: 1, marginRight: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  txIconBox: { width: 34, height: 34, borderRadius: 10, borderWidth: 1.3, borderColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  txText: { flex: 1, marginRight: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  budgetBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F2F2F7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  budgetText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#8E8E93' },
  txAmountCol: { alignItems: 'flex-end' },
  txSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 40 + 10 },
});
