import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';

// ─── Micro Interactions ──────────────────────────────────────────────────────
function AnimatedScale({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: any }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={style}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

// ─── Custom Tab Bar Container ──────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useThemeStore();
  const cornerBgColor = colors.bg;

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: colors.navBg }]}>
      <View style={[styles.invertedCorner, { left: 0 }]}>
        <View style={[styles.invertedCornerInner, { left: -24, borderColor: colors.navBg }]} />
      </View>
      <View style={[styles.invertedCorner, { right: 0 }]}>
        <View style={[styles.invertedCornerInner, { left: -48, borderColor: colors.navBg }]} />
      </View>

      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              routeName={route.name}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Tab Item (Icon Only) ───────────────────────────────────────────────────
function TabItem({ isFocused, onPress, routeName }: { isFocused: boolean; onPress: () => void; routeName: string }) {
  const { colors } = useThemeStore();
  const getIcon = (name: string, focused: boolean) => {
    switch (name) {
      case 'index': return focused ? 'home' : 'home-outline';
      case 'categories': return focused ? 'grid' : 'grid-outline';
      case 'history': return focused ? 'receipt' : 'receipt-outline';
      case 'savings': return focused ? 'leaf' : 'leaf-outline';
      case 'activities': return focused ? 'stats-chart' : 'stats-chart-outline';
      case 'profile': return focused ? 'person' : 'person-outline';
      default: return 'apps-outline';
    }
  };

  return (
    <View style={styles.tabItemContainer}>
      <AnimatedScale
        onPress={onPress}
        style={styles.tabItem}
      >
        <Ionicons
          name={getIcon(routeName, isFocused) as any}
          size={20}
          color={isFocused ? colors.navActive : colors.navInactive}
        />
      </AnimatedScale>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: 'fade',
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="activities" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="savings" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    zIndex: 1000,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tabItemContainer: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
