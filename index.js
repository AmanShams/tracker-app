import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Register Notifee background event (Native only, non-Expo Go)
const isNative = Platform.OS !== 'web';
const isExpoGo = Constants.appOwnership === 'expo';

if (isNative && !isExpoGo) {
  try {
    const notifee = require('@notifee/react-native').default;
    const { handleExpenseReply } = require('./notifications/notificationReplyHandler');
    
    notifee.onBackgroundEvent(async (event) => {
      await handleExpenseReply(event);
    });
  } catch (e) {
    console.warn('Notifee background event listener skipped.');
  }
}

// Must be exported to work with Expo Router
export function App() {
  const context = require.context('./app');
  return <ExpoRoot context={context} />;
}

registerRootComponent(App);
