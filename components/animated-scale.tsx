import React from 'react';
import { Animated, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface AnimatedScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

export function AnimatedScale({ children, onPress, style }: AnimatedScaleProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const flatStyle = StyleSheet.flatten(style) || {};
  const wrapperStyle = {
    flex: flatStyle.flex,
    width: flatStyle.width,
    height: flatStyle.height,
    marginLeft: flatStyle.marginLeft,
    marginRight: flatStyle.marginRight,
    marginTop: flatStyle.marginTop,
    marginBottom: flatStyle.marginBottom,
  };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
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
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={wrapperStyle}
    >
      <Animated.View 
        style={[
          { 
            transform: [{ scale }], 
            flex: flatStyle.flex ? 1 : undefined,
            width: '100%',
            height: '100%'
          }, 
          style, 
          { marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0 }
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}
