import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  LayoutChangeEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { typography } from '@/constants/typography';
import { BeltButton } from '../../components/belt-button';
import { MainHeader } from '../../components/main-header';
import { TransactionList } from '../../components/transaction-list';
import { Budget, useBudgets } from '../../store/budgetStore';
import { useThemeStore } from '../../store/themeStore';
import { useTransactions } from '../../store/transactionStore';

const SCREEN_H = Dimensions.get('window').height;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Expense', 'Income'];


// ─── Balance Card ─────────────────────────────────────────────────────────────
function BalanceCard() {
  const { balance } = useTransactions();
  const { colors, isDark } = useThemeStore();

  const balanceStr = balance.toFixed(2);
  const [intPartRaw, decPart] = balanceStr.split('.');
  const intPart = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <View style={[s.balanceBlock, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 4 }]}>
      <View style={{ flex: 1 }}>
        <Text style={[s.balanceLabelText, { color: colors.textSecondary, marginBottom: 2 }]}>Balance</Text>
        <View style={s.balanceAmountRow}>
          <Text style={[s.balanceInteger, { color: colors.text }, balance < 0 && { color: colors.red }]}>{intPart}</Text>
          <Text style={[s.balanceDecimal, { color: colors.textSecondary }, balance < 0 && { color: colors.red }]}>.{decPart}</Text>
        </View>
      </View>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: 72, height: 72, resizeMode: 'contain', opacity: isDark ? 0.85 : 1 }}
      />
    </View>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards() {
  const { budgets } = useBudgets();
  const { isDark, colors } = useThemeStore();
  const router = useRouter();

  return (
    <View >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.statScroll}
        decelerationRate="fast"
      >
        {budgets.length === 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[s.statCard, { borderStyle: 'dashed', borderColor: colors.textTertiary, backgroundColor: colors.surface }]}
            onPress={() => router.push('/set-budget')}
          >
            <View style={[s.statCardInner, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[s.statIconBox, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', width: 32, height: 32, borderRadius: 10 }]}>
                <Ionicons name="add" size={20} color={colors.textSecondary} />
              </View>
              <Text style={[s.statCardTitle, { color: colors.textSecondary, marginTop: 8 }]}>Set Budget</Text>
            </View>
          </TouchableOpacity>
        ) : (
          budgets.map((budget: Budget, index: number) => {
            const remaining = Math.max(0, budget.amount - budget.spent);
            const progress = Math.min((remaining / budget.amount) * 100, 100);

            return (
              <View key={budget.id}>
                <TouchableOpacity
                  style={[s.statCard, { backgroundColor: colors.surface, borderColor: isDark ? '#2C2C2E' : '#f2f2f2' }]}
                  activeOpacity={0.8}
                  onPress={() => router.push({
                    pathname: '/add-transaction',
                    params: { budgetId: budget.id }
                  })}
                >
                  <View style={[s.statCardInner, { backgroundColor: colors.surface, borderColor: isDark ? '#1C1C1E' : '#eaeaeb' }]}>
                    <View style={s.statCardTop}>
                      <View style={[s.statIconBox, { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7', borderColor: isDark ? '#2C2C2E' : '#E8E8ED', borderWidth: 1 }]}>
                        <Ionicons name={budget.icon as any} size={14} color={budget.color} />
                      </View>
                      <Ionicons name="chevron-forward" size={10} color={colors.textTertiary} />
                    </View>

                    <View style={s.statContent}>
                      <Text style={[s.statCardTitle, { color: colors.text }]} numberOfLines={1}>{budget.name}</Text>
                      <Text style={[s.statCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{budget.linkedCategoryName}</Text>
                    </View>

                    <View style={s.statProgressSection}>
                      <View style={[s.progressTrack, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
                        <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: budget.color }]} />
                      </View>

                      <View style={s.statAmountRow}>
                        <Text style={[s.statRemainingText, { color: colors.text }]}>Rs {remaining.toLocaleString()}</Text>
                        <Text style={[s.statPercentText, { color: colors.textSecondary }]}>{Math.round(progress)}%</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
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
  const { colors } = useThemeStore();
  const actions = [
    { label: 'Spent', icon: <Ionicons name="remove-outline" size={18} color={colors.beltText} />, route: '/add-transaction', type: 'expense' },
    { label: 'Receive', icon: <Ionicons name="arrow-down-outline" size={15} color={colors.beltText} />, route: '/add-transaction', type: 'income' },
    { label: 'Add Budget', icon: <Ionicons name="add-outline" size={18} color={colors.beltText} />, route: '/set-budget' },
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
  const router = useRouter();
  const isFocused = useIsFocused();
  const { transactions, balance, addTransaction } = useTransactions();
  const { budgets } = useBudgets();
  const { isDark, colors } = useThemeStore();
  const [pinnedHeaderH, setPinnedHeaderH] = useState(180);
  const [activeFilter, setActiveFilter] = useState('All');

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);



  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={[s.pinnedHeader, { backgroundColor: colors.bg }]} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <MainHeader
              actions={[
                { icon: 'stats-chart-outline' },
                { icon: 'card-outline' }
              ]}
            />
            <BalanceCard />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={[s.scroll, { marginTop: pinnedHeaderH }]}
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={s.scrollContent}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
      >
        <View
          style={{
            zIndex: 1,
            marginHorizontal: 10,
            borderRadius: 20,
            overflow: 'hidden',
            paddingTop: 2,
            paddingBottom: 0,
            marginBottom: 0,
            marginTop: 0,
          }}
        >
          <StatCards />
        </View>

        <View style={[s.stickyBumper, { backgroundColor: colors.bg }]}>
          <View style={s.shadowWrapper}>
            {/* Top Left Inverted Corner */}
            <View style={[s.invertedCorner, { left: 0 }]}>
              <View style={[s.invertedCornerInner, { left: -24, borderColor: colors.beltBg }]} />
            </View>
            {/* Top Right Inverted Corner */}
            <View style={[s.invertedCorner, { right: 0 }]}>
              <View style={[s.invertedCornerInner, { left: -48, borderColor: colors.beltBg }]} />
            </View>

            <View style={[s.overlapSheet, { backgroundColor: colors.beltBg }]}>
              <ActionBelt />
            </View>
          </View>

          <View style={{ backgroundColor: colors.beltBg }}>
            <View style={[s.txSectionHeaderSticky, { backgroundColor: colors.bg }]}>
              <View style={s.txHeaderMain}>
                <Text style={[typography.headingLarge, { fontSize: 24, color: colors.text }]}>Transactions</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
                {FILTERS.map((f) => {
                  const isActive = f === activeFilter;
                  return (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setActiveFilter(f)}
                      activeOpacity={0.7}
                      style={[
                        s.filterPill,
                        { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 },
                        isActive && { backgroundColor: colors.accent + '20', borderColor: colors.accent }
                      ]}
                    >
                      <Text style={[isActive ? typography.filterActive : typography.filterInactive, { color: isActive ? colors.accent : colors.textSecondary }]}>{f}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={[s.txListBody, { backgroundColor: colors.bg }]}>
          <TransactionList transactions={transactions} limit={10} showFilter={false} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, zIndex: 10 },
  scrollContent: { paddingBottom: 40 },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 0, paddingTop: Platform.OS === 'web' ? 10 : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 6 : 6,
    marginBottom: 6,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoText: { fontFamily: 'Inter_400Regular', fontSize: 12, letterSpacing: -0.3, fontStyle: 'italic', marginTop: 2 },
  headerIconGroup: { flexDirection: 'row', gap: 8 },
  squareBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  balanceBlock: { marginBottom: 0, marginTop: 10 },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -5 },
  balanceLabelText: { fontFamily: 'Inter_400Regular', fontSize: 16, letterSpacing: -1.2 },
  personalPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7C6EEA', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, gap: 2 },
  personalPillText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFF', letterSpacing: 0 },
  balanceAmountRow: { flexDirection: 'row', alignItems: 'baseline' },
  balanceInteger: { fontFamily: 'Inter_700Bold', fontSize: 44, fontWeight: '700', letterSpacing: -2, lineHeight: 52 },
  balanceDecimal: { fontFamily: 'Inter_400Regular', fontSize: 22, letterSpacing: -0.3, lineHeight: 52, marginLeft: 1 },
  // statCardsContainer: { marginBottom: 3 },
  statScroll: { gap: 6, paddingHorizontal: 0, paddingBottom: 0 },
  statCard: { width: 130, height: 130, borderRadius: 18, borderWidth: 0.07, padding: 0.7 },
  statCardInner: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 10, justifyContent: 'space-between' },
  statCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIconBox: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  statContent: { marginTop: 0 },
  statCardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, letterSpacing: -0.3 },
  statCardSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 0 },
  statProgressSection: { marginTop: 2 },
  progressTrack: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 5 },
  progressFill: { height: '100%', borderRadius: 2 },
  statAmountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statRemainingText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: -0.8 },
  statPercentText: { fontFamily: 'Inter_700Bold', fontSize: 11 },

  stickyBumper: { backgroundColor: 'transparent', overflow: 'visible', zIndex: 20, paddingTop: 24 },
  shadowWrapper: {
    backgroundColor: 'transparent', overflow: 'visible',
  },
  invertedCorner: {
    position: 'absolute',
    top: -24,
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  invertedCornerInner: {
    position: 'absolute',
    top: -48,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 24,
    backgroundColor: 'transparent',
  },
  overlapSheet: { overflow: 'hidden' },
  beltOuter: { paddingVertical: 5 },
  beltRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingHorizontal: 14 },

  txSectionHeaderSticky: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 14, paddingTop: 20 },
  txHeaderMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  txListBody: { paddingHorizontal: 14, paddingBottom: 40, zIndex: 5 },
  filterRow: { gap: 8, marginBottom: 10, alignItems: 'center' },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  txList: {},
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  txIconOuter: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, padding: 1, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  txIconBox: { width: 34, height: 34, borderRadius: 10, borderWidth: 1.3, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  txText: { flex: 1, marginRight: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  budgetBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  budgetText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  txAmountCol: { alignItems: 'flex-end' },
  txSeparator: { height: StyleSheet.hairlineWidth, marginLeft: 40 + 10 },
});
