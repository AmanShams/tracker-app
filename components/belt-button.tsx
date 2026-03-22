import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedScale } from './animated-scale';

interface BeltButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  style?: any;
}

export function BeltButton({ label, icon, onPress, style }: BeltButtonProps) {
  return (
    <AnimatedScale 
      style={[styles.beltBtnOuter, style]}
      onPress={onPress}
    >
      <View style={styles.beltBtnInner}>
        <View style={styles.beltIconCircle}>
          {icon}
        </View>
        <Text style={styles.beltActionLabel}>{label}</Text>
      </View>
    </AnimatedScale>
  );
}

const styles = StyleSheet.create({
  beltBtnOuter: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#000000',
    padding: 1.5,
    overflow: 'hidden',
  },
  beltBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#1C1C1E',
    gap: 7,
    paddingHorizontal: 20,
    height: '100%',
  },
  beltIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262628',
  },
  beltActionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
