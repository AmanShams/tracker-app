import { typography } from '@/constants/typography';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import React, { useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Line as SvgLine } from 'react-native-svg';
import { MainHeader } from '../../components/main-header';
import { useThemeStore } from '../../store/themeStore';
import { useTransactions } from '../../store/transactionStore';

// ─── Custom Bicolor Area Chart ────────────────────────────────────────────────
interface ChartPoint { value: number; label?: string }

interface BicolorAreaChartProps {
  data: ChartPoint[];
  green: string;
  red: string;
  textColor: string;
  separatorColor: string;
  isDark: boolean;
}

function BicolorAreaChart({
  data,
  green,
  red,
  textColor,
  separatorColor,
  isDark,
}: BicolorAreaChartProps) {
  const [width, setWidth] = useState(0);

  const PAD_TOP = 12;
  const PAD_BOTTOM = 6;
  const HEIGHT = 180;
  const chartH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const values = data.map(d => d.value);
  const maxPos = Math.max(...values, 0);
  const minNeg = Math.min(...values, 0);
  const absMax = Math.max(maxPos, Math.abs(minNeg), 1);

  const zeroY = PAD_TOP + (absMax / (absMax * 2)) * chartH;
  const pixPerUnit = chartH / (absMax * 2);

  const getX = (i: number) => (i / (data.length - 1)) * width;
  const getY = (v: number) => zeroY - v * pixPerUnit;

  type Pt = { x: number; y: number };
  type Seg = { pts: Pt[]; positive: boolean };
  const segments: Seg[] = [];
  let cur: Pt[] = [{ x: getX(0), y: getY(values[0]) }];
  let curPositive = values[0] >= 0;

  for (let i = 0; i < data.length - 1; i++) {
    const v1 = values[i], v2 = values[i + 1];
    const x1 = getX(i), x2 = getX(i + 1);

    if ((v1 >= 0 && v2 < 0) || (v1 < 0 && v2 >= 0)) {
      const t = v1 / (v1 - v2);
      const crossX = x1 + t * (x2 - x1);
      cur.push({ x: crossX, y: zeroY });
      segments.push({ pts: cur, positive: curPositive });
      curPositive = v2 >= 0;
      cur = [{ x: crossX, y: zeroY }, { x: x2, y: getY(v2) }];
    } else {
      cur.push({ x: x2, y: getY(v2) });
    }
  }
  segments.push({ pts: cur, positive: curPositive });

  const areaPath = (pts: Pt[]) => {
    if (pts.length < 2) return '';
    const start = pts[0], end = pts[pts.length - 1];
    let d = `M ${start.x} ${zeroY}`;
    pts.forEach(p => { d += ` L ${p.x} ${p.y}`; });
    d += ` L ${end.x} ${zeroY} Z`;
    return d;
  };

  const linePath = (pts: Pt[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const step = Math.ceil(absMax / 4 / 10) * 10 || 10;
  const yRefs: { v: number; y: number }[] = [];
  for (let v = step; v <= absMax; v += step) {
    yRefs.push({ v, y: getY(v) });
    yRefs.push({ v: -v, y: getY(-v) });
  }

  return (
    <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          <Defs>
            <LinearGradient id="grad_pos" x1="0" y1={PAD_TOP} x2="0" y2={zeroY} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={green} stopOpacity="0.3" />
              <Stop offset="1" stopColor={green} stopOpacity="0.02" />
            </LinearGradient>
            <LinearGradient id="grad_neg" x1="0" y1={zeroY} x2="0" y2={HEIGHT - PAD_BOTTOM} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={red} stopOpacity="0.02" />
              <Stop offset="1" stopColor={red} stopOpacity="0.3" />
            </LinearGradient>
          </Defs>

          {yRefs.map(({ v, y }) => (
            <SvgLine key={`ref-${v}`} x1={0} y1={y} x2={width} y2={y} stroke={separatorColor} strokeWidth={0.5} strokeDasharray="4,4" opacity={0.3} />
          ))}

          <SvgLine x1={0} y1={zeroY} x2={width} y2={zeroY} stroke={separatorColor} strokeWidth={0.8} opacity={0.6} />

          {segments.map((seg, i) => (
            <Path key={`area-${i}`} d={areaPath(seg.pts)} fill={`url(#${seg.positive ? 'grad_pos' : 'grad_neg'})`} stroke="none" />
          ))}

          {segments.map((seg, i) => (
            <Path key={`line-${i}`} d={linePath(seg.pts)} fill="none" stroke={seg.positive ? green : red} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
          ))}

          {data.map((d, i) => (
            <Circle key={`dot-${i}`} cx={getX(i)} cy={getY(d.value)} r={i === 0 ? 0 : 2} fill={d.value >= 0.002 ? green : (d.value < 0 ? red : textColor)} stroke={isDark ? '#1C1C1E' : '#FFFFFF'} strokeWidth={0.5} />
          ))}
        </Svg>
      )}
    </View>
  );
}

