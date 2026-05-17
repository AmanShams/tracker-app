import React from 'react';
import { Animated, TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native';

interface AnimatedScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

export function AnimatedScale({ children, onPress, style }: AnimatedScaleProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={style}
    >
      {children}
    </TouchableOpacity>
  );
}
