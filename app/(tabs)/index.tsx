import { typography } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const SCREEN_H = Dimensions.get('window').height;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  dark: '#1C1C1E',
  darkCard: '#2A2A2D',
  darkBorder: '#3A3A3C',
  primary: '#111111',
  secondary: '#8E8E93',
  tertiary: '#C7C7CC',
  // Muted soft violet — matches reference, not neon
  accent: '#7C6EEA',
  green: '#16A34A',
  separator: '#F0F0F3',
};

const SPACE = { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32 };

const RADIUS = { sm: 14, md: 22, lg: 28, full: 999 };

const FILTERS = ['All', 'Expense', 'Income'];

import { Transaction as TxType, useTransactions } from '../../store/transactionStore';

// ─── Micro Interactions ──────────────────────────────────────────────────────
// ─── Micro Interactions ──────────────────────────────────────────────────────
import { BeltButton } from '../../components/belt-button';

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <View style={s.header}>
      {/* Logo — star + bold wordmark */}
      <View style={s.logoRow}>
        {/* <Ionicons name="apps-sharp" size={18} color={C.primary} /> */}
        <Text style={s.logoText}>MANs Tracker</Text>
      </View>
      {/* Icon buttons — rounded-rect like the reference */}
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
  // Use space as thousands separator to match the reference aesthetic
  const intPart = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <View style={s.balanceBlock}>
      {/* Row: label + Personal pill */}
      <View style={s.balanceLabelRow}>
        <Text style={s.balanceLabelText}>Balance</Text>
        <TouchableOpacity activeOpacity={0.8} style={s.personalPill}>
          <Text style={s.personalPillText}>Personal</Text>
          <Ionicons name="chevron-forward" size={10} color="rgba(255,255,255,0.85)" style={{ marginLeft: 1 }} />
        </TouchableOpacity>
      </View>

      {/* Amount row — $ + integer + decimal all on same baseline */}
      <View style={s.balanceAmountRow}>
        {/* <Text style={s.balanceDollarSign}>$</Text> */}
        <Text style={[s.balanceInteger, balance < 0 && { color: '#FF3B30' }]}>{intPart}</Text>
        <Text style={[s.balanceDecimal, balance < 0 && { color: '#FF3B30' }]}>.{decPart}</Text>
      </View>
    </View>
  );
}

