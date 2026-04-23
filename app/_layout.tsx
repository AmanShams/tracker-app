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
import { View, Platform } from 'react-native';
import Constants from 'expo-constants';
import 'react-native-reanimated';
import { BudgetProvider } from '../store/budgetStore';
import { CategoryProvider } from '../store/categoryStore';
import { TransactionProvider } from '../store/transactionStore';
import { SavingsProvider } from '../store/savingsStore';
import { ReminderProvider } from '../store/reminderStore';
import { useThemeStore } from '../store/themeStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { scheduleExpenseNotification } from '../notifications/scheduleExpenseNotification';
import { scheduleWeeklySummary } from '../notifications/scheduleWeeklySummary';

// import notifee from '@notifee/react-native';
// import { handleExpenseReply } from '../notifications/notificationReplyHandler';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

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

  useEffect(() => {
    if (fontsLoaded) {
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
          });
          return () => unsubscribe();
        } catch (e) {
          console.warn('Notifee foreground events skipped.');
        }
      }
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SavingsProvider>
        <ReminderProvider>
          <BudgetProvider>
            <CategoryProvider>
            <TransactionProvider>
              <ThemeProvider value={theme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  <Stack.Screen name="set-budget" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="create-category" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="add-transaction" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="reminders" options={{ title: 'Reminders' }} />
                  <Stack.Screen name="edit-reminder" options={{ title: 'Set Reminder' }} />
                </Stack>

                <StatusBar style={isDark ? "light" : "dark"} />
              </ThemeProvider>
            </TransactionProvider>
          </CategoryProvider>
        </BudgetProvider>
      </ReminderProvider>
      </SavingsProvider>


    </GestureHandlerRootView>
  );
}
