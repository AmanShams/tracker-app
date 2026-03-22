import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Text
} from 'react-native';
import { useThemeStore } from '../store/themeStore';

interface HeaderAction {
  icon: string;
  onPress?: () => void;
}

interface MainHeaderProps {
  actions?: HeaderAction[];
}

export function MainHeader({ actions = [] }: MainHeaderProps) {
  const { isDark, colors } = useThemeStore();

  return (
    <View style={s.header}>
      <View style={s.logoRow}>
        {/* <Text style={[s.logoText, { color: colors.text }]}>MANs Tracker</Text> */}
      </View>
      {/* <View style={s.headerIconGroup}>
        {actions.map((action, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.7}
            style={[
              s.squareBtn,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#F5F5F7',
                borderColor: isDark ? '#2C2C2E' : '#E8E8ED'
              }
            ]}
            onPress={action.onPress}
          >
            <Ionicons name={action.icon as any} size={16} color={colors.text} />
          </TouchableOpacity>
        ))}
      </View> */}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 8,
    marginBottom: 6,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -1,
    fontStyle: 'italic'
  },
  headerIconGroup: { flexDirection: 'row', gap: 8 },
  squareBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
});