import { Budget, useBudgets } from '../../store/budgetStore';

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards() {
  const { budgets } = useBudgets();
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.statScroll}
    >
      {budgets.length === 0 ? (
        <TouchableOpacity
          activeOpacity={0.7}
          style={s.statCard}
          onPress={() => router.push('/set-budget')}
        >
          <View style={[s.statCardInner, { justifyContent: 'center', alignItems: 'center', minHeight: 92 }]}>
            <View style={[s.statIconBox, { backgroundColor: '#F2F2F7', width: 36, height: 36, borderRadius: 12 }]}>
              <Ionicons name="add" size={24} color="#000" />
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        budgets.map((budget: Budget) => {
          const progress = Math.min((budget.spent / budget.amount) * 100, 100);
          return (
            <View key={budget.id} style={s.statCard}>
              <View style={s.statCardInner}>
                <View style={s.statCardTop}>
                  <View style={[s.statIconBox, { backgroundColor: budget.bgColor }]}>
                    <Ionicons name={budget.icon as any} size={14} color={budget.color} />
                  </View>
                  <View style={s.arrowBtnPlaceholder} />
                </View>
                <Text style={s.statCardTitle} numberOfLines={1}>{budget.name}</Text>
                <Text style={s.statCardSubtitle}>Rs {budget.amount.toLocaleString()}</Text>

                <View style={s.progressBarRow}>
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: budget.color }]} />
                  </View>
                  <Text style={s.progressText}>{Math.round(progress)}%</Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// ─── Action Belt ─────────────────────────────────────────────────────────────
function ActionBelt() {
  const router = useRouter();

  const actions: { label: string; icon: React.ReactNode; route?: string; type?: string }[] = [
    { label: 'Spent', icon: <Ionicons name="add-outline" size={18} color="#FFF" />, route: '/add-transaction', type: 'expense' },
    { label: 'Receive', icon: <Ionicons name="arrow-down-outline" size={15} color="#FFF" />, route: '/add-transaction', type: 'income' },
    { label: 'Add', icon: <Ionicons name="add-outline" size={18} color="#FFF" />, route: '/set-budget' },
  ];

  return (
    <View style={s.beltOuter}>
      <View style={s.beltRow}>
        {actions.map((a, i) => (
          <BeltButton
            key={a.label}
            label={a.label}
            icon={a.icon}
            onPress={() => {
              if (a.route) {
                if (a.type) {
                  router.push({ pathname: a.route as any, params: { type: a.type } });
                } else {
                  router.push(a.route as any);
                }
              }
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Transaction Tabs ─────────────────────────────────────────────────────────
function TransactionTabs({ active, onSelect }: { active: string; onSelect: (f: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {FILTERS.map((f) => {
        const isActive = f === active;
        return (
          <TouchableOpacity
            key={f}
            onPress={() => onSelect(f)}
            activeOpacity={0.7}
            style={[s.filterPill, isActive && s.filterPillActive]}
          >
            <Text style={isActive ? typography.filterActive : typography.filterInactive}>{f}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Transaction Item ─────────────────────────────────────────────────────────
function TransactionItem({ item, last }: { item: TxType; last: boolean }) {
  const isIncome = item.type === 'income';
  return (
    <>
      <View style={s.txRow}>
        {/* Icon with Double Border */}
        <View style={s.txIconOuter}>
          <View style={[s.txIconBox, { backgroundColor: item.categoryColor + '12', borderColor: item.categoryColor + '20' }]}>
            <Ionicons name={item.categoryIcon as any} size={18} color={item.categoryColor} />
          </View>
        </View>

        {/* Text block */}
        <View style={s.txText}>
          <Text style={typography.txTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={[typography.txSubtitle, { marginTop: SPACE.xs - 2 }]} numberOfLines={1}>
            {item.categoryName} · {item.date}
          </Text>
        </View>

        {/* Amount — right aligned */}
        <Text
          style={isIncome ? typography.amountPositive : typography.amountNegative}
        >
          {isIncome ? '+' : '−'}Rs {item.amount.toLocaleString()}
        </Text>
      </View>
      {!last && <View style={s.txSeparator} />}
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { transactions } = useTransactions();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter === 'All') return true;
    return tx.type.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={s.scrollContent}
      >
        {/* ── TOP WHITE PANEL ── */}
        <View style={s.topPanel}>
          <SafeAreaView>
            <Header />
            <BalanceCard />
            <StatCards />
          </SafeAreaView>
        </View>

        {/* ── DARK BELT ── */}
        <ActionBelt />

        {/* ── TRANSACTIONS PANEL ── */}
        <View style={s.txPanel}>
          {/* Section header */}
          <View style={s.txPanelHeader}>
            <Text style={typography.headingLarge}>Transactions</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={typography.link}>View all ›</Text>
            </TouchableOpacity>
          </View>

          {/* Filter tabs */}
          <TransactionTabs active={activeFilter} onSelect={setActiveFilter} />

          {/* List */}
          <View style={s.txList}>
            {filteredTransactions.map((item, i) => (
              <TransactionItem
                key={item.id}
                item={item}
                last={i === filteredTransactions.length - 1}
              />
            ))}
            {filteredTransactions.length === 0 && (
              <View style={{ paddingTop: 40, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_400Regular', color: '#999', fontSize: 14 }}>No transactions yet</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    // Dark bg gives the correct rounded-corner cutout between the two white panels
    backgroundColor: C.dark,
  },
  scroll: { flex: 1 },
  // paddingBottom 0 — the txPanel itself is tall enough
  scrollContent: { paddingBottom: 0 },

  // ── Top panel ──
  topPanel: {
    backgroundColor: C.surface,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 4 : 4,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 10,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logoText: {
    // Inter 700, tight tracking — matches reference wordmark
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -1,
    fontStyle: "italic",
    color: '#111111',
  },
  headerIconGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  // Rounded-rect buttons matching reference (squircle, not circle)
  squareBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8ED',
  },

  // ── Balance ──
  balanceBlock: {
    marginBottom: 8,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceLabelText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#8E8E93',
    letterSpacing: -1,
  },
  personalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    // Soft muted violet — not neon, matches the reference
    backgroundColor: '#7C6EEA',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 2,
  },
  personalPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0,
  },
  // All three balance parts sit on same baseline row
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  // Small $ raised at top-left
  balanceDollarSign: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: '#9A9A9E',
    lineHeight: 48,
    marginRight: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  // Bold large integer
  balanceInteger: {
    fontFamily: 'Inter_700Bold',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -2,
    color: '#3a3a3aff',
    lineHeight: 52,

  },
  // Muted, smaller decimal — same row
  balanceDecimal: {
    fontFamily: 'Inter_400Regular',
    fontSize: 22,
    color: '#9A9A9E',
    letterSpacing: -0.3,
    lineHeight: 52,
    marginLeft: 1,
  },

  // ── Stat cards ──
  statScroll: {
    gap: 12,
    paddingBottom: 2,
  },
  statCard: {
    width: 146,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f8f8f8',
    padding: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
  },
  statCardInner: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e6e6e6',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBtnPlaceholder: {
    width: 20,
    height: 20,
  },
  statCardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#111111',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  statCardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 10,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E8E8ED',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#111111',
  },

  // ── Belt ──
  beltOuter: {
    backgroundColor: C.dark,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  beltRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  // Belt styles removed in favor of BeltButton component
  beltMoreBtnOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#000000',
    padding: 1.5,
    overflow: 'hidden',
  },
  beltMoreBtnInner: {
    flex: 1,
    borderRadius: 23,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Transactions panel ──
  txPanel: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: -2,
    // minHeight + large paddingBottom ensures white extends well below
    // the last transaction so you can never bounce-scroll to expose dark bg
    minHeight: SCREEN_H * 0.6,
    paddingBottom: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 6,
  },
  txPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  // ── Filters ──
  filterRow: {
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F4F4F6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  filterPillActive: {
    backgroundColor: '#F3EFFE',
    borderColor: '#D8CCFA',
  },

  // ── Transaction list ──
  txList: {
    // no extra padding — panel's own paddingBottom handles it
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  txIconOuter: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f8f8f8',
    padding: 1,
    marginRight: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  txText: {
    flex: 1,
    marginRight: 8,
  },
  txSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.separator,
    // indent separator to start after icon
    marginLeft: 42 + 13,
  },
});
