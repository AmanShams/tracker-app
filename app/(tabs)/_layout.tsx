import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Micro Interactions ──────────────────────────────────────────────────────
function AnimatedScale({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: any }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
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
      <Animated.View style={{ transform: [{ scale }], flexDirection: 'row', alignItems: 'center' }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Custom Tab Bar Container ──────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { descriptors: routeDescriptors } = descriptors;
          const { options } = descriptors[route.key];
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
              label={options.tabBarLabel ?? route.name}
              routeName={route.name}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Animated Tab Item ───────────────────────────────────────────────────────
function TabItem({ isFocused, onPress, label, routeName }: { isFocused: boolean; onPress: () => void; label: string; routeName: string }) {
  const animatedValue = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 50,
    }).start();
  }, [isFocused]);

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [42, 90], // Smaller expansion for refined text
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#262626'],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

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

  const getLabel = (name: string) => {
    switch (name) {
      case 'index': return 'Home';
      case 'categories': return 'Category';
      case 'activity': return 'Stats';
      case 'savings': return 'Budgets';
      case 'profile': return 'User';
      default: return name;
    }
  };

  return (
    <Animated.View style={[styles.tabItemContainer, { width, backgroundColor }]}>
      <AnimatedScale
        onPress={onPress}
        style={styles.tabItem}
      >
        <Ionicons
          name={getIcon(routeName, isFocused) as any}
          size={18}
          color="#FFFFFF"
        />
        {isFocused && (
          <Animated.View style={{ opacity, transform: [{ translateX }], marginLeft: 6 }}>
            <Text style={styles.tabLabel} numberOfLines={1}>
              {getLabel(routeName)}
            </Text>
          </Animated.View>
        )}
      </AnimatedScale>
    </Animated.View>
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
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#f8f8f8',
    borderRadius: 28,
    padding: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#262626',
  },
  tabItemContainer: {
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    paddingLeft: 12, // Align icon properly
    overflow: 'hidden',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  tabLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    letterSpacing: -0.5,
  },
});
