import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { AnimatedScale } from './animated-scale';

interface BeltButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  style?: any;
}

export function BeltButton({ label, icon, onPress, style }: BeltButtonProps) {
  const { colors } = useThemeStore();

  return (
    <AnimatedScale
      style={[
        styles.beltBtnOuter,
        {
          backgroundColor: colors.beltBg,
          borderColor: colors.beltBorder
        },
        style
      ]}
      onPress={onPress}
    >
      <View style={[
        styles.beltBtnInner,
        {
          backgroundColor: colors.beltInnerBg,
          borderColor: colors.beltBorder
        }
      ]}>
        <View style={[
          styles.beltIconCircle,
          {
            backgroundColor: colors.beltIconBg,
            borderColor: colors.beltBorder
          }
        ]}>
          {icon}
        </View>
        <Text style={[styles.beltActionLabel, { color: colors.beltText }]}>{label}</Text>
      </View>
    </AnimatedScale>
  );
}

const styles = StyleSheet.create({
  beltBtnOuter: {
    height: 40,
    borderRadius: 24,
    borderWidth: 0.5,
    padding: 0.4,
    overflow: 'hidden',
  },
  beltBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    borderWidth: 1.2,
    gap: 5,
    paddingHorizontal: 12,
    height: '100%',
  },
  beltIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beltActionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: -0.3,
  },
});
