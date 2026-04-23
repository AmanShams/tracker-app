import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
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
import { useReminders, Reminder } from '../store/reminderStore';
import { useThemeStore } from '../store/themeStore';
import { MainHeader } from '../components/main-header';

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function RemindersScreen() {
  const router = useRouter();
  const { reminders, toggleReminder } = useReminders();
  const { isDark, colors } = useThemeStore();

  const genericReminders = reminders.filter(r => r.type === 'generic');
  const summaryReminders = reminders.filter(r => r.type !== 'generic');

  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return { time: `${displayH}:${m.toString().padStart(2, '0')}`, ampm };
  };

  const renderCard = (r: Reminder) => {
    const { time, ampm } = formatTime(r.hour, r.minute);
    const isEmpty = r.days.length === 0 && r.hour === 0 && r.minute === 0;

    return (
      <TouchableOpacity 
        key={r.id} 
        activeOpacity={0.8} 
        style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => router.push({ pathname: '/edit-reminder', params: { id: r.id } })}
      >
        <Text style={[s.cardTitle, { color: colors.textSecondary }]}>{r.title}</Text>
        
        {!isEmpty ? (
          <>
            <View style={s.timeRow}>
              <Text style={[s.timeText, { color: colors.text }]}>{time}</Text>
              <Text style={[s.ampmText, { color: colors.textSecondary }]}>{ampm}</Text>
            </View>

            <View style={s.daysDots}>
              {DAYS_SHORT.map((_, i) => {
                const isActive = r.days.includes(i);
                return (
                  <View 
                    key={i} 
                    style={[
                      s.dot, 
                      { backgroundColor: isActive ? colors.accent : (isDark ? '#2C2C2E' : '#E5E5EA') }
                    ]} 
                  />
                );
              })}
            </View>
          </>
        ) : (
          <View style={s.emptyState}>
             <Ionicons name="add" size={24} color={colors.textTertiary} />
          </View>
        )}

        <TouchableOpacity 
          onPress={() => toggleReminder(r.id)}
          style={[
            s.toggle, 
            { backgroundColor: r.isEnabled ? colors.accent : (isDark ? '#3A3A3C' : '#D1D1D6') }
          ]}
        >
          <View style={[s.knob, r.isEnabled && s.knobActive]} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <MainHeader />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[typography.headingLarge, { fontSize: 28, color: colors.text }]}>Reminders</Text>
        </View>
        <View style={{ height: 4 }} />
        
        {/* 4 Generic Cards */}
        <View style={s.grid}>
          {genericReminders.map(renderCard)}
        </View>

        <View style={{ height: 24 }} />

        {/* Summary Bars */}
        <View style={s.barsContainer}>
          {summaryReminders.map((r) => (
            <TouchableOpacity 
              key={r.id} 
              activeOpacity={0.8}
              style={[s.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push({ pathname: '/edit-reminder', params: { id: r.id } })}
            >
              <Text style={[s.barTitle, { color: colors.text }]}>{r.title}</Text>
              <TouchableOpacity 
                onPress={() => toggleReminder(r.id)}
                style={[
                  s.toggle, 
                  { backgroundColor: r.isEnabled ? colors.accent : (isDark ? '#3A3A3C' : '#D1D1D6') }
                ]}
              >
                <View style={[s.knob, r.isEnabled && s.knobActive]} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { 
    width: '48%', 
    aspectRatio: 1, 
    borderRadius: 28, 
    borderWidth: 1, 
    padding: 20, 
    justifyContent: 'space-between',
  },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline' },
  timeText: { fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: -1 },
  ampmText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginLeft: 4 },
  daysDots: { flexDirection: 'row', gap: 5 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  toggle: { width: 34, height: 18, borderRadius: 10, padding: 2, alignSelf: 'flex-end' },
  knob: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFF' },
  knobActive: { alignSelf: 'flex-end' },

  barsContainer: { gap: 12 },
  bar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1 
  },
  barTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
});