// ─── Spending Heatmap (GitHub Style) ──────────────────────────────────────────
function SpendingHeatmap({
  transactions,
  colors,
  isDark,
  activeRange
}: {
  transactions: any[];
  colors: any;
  isDark: boolean;
  activeRange: 'W' | 'M' | 'Y' | 'A';
}) {
  const scrollRef = React.useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const daysToShow = activeRange === 'W' ? 7 : (activeRange === 'M' ? 30 : (activeRange === 'Y' ? 364 : 364)); // 1 year max for heatmap
  const weeksToShow = Math.ceil(daysToShow / 7);
  const today = dayjs();
  const endDate = today.endOf('week');
  const startDate = endDate.subtract(weeksToShow * 7 - 1, 'day').startOf('week');

  const { dailyActivity, maxIncome, maxExpense } = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    let maxI = 1, maxE = 1;
    transactions.forEach(tx => {
      if (tx.date) {
        const parsed = dayjs(tx.date, ['YYYY-MM-DD', 'MMM D, YYYY', 'MMM DD, YYYY'], true);
        if (parsed.isValid()) {
          const d = parsed.format('YYYY-MM-DD');
          if (!map[d]) map[d] = { income: 0, expense: 0 };
          const amt = Number(tx.amount) || 0;
          if (tx.type === 'income') {
            map[d].income += amt;
            if (map[d].income > maxI) maxI = map[d].income;
          } else {
            map[d].expense += amt;
            if (map[d].expense > maxE) maxE = map[d].expense;
          }
        }
      }
    });
    return { dailyActivity: map, maxIncome: maxI, maxExpense: maxE };
  }, [transactions]);
  const grid = [];
  let monthLabels: { label: string; index: number }[] = [];
  let lastMonth = '';

  for (let w = 0; w < weeksToShow; w++) {
    const week = [];
    const weekStart = startDate.add(w, 'week');
    const mLabel = weekStart.format('MMM');
    if (mLabel !== lastMonth) {
      monthLabels.push({ label: mLabel, index: w });
      lastMonth = mLabel;
    }
    for (let d = 0; d < 7; d++) {
      const date = weekStart.add(d, 'day');
      if (date.isAfter(today)) week.push(null);
      else {
        const key = date.format('YYYY-MM-DD');
        week.push({ date: key, activity: dailyActivity[key] || { income: 0, expense: 0 } });
      }
    }
    grid.push(week);
  }

  const gap = 3;
  const cellSize = 12;

  return (
    <View
      style={{ marginTop: 24, paddingHorizontal: 5, width: '100%' }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={[typography.headingMedium, { color: colors.text, fontSize: 16 }]}>Financial Activity Heatmap</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={(w) => {
          // Auto-scroll to the end (today) on load or range change
          if (w > 0) scrollRef.current?.scrollTo({ x: w, animated: false });
        }}
      >
        <View style={{ flexDirection: 'row', gap }}>
          {grid.map((week, wIdx) => (
            <View key={wIdx} style={{ gap }}>
              {week.map((day, dIdx) => {
                if (!day) return <View key={dIdx} style={{ width: cellSize, height: cellSize }} />;

                const { income, expense } = day.activity;
                const isIncome = income > 0;
                const isExpense = expense > 0;

                let color = colors.red;
                let ratio = 0;
                if (isIncome) {
                  color = colors.green;
                  ratio = income / maxIncome;
                } else if (isExpense) {
                  color = colors.red;
                  ratio = expense / maxExpense;
                }

                const opacity = (isIncome || isExpense)
                  ? 0.25 + (Math.min(ratio, 1) * 0.75)
                  : (isDark ? 0.08 : 0.04);

                return (
                  <View
                    key={dIdx}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 2,
                      backgroundColor: color,
                      opacity
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>


      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'flex-end', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 9 }]}>Spent</Text>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.red, opacity: 0.8 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 9 }]}>Received</Text>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.green, opacity: 0.8 }} />
        </View>
      </View>
    </View>
  );
}

