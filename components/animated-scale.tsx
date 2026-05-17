import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

interface AnimatedScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

export function AnimatedScale({ children, onPress, style }: AnimatedScaleProps) {
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
