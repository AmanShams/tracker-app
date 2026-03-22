import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_W = Dimensions.get('window').width;

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  iconName?: string;
  iconColor?: string;
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  iconName = "trash-outline",
  iconColor = "#FF3B30"
}: ConfirmModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
         <View style={s.content}>
            <View style={[s.iconBg, { backgroundColor: iconColor + '12' }]}>
               <Ionicons name={iconName as any} size={18} color={iconColor} />
            </View>
            
            <Text style={s.title}>{title}</Text>
            <Text style={s.message}>{message}</Text>
            
            <View style={s.btnRow}>
               <TouchableOpacity 
                 activeOpacity={0.7} 
                 style={[s.btn, s.cancelBtn]} 
                 onPress={onClose}
               >
                  <Text style={s.cancelText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 activeOpacity={0.8} 
                 style={[s.btn, s.confirmBtn, { backgroundColor: iconColor }]} 
                 onPress={() => {
                   onConfirm();
                   onClose();
                 }}
               >
                  <Text style={s.confirmText}>{confirmText}</Text>
               </TouchableOpacity>
            </View>
         </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  content: {
    width: Math.min(SCREEN_W - 60, 280),
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 8 }
    })
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#111111',
    textAlign: 'left',
    marginBottom: 6,
    letterSpacing: -0.4
  },
  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%'
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelBtn: {
    backgroundColor: '#F2F2F7',
  },
  confirmBtn: {
    // bgColor assigned via props
  },
  cancelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#111111'
  },
  confirmText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF'
  }
});
