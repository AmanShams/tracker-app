import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { View, Platform, AppState } from 'react-native';
import Constants from 'expo-constants';
import 'react-native-reanimated';
import { BudgetProvider, useBudgets } from '../store/budgetStore';
import { CategoryProvider, useCategories } from '../store/categoryStore';
import { TransactionProvider, useTransactions } from '../store/transactionStore';
import { SavingsProvider, useSavings } from '../store/savingsStore';
import { ReminderProvider, useReminders } from '../store/reminderStore';
import { useThemeStore } from '../store/themeStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { scheduleWeeklySummary } from '../notifications/scheduleWeeklySummary';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function HydrationHandler({ children, fontsLoaded }: { children: React.ReactNode, fontsLoaded: boolean }) {
  const { isLoaded: savingsLoaded } = useSavings();
  const { isLoaded: remindersLoaded } = useReminders();
  const { isLoaded: budgetsLoaded } = useBudgets();
  const { isLoaded: categoriesLoaded } = useCategories();
  const { isLoaded: transactionsLoaded, refreshTransactions } = useTransactions();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshTransactions();
      }
    });
    return () => subscription.remove();
  }, [refreshTransactions]);

  const allLoaded = fontsLoaded && savingsLoaded && remindersLoaded && budgetsLoaded && categoriesLoaded && transactionsLoaded;

  useEffect(() => {
    if (allLoaded) {
      SplashScreen.hideAsync();
      
      // Schedule daily reminder for 8:00 PM (Native only, non-Expo Go)
      const isNative = Platform.OS !== 'web';
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isNative && !isExpoGo) {
        try {
          const { scheduleExpenseNotification } = require('../notifications/scheduleExpenseNotification');
          const notifee = require('@notifee/react-native').default;
          const { handleExpenseReply } = require('../notifications/notificationReplyHandler');

          scheduleExpenseNotification({ hour: 20, minute: 0 });
          scheduleWeeklySummary();

          // Handle foreground events
          const unsubscribe = notifee.onForegroundEvent(async (event: any) => {
            await handleExpenseReply(event);
            await refreshTransactions();
          });
          return () => unsubscribe();
        } catch (e) {
          console.warn('Notifee foreground events skipped.');
        }
      }
    }
  }, [allLoaded]);

  if (!allLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { isDark, colors } = useThemeStore();

  const theme = useMemo(() => {
     const base = isDark ? DarkTheme : DefaultTheme;
     return {
        ...base,
        colors: {
           ...base.colors,
           primary: colors.accent,
           background: colors.surface,
           card: colors.surface,
           text: colors.text,
           border: colors.separator,
           notification: colors.accent,
        }
     };
  }, [isDark, colors]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SavingsProvider>
        <ReminderProvider>
          <BudgetProvider>
            <CategoryProvider>
            <TransactionProvider>
              <HydrationHandler fontsLoaded={fontsLoaded}>
                <ThemeProvider value={theme}>
                  <Stack screenOptions={{ animation: 'fade' }}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ title: 'Modal' }} />
                    <Stack.Screen name="set-budget" options={{ headerShown: false }} />
                    <Stack.Screen name="create-category" options={{ headerShown: false }} />
                    <Stack.Screen name="add-transaction" options={{ headerShown: false }} />
                    <Stack.Screen name="reminders" options={{ title: 'Reminders' }} />
                    <Stack.Screen name="edit-reminder" options={{ title: 'Set Reminder' }} />
                    <Stack.Screen name="import-json" options={{ headerShown: false }} />
                  </Stack>

                  <StatusBar style={isDark ? "light" : "dark"} />
                </ThemeProvider>
              </HydrationHandler>
            </TransactionProvider>
          </CategoryProvider>
        </BudgetProvider>
      </ReminderProvider>
      </SavingsProvider>
    </GestureHandlerRootView>
  );
}
