import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Dimensions, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCurrency } from '@/context/CurrencyContext';
import { useWallet } from '@/context/WalletContext';
import { useTransactions } from '@/context/TransactionContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { Transaction } from '@/constants/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ visible, transaction, onClose }) => {
  const { formatMoney, symbol } = useCurrency();
  const { wallets } = useWallet();
  const { updateTransaction, deleteTransaction } = useTransactions();
  const { isDarkMode, currentAccentColor } = useTheme();

  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  // Edit states
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  
  // Display states (local values that update immediately)
  const [displayAmount, setDisplayAmount] = useState(0);
  const [displayNote, setDisplayNote] = useState('');

  // Reset edit states when transaction changes
  useEffect(() => {
    if (transaction) {
      setEditAmount(String(transaction.amount));
      setEditNote(transaction.note || '');
      setDisplayAmount(transaction.amount);
      setDisplayNote(transaction.note || '');
      setIsEditingAmount(false);
      setIsEditingNote(false);
    }
  }, [transaction]);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(-SCREEN_HEIGHT * 0.85, { duration: 300 });
    } else {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const scrollTo = (destination: number) => {
    'worklet';
    translateY.value = withTiming(destination, { duration: 300 });
  };

  const closeModal = () => {
    scrollTo(0);
    setTimeout(() => onClose(), 300);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newValue = event.translationY + context.value.y;
      translateY.value = Math.min(0, Math.max(newValue, -SCREEN_HEIGHT * 0.85));
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        scrollTo(0);
        runOnJS(onClose)();
      } else {
        scrollTo(-SCREEN_HEIGHT * 0.85);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';
  const wallet = wallets.find(w => w.id === transaction.walletId);

  const getIconColor = (colorClass?: string) => {
    if (!colorClass) return '#F59E0B';
    if (colorClass.includes('red')) return '#EF4444';
    if (colorClass.includes('green')) return '#10B981';
    if (colorClass.includes('blue')) return '#3B82F6';
    if (colorClass.includes('yellow')) return '#F59E0B';
    if (colorClass.includes('purple')) return '#8B5CF6';
    if (colorClass.includes('pink')) return '#EC4899';
    if (colorClass.includes('indigo')) return '#6366F1';
    if (colorClass.includes('orange')) return '#F97316';
    return '#F59E0B';
  };
  const iconColor = getIconColor(transaction.color);

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteTransaction(transaction.id);
            closeModal();
          }
        },
      ]
    );
  };

  const handleSaveAmount = () => {
    const numAmount = parseFloat(editAmount);
    if (numAmount > 0) {
      setDisplayAmount(numAmount); // Update local display immediately
      updateTransaction(transaction.id, { amount: numAmount });
    }
    setIsEditingAmount(false);
  };

  const handleSaveNote = () => {
    setDisplayNote(editNote); // Update local display immediately
    updateTransaction(transaction.id, { note: editNote });
    setIsEditingNote(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Backdrop */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={closeModal}
        />

        {/* Bottom Sheet */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.bottomSheet, animatedStyle]}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Transaction Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <IconSymbol name="xmark" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.content} 
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {/* Icon & Name */}
              <View style={styles.topSection}>
                <View style={[styles.iconCircle, { backgroundColor: currentAccentColor + '20' }]}>
                  <IconSymbol name={transaction.icon as any || 'star.fill'} size={32} color={currentAccentColor} />
                </View>
                <Text style={styles.name}>{transaction.name}</Text>
                <Text style={styles.date}>
                  {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>

              {/* Amount - Editable */}
              <TouchableOpacity 
                style={styles.amountContainer}
                onPress={() => setIsEditingAmount(true)}
              >
                {isEditingAmount ? (
                  <View style={styles.editAmountRow}>
                    <Text style={styles.currencySymbol}>{symbol}</Text>
                    <TextInput
                      style={[styles.amountInput, { borderColor: currentAccentColor }]}
                      value={editAmount}
                      onChangeText={setEditAmount}
                      keyboardType="numeric"
                      autoFocus
                      onBlur={handleSaveAmount}
                      onSubmitEditing={handleSaveAmount}
                    />
                  </View>
                ) : (
                  <View style={styles.editableRow}>
                    <Text style={[styles.amount, { color: isIncome ? '#10B981' : '#111827' }]}>
                      {isIncome ? '' : '-'}{formatMoney(displayAmount)}
                    </Text>
                    <IconSymbol name="pencil" size={16} color="#9CA3AF" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.statusText}>SUCCESSFUL</Text>
              </View>

              {/* Details */}
              <View style={styles.detailsCard}>
                <DetailRow 
                  label="Category" 
                  icon={transaction.icon as any} 
                  iconColor={iconColor}
                  value={transaction.category || transaction.name} 
                />
                <DetailRow label="Platform" value={transaction.platform || 'Etc'} />
                <DetailRow 
                  label="Source" 
                  icon="creditcard.fill" 
                  iconColor="#6B7280"
                  value={wallet?.name || 'Primary Wallet'} 
                />
                
                {/* Notes - Editable */}
                <View style={styles.notesSection}>
                  <View style={styles.notesRow}>
                    <Text style={styles.detailLabel}>Notes</Text>
                    {isEditingNote ? (
                      <TouchableOpacity 
                        onPress={handleSaveNote}
                        style={[styles.doneBtnSmall, { backgroundColor: currentAccentColor }]}
                      >
                        <Text style={styles.doneBtnSmallText}>Done</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => setIsEditingNote(true)}>
                        <IconSymbol name="pencil" size={16} color={currentAccentColor} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {isEditingNote ? (
                    <TextInput
                      style={[styles.notesInput, { borderColor: currentAccentColor }]}
                      value={editNote}
                      onChangeText={setEditNote}
                      placeholder="Add a note..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      autoFocus
                    />
                  ) : (
                    <Text style={styles.notesText}>
                      {displayNote || 'No notes added.'}
                    </Text>
                  )}
                </View>
              </View>

              {/* Delete Button */}
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <IconSymbol name="trash" size={16} color="#EF4444" />
                <Text style={styles.deleteBtnText}>Delete Transaction</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Footer - Done Button */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.doneBtn, { backgroundColor: currentAccentColor }]} 
                onPress={closeModal}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

// Helper component
function DetailRow({ label, value, icon, iconColor }: { label: string; value: string; icon?: any; iconColor?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon && <IconSymbol name={icon} size={16} color={iconColor || '#6B7280'} />}
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    top: SCREEN_HEIGHT,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    padding: 8,
  },
  content: {
    paddingBottom: 24,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
  },
  editAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    borderBottomWidth: 2,
    minWidth: 120,
    textAlign: 'center',
    paddingVertical: 4,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  notesSection: {
    paddingTop: 12,
  },
  notesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  notesInput: {
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  doneBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  doneBtnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  doneBtnSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
