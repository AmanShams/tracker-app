import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderAction {
  icon: string;
  onPress?: () => void;
}

interface MainHeaderProps {
  actions?: HeaderAction[];
}

export function MainHeader({ actions = [] }: MainHeaderProps) {
  return (
    <View style={s.header}>
      <View style={s.logoRow}>
        <Text style={s.logoText}>MANs Tracker</Text>
      </View>
      <View style={s.headerIconGroup}>
        {actions.map((action, i) => (
          <TouchableOpacity 
            key={i} 
            activeOpacity={0.7} 
            style={s.squareBtn} 
            onPress={action.onPress}
          >
            <Ionicons name={action.icon as any} size={16} color="#111111" />
          </TouchableOpacity>
        ))}
      </View>
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
    fontStyle: 'italic',
    color: '#111111'
  },
  headerIconGroup: { flexDirection: 'row', gap: 8 },
  squareBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8ED'
  },
});
