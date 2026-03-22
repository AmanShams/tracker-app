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
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 40,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Custom Tab Bar Container ──────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDark } = useThemeStore();
  
  return (
    <View style={[styles.tabBarContainer, { backgroundColor: isDark ? colors.bg : '#000000' }]}>
      <View style={[styles.invertedCorner, { left: 0, backgroundColor: isDark ? colors.bg : '#000000' }]}>
        <View style={[styles.invertedCornerInner, { borderBottomLeftRadius: 32, backgroundColor: colors.surface }]} />
      </View>
      <View style={[styles.invertedCorner, { right: 0, backgroundColor: isDark ? colors.bg : '#000000' }]}>
        <View style={[styles.invertedCornerInner, { borderBottomRightRadius: 32, backgroundColor: colors.surface }]} />
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
  const getIcon = (name: string, focused: boolean) => {
    switch (name) {
      case 'index': return focused ? 'home' : 'home-outline';
      case 'categories': return focused ? 'grid' : 'grid-outline';
      case 'activity': return focused ? 'analytics' : 'analytics-outline';
      case 'savings': return focused ? 'leaf' : 'leaf-outline';
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
          color={isFocused ? "#FFFFFF" : "rgba(255,255,255,0.4)"}
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
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="activity" />
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
    top: -32,
    width: 32,
    height: 32,
  },
  invertedCornerInner: {
    flex: 1,
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