export default function ActivitiesScreen() {
  const { transactions } = useTransactions();
  const { isDark, colors } = useThemeStore();
  const [activeRange, setActiveRange] = useState<'W' | 'M' | 'Y' | 'A'>('M');

  const chartData = useMemo(() => {
    const now = dayjs();

    const withIdx = transactions.map((tx, index) => ({ tx, index }));

    const filtered = withIdx.filter(item => {
      const tx = item.tx;
      if (!tx.date || isNaN(Number(tx.amount))) return false;

      const parsed = dayjs(tx.date, ['YYYY-MM-DD', 'MMM D, YYYY', 'MMM DD, YYYY'], true);
      if (!parsed.isValid()) return false;

      if (activeRange === 'W') return parsed.isAfter(now.subtract(7, 'day'));
      if (activeRange === 'M') return parsed.isAfter(now.subtract(30, 'day'));
      if (activeRange === 'Y') return parsed.isAfter(now.subtract(1, 'year'));
      return true;
    });

    const sorted = filtered.sort((a, b) => {
      const d_a = dayjs(a.tx.date, ['YYYY-MM-DD', 'MMM D, YYYY', 'MMM DD, YYYY']).valueOf();
      const d_b = dayjs(b.tx.date, ['YYYY-MM-DD', 'MMM D, YYYY', 'MMM DD, YYYY']).valueOf();
      if (d_a !== d_b) return d_a - d_b;
      return b.index - a.index;
    }).map(i => i.tx);

    const balancePoints: ChartPoint[] = [{ value: 0 }];
    let running = 0;
    sorted.forEach((tx) => {
      const val = Number(tx.amount) || 0;
      running += tx.type === 'income' ? val : -val;
      balancePoints.push({ value: running });
    });

    return { balancePoints, filteredTransactions: filtered.map(i => i.tx) };
  }, [transactions, activeRange]);

  const categorizedData = useMemo(() => {
    const expenses: Record<string, { value: number; color: string }> = {};
    const incomes: Record<string, { value: number; color: string }> = {};
    let totalExpense = 0;
    let totalIncome = 0;

    chartData.filteredTransactions.forEach(tx => {
      const displayName = tx.categoryName === 'From Notifications' ? 'Uncategorized' : tx.categoryName;
      const displayColor = tx.categoryName === 'From Notifications' ? '#FACC15' : (tx.categoryColor || (tx.type === 'expense' ? colors.red : colors.green));

      if (tx.type === 'expense') {
        if (!expenses[displayName]) expenses[displayName] = { value: 0, color: displayColor };
        expenses[displayName].value += tx.amount;
        totalExpense += tx.amount;
      } else {
        if (!incomes[displayName]) incomes[displayName] = { value: 0, color: displayColor };
        incomes[displayName].value += tx.amount;
        totalIncome += tx.amount;
      }
    });


    const formatData = (map: typeof expenses, total: number) => {
      const items = Object.entries(map).map(([name, data]) => ({
        value: data.value,
        label: name,
        color: data.color,
        percentage: total > 0 ? ((data.value / total) * 100).toFixed(0) : '0',
      })).sort((a, b) => b.value - a.value);

      const donutData = items.map(item => ({ value: item.value, color: item.color, text: `${item.percentage}%` }));
      return { items, donutData, total };
    };

    return { expense: formatData(expenses, totalExpense), income: formatData(incomes, totalIncome) };
  }, [chartData.filteredTransactions, colors.red, colors.green]);

  const splitAmount = (amt: number) => {
    const s = amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const [whole, dec] = s.split('.');
    return { whole, dec };
  };

  const totalInc = splitAmount(categorizedData.income.total);
  const totalExp = splitAmount(categorizedData.expense.total);

  const CategoryChartBlock = ({ data, type, style }: { data: any; type: 'income' | 'expense'; style?: any }) => {
    if (data.items.length === 0) return <View style={[styles.chartCard, style]}><View style={styles.emptyContainerSmall}><Text style={[typography.body, { color: colors.textSecondary, fontSize: 12 }]}>No {type}s.</Text></View></View>;
    return (
      <View style={[styles.chartCard, style]}>
        <View style={{ alignItems: 'center' }}>
          <PieChart donut showGradient sectionAutoFocus radius={60} innerRadius={48} innerCircleColor={colors.bg} data={data.donutData} centerLabelComponent={() => (
            <View style={{ alignItems: 'center' }}>
              <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 9 }]}>{type === 'income' ? 'Earned' : 'Spent'}</Text>
              <Text style={[typography.statAmount, { color: colors.text, fontSize: 12 }]}>Rs {data.total.toFixed(0)}</Text>
            </View>
          )} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4, gap: 2 }} style={{ marginTop: 12 }}>
          {data.items.map((item: any, index: number) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', paddingHorizontal: 4, paddingVertical: 4, borderRadius: 16 }}>
              <View style={{ backgroundColor: item.color, width: 6, height: 6, borderRadius: 3, marginRight: 4 }} />
              <Text style={[typography.caption, { color: colors.text, fontSize: 10, marginRight: 4 }]} numberOfLines={1}>{item.label}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10, fontWeight: 'bold' }]}>{item.percentage}%</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <MainHeader />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[typography.headingLarge, { fontSize: 28, color: colors.text }]}>Activities</Text>

              <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA', borderRadius: 12, padding: 2 }}>
                {[{ k: 'W', l: '7D' }, { k: 'M', l: '30D' }, { k: 'Y', l: '1Y' }, { k: 'A', l: 'All' }].map(f => (
                  <Text
                    key={f.k}
                    onPress={() => setActiveRange(f.k as any)}
                    style={[
                      typography.caption,
                      {
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: activeRange === f.k ? (isDark ? '#2C2C2E' : '#FFFFFF') : 'transparent',
                        color: activeRange === f.k ? colors.text : colors.textSecondary,
                        fontSize: 10,
                        fontWeight: activeRange === f.k ? '600' : '400'
                      }
                    ]}
                  >
                    {f.l}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.summaryContainerSmall, { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 }]}>
            <View style={styles.statBoxCompact}>
              <Text style={styles.statLabelSmall}>{activeRange === 'A' ? 'Total Income' : 'Period Income'}</Text>
              <View style={styles.statValueLine}>
                <Text style={[styles.statInt, { color: colors.text }]}>{totalInc.whole}</Text>
                <Text style={[styles.statDec, { color: colors.textTertiary }]}>.{totalInc.dec}</Text>
              </View>
            </View>
            <View style={[styles.vDivider, { backgroundColor: colors.separator, width: 1 }]} />
            <View style={styles.statBoxCompact}>
              <Text style={styles.statLabelSmall}>{activeRange === 'A' ? 'Total Expense' : 'Period Expense'}</Text>
              <View style={styles.statValueLine}>
                <Text style={[styles.statInt, { color: colors.text }]}>{totalExp.whole}</Text>
                <Text style={[styles.statDec, { color: colors.textTertiary }]}>.{totalExp.dec}</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
            <CategoryChartBlock style={{ flex: 1, padding: 4 }} data={categorizedData.income} type="income" />
            <CategoryChartBlock style={{ flex: 1, padding: 4 }} data={categorizedData.expense} type="expense" />
          </View>

          <View style={{ marginTop: 16, paddingHorizontal: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View>
                <Text style={[typography.headingMedium, { color: colors.text, fontSize: 16 }]}>Cash Flow</Text>
              </View>
            </View>

            {chartData.balancePoints.length > 1 ? (
              <BicolorAreaChart data={chartData.balancePoints} green={colors.green} red={colors.red} textColor={colors.textSecondary} separatorColor={colors.separator} isDark={isDark} />
            ) : (
              <View style={[styles.emptyContainer, { height: 100 }]}><Text style={[typography.body, { color: colors.textSecondary, fontSize: 12 }]}>No transactions found for this period.</Text></View>
            )}
          </View>

          <View style={{ marginTop: -8 }}>
            <SpendingHeatmap transactions={transactions} colors={colors} isDark={isDark} activeRange={activeRange} />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, paddingTop: 4 },
  header: { marginBottom: 4 },
  chartCard: { padding: 16, marginBottom: 4 },
  emptyContainer: { height: 100, justifyContent: 'center', alignItems: 'center', width: '100%' },
  emptyContainerSmall: { height: 80, justifyContent: 'center', alignItems: 'center', width: '100%' },

  // Summary Stats
  summaryContainerSmall: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, marginBottom: 0 },
  vDivider: { width: 1, height: 40, marginHorizontal: 12 },
  statBoxCompact: { flex: 1 },
  statLabelSmall: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8E8E93', letterSpacing: -0.2, marginBottom: -2 },
  statValueLine: { flexDirection: 'row', alignItems: 'baseline' },
  statInt: { fontFamily: 'Inter_700Bold', fontSize: 32, fontWeight: '700', letterSpacing: -1, lineHeight: 38 },
  statDec: { fontFamily: 'Inter_400Regular', fontSize: 16, letterSpacing: -0.1, lineHeight: 38, marginLeft: 1 },
});
