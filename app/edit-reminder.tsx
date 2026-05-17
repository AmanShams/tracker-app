import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { MainHeader } from '../components/main-header';

import { typography } from '@/constants/typography';
import { useCategories } from '../store/categoryStore';
import { Frequency, useReminders } from '../store/reminderStore';
import { useThemeStore } from '../store/themeStore';


const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EditReminderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { reminders, updateReminder } = useReminders();
  const { categories } = useCategories();
  const { isDark, colors } = useThemeStore();

  const reminder = reminders.find(r => r.id === id);

  const [hour, setHour] = useState('20');
  const [minute, setMinute] = useState('00');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [dateOfMonth, setDateOfMonth] = useState(1);
  const [isRecurring, setIsRecurring] = useState(true);
  const [pinnedHeaderH, setPinnedHeaderH] = useState(130);

  const onPinnedLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setPinnedHeaderH(height);
  }, []);

  useEffect(() => {
    if (reminder) {
      setHour(reminder.hour.toString());
      setMinute(reminder.minute.toString().padStart(2, '0'));
      setFrequency(reminder.frequency);
      setSelectedDays(reminder.days);
      setCategoryId(reminder.categoryId);
      setDateOfMonth(reminder.dateOfMonth || 1);
      setIsRecurring(reminder.isRecurring);
    }
  }, [reminder]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(prev => prev.filter(d => d !== day));
    } else {
      setSelectedDays(prev => [...prev, day]);
    }
  };

  const handleSave = () => {
    if (!reminder) return;

    const h = parseInt(hour);
    const m = parseInt(minute);

    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return;

    updateReminder({
      ...reminder,
      hour: h,
      minute: m,
      frequency,
      days: frequency === 'weekly' ? [0] : selectedDays, // Weekly is auto Sunday
      dateOfMonth: frequency === 'monthly' ? dateOfMonth : undefined,
      isRecurring,
      categoryId,
      isEnabled: true, // Auto enable on save
    });
    router.back();
  };

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{
        headerShown: false,
      }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={[s.pinnedHeader, { backgroundColor: colors.bg }]} onLayout={onPinnedLayout}>
        <SafeAreaView>
          <View style={s.headerContentPadded}>
            <MainHeader actions={[{ icon: 'settings-outline' }]} />
            <View style={s.titleRow}>
              <Text style={[typography.headingLarge, { fontSize: 28, color: colors.text }]}>Reminders</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        contentContainerStyle={[s.scrollContent, { paddingTop: pinnedHeaderH }]} 
        showsVerticalScrollIndicator={false}
      >

        {/* 1. Time Picker */}
        <View style={s.timeContainer}>
          <View style={s.timeInputBox}>
            <Text style={s.inputHint}>Hour (0-23)</Text>
            <TextInput
              style={[s.timeInput, { backgroundColor: colors.surface, color: colors.text }]}
              value={hour}
              onChangeText={setHour}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          <Text style={[s.colon, { color: colors.text }]}>:</Text>
          <View style={s.timeInputBox}>
            <Text style={s.inputHint}>Minute (0-59)</Text>
            <TextInput
              style={[s.timeInput, { backgroundColor: colors.surface, color: colors.text }]}
              value={minute}
              onChangeText={setMinute}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </View>

        <View style={s.divider} />

        {/* 2. Category Selector */}
        <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Link Category (Optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.categoryScroll} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
          <TouchableOpacity
            onPress={() => setCategoryId(undefined)}
            style={[
              s.catPill,
              { backgroundColor: colors.surface },
              !categoryId && { backgroundColor: colors.accent }
            ]}
          >
            <Ionicons name="notifications-outline" size={14} color={!categoryId ? '#FFF' : colors.textSecondary} />
            <Text style={[s.catPillText, { color: !categoryId ? '#FFF' : colors.textSecondary }]}>Default</Text>
          </TouchableOpacity>
          {categories.filter(c => c.id !== 'notification-fixed').map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoryId(cat.id)}
              style={[
                s.catPill,
                { backgroundColor: colors.surface },
                categoryId === cat.id && { backgroundColor: colors.accent }
              ]}
            >
              <Ionicons name={cat.icon as any} size={14} color={categoryId === cat.id ? '#FFF' : cat.color} />
              <Text style={[s.catPillText, { color: categoryId === cat.id ? '#FFF' : colors.textSecondary }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.divider} />

        {/* 3. Frequency Selector */}
        <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Confirm Frequency</Text>
        <View style={s.freqRow}>
          {['daily', 'weekly', 'monthly'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFrequency(f as Frequency)}
              style={[
                s.freqBtn,
                { backgroundColor: colors.surface },
                frequency === f && { backgroundColor: colors.accent }
              ]}
            >
              <Text style={[s.freqBtnText, { color: frequency === f ? '#FFF' : colors.textSecondary }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. Conditional Sections */}
        <View style={s.dynamicSection}>
          {frequency === 'daily' && (
            <>
              <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Repeat on days</Text>
              <View style={s.daysRow}>
                {DAYS_SHORT.map((day, i) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleDay(i)}
                    style={[
                      s.dayPill,
                      { backgroundColor: colors.surface },
                      selectedDays.includes(i) && { backgroundColor: colors.accent }
                    ]}
                  >
                    <Text style={[s.dayPillText, { color: selectedDays.includes(i) ? '#FFF' : colors.textSecondary }]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {frequency === 'weekly' && (
            <View style={[s.infoCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.accent} />
              <Text style={[s.infoCardText, { color: colors.textSecondary }]}>
                This reminder will be automatically scheduled for every Sunday morning.
              </Text>
            </View>
          )}

          {frequency === 'monthly' && (
            <>
              <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Select Date of Month</Text>
              <View style={s.dateGrid}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDateOfMonth(d)}
                    style={[
                      s.dateCell,
                      { backgroundColor: colors.surface },
                      dateOfMonth === d && { backgroundColor: colors.accent }
                    ]}
                  >
                    <Text style={[s.dateCellText, { color: dateOfMonth === d ? '#FFF' : colors.text }]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={s.divider} />

        {/* 4. Recurring Toggle */}
        <View style={s.toggleRow}>
          <View>
            <Text style={[s.toggleTitle, { color: colors.text }]}>Recurring</Text>
            <Text style={[s.toggleSubtitle, { color: colors.textSecondary }]}>Should this reminder repeat automatically?</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsRecurring(!isRecurring)}
            style={[
              s.toggle,
              { backgroundColor: isRecurring ? colors.accent : (isDark ? '#3A3A3C' : '#D1D1D6') }
            ]}
          >
            <View style={[s.knob, isRecurring && s.knobActive]} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />

        {/* 5. Save Button */}
        <TouchableOpacity style={[s.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
          <Text style={s.saveBtnText}>Save Reminder</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { padding: 14 },
  timeContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 16 },
  timeInputBox: { alignItems: 'center' },
  inputHint: { fontSize: 10, color: '#8E8E93', marginBottom: 6 },
  timeInput: { width: 100, height: 70, borderRadius: 12, textAlign: 'center', fontSize: 32, fontFamily: 'Inter_700Bold' },
  colon: { fontSize: 32, marginHorizontal: 15, marginTop: 15 },

  divider: { height: 1, backgroundColor: '#EAEAED', opacity: 0.1, marginVertical: 12 },

  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 10 },
  freqRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  freqBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  freqBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },

  categoryScroll: { marginBottom: 10 },
  catPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  catPillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  dynamicSection: { minHeight: 90 },

  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  dayPillText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  infoCard: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 12, alignItems: 'center' },
  infoCardText: { flex: 1, fontSize: 13, lineHeight: 18 },

  dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dateCell: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  dateCellText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  toggleSubtitle: { fontSize: 12, marginTop: 2 },
  toggle: { width: 34, height: 18, borderRadius: 9, padding: 2 },
  knob: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFF' },
  knobActive: { alignSelf: 'flex-end' },

  saveBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  pinnedHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerContentPadded: { paddingHorizontal: 16, paddingBottom: 5, paddingTop: Platform.OS === 'web' ? 10 : 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
