import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Dimensions, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCurrency } from '@/context/CurrencyContext';
import { useWallet } from '@/context/WalletContext';
import { useTransactions } from '@/context/TransactionContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { Transaction } from '@/constants/types';
import { CategoryItem, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, PLATFORMS, PlatformItem } from '@/constants/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fonts } from '@/constants/fonts';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddTransactionDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const AddTransactionDrawer: React.FC<AddTransactionDrawerProps> = ({ visible, onClose }) => {
  const { symbol } = useCurrency();
  const { selectedWallet } = useWallet();
  const { addTransaction } = useTransactions();
  const { isDarkMode, currentAccentColor } = useTheme();

  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  // Form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Categories
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>([]);
  
  useEffect(() => {
    AsyncStorage.getItem('wallet_custom_categories').then(saved => {
      if (saved) setCustomCategories(JSON.parse(saved));
    });
  }, []);

  const currentCategories = type === 'expense' 
    ? [...DEFAULT_EXPENSE_CATEGORIES, ...customCategories.filter(c => c.type === 'expense')]
    : [...DEFAULT_INCOME_CATEGORIES, ...customCategories.filter(c => c.type === 'income')];

  const [selectedCategory, setSelectedCategory] = useState<CategoryItem>(currentCategories[0]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem>(PLATFORMS[0]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const exists = currentCategories.find(c => c.id === selectedCategory?.id);
    if (!exists && currentCategories.length > 0) {
      setSelectedCategory(currentCategories[0]);
    }
  }, [type, currentCategories]);

  // Reset form when opened
  useEffect(() => {
    if (visible) {
      setAmount('');
      setNote('');
      setDate(new Date());
      setType('expense');
      translateY.value = withTiming(-SCREEN_HEIGHT * 0.9, { duration: 300 });
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
      translateY.value = Math.min(0, Math.max(newValue, -SCREEN_HEIGHT * 0.9));
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        scrollTo(0);
        runOnJS(onClose)();
      } else {
        scrollTo(-SCREEN_HEIGHT * 0.9);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSave = () => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: selectedCategory?.label || 'Transaction',
      date: date.toISOString(),
      amount: numericAmount,
      type,
      icon: selectedCategory?.icon || 'star.fill',
      color: type === 'income' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-900',
      category: selectedCategory?.label,
      platform: type === 'expense' ? selectedPlatform?.label : undefined,
      status: 'Successful',
      paymentMethod: selectedWallet?.name,
      note: note,
      walletId: selectedWallet?.id
    };

    addTransaction(newTransaction);
    closeModal();
  };

  const displayedCategories = showAllCategories ? currentCategories : currentCategories.slice(0, 8);
  const cardBg = isDarkMode ? '#374151' : '#F3F4F6';

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal} />

        <Animated.View style={[styles.bottomSheet, animatedStyle]}>
          <GestureDetector gesture={gesture}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Transaction</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <IconSymbol name="xmark" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            bounces={true}
          >
                {/* Amount Input */}
                <View style={styles.amountSection}>
                  <Text style={styles.label}>Enter Amount</Text>
                  <View style={styles.amountRow}>
                    <Text style={styles.currencySymbol}>{symbol}</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={amount}
                      onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Type Toggle */}
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, type === 'expense' && { backgroundColor: '#EF4444' }]}
                    onPress={() => setType('expense')}
                  >
                    <IconSymbol name="arrow.up" size={18} color={type === 'expense' ? '#FFF' : '#6B7280'} />
                    <Text style={{ color: type === 'expense' ? '#FFF' : '#6B7280', fontWeight: '600', marginLeft: 6 }}>Expense</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, type === 'income' && { backgroundColor: '#10B981' }]}
                    onPress={() => setType('income')}
                  >
                    <IconSymbol name="arrow.down" size={18} color={type === 'income' ? '#FFF' : '#6B7280'} />
                    <Text style={{ color: type === 'income' ? '#FFF' : '#6B7280', fontWeight: '600', marginLeft: 6 }}>Income</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)}>
                      <Text style={{ color: type === 'expense' ? '#EF4444' : '#10B981', fontWeight: '600', fontSize: 13 }}>
                        {showAllCategories ? 'Show Less' : 'See All'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.grid}>
                    {displayedCategories.map(cat => (
                      <TouchableOpacity 
                        key={cat.id} 
                        style={styles.catItem}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <View style={[
                          styles.catIcon, 
                          selectedCategory?.id === cat.id 
                            ? { backgroundColor: type === 'expense' ? '#EF4444' : '#10B981' } 
                            : { backgroundColor: cardBg }
                        ]}>
                          <IconSymbol name={cat.icon as any || 'star.fill'} size={20} color={selectedCategory?.id === cat.id ? '#FFF' : '#6B7280'} />
                        </View>
                        <Text numberOfLines={1} style={[styles.catLabel, { color: selectedCategory?.id === cat.id ? '#111827' : '#6B7280' }]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Date & Note */}
                <View style={styles.detailsCard}>
                  <TouchableOpacity style={styles.detailRow} onPress={() => setShowDatePicker(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <IconSymbol name="calendar" size={20} color="#6B7280" />
                      <Text style={styles.detailLabel}>Date</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.detailRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <IconSymbol name="pencil" size={20} color="#6B7280" />
                      <Text style={styles.detailLabel}>Note</Text>
                    </View>
                    <TextInput
                      style={styles.noteInput}
                      value={note}
                      onChangeText={setNote}
                      placeholder="Add a note..."
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Date Picker */}
                {showDatePicker && (
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      textColor="#111827"
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity 
                        style={[styles.datePickerDone, { backgroundColor: type === 'expense' ? '#EF4444' : '#10B981' }]}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.datePickerDoneText}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Save Button - Inside ScrollView */}
                <View style={styles.footer}>
                  <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: type === 'expense' ? '#EF4444' : '#10B981' }]} 
                    onPress={handleSave}
                  >
                    <Text style={styles.saveBtnText}>Save Transaction</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

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
    height: SCREEN_HEIGHT * 0.9,
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
    fontFamily: fonts.display.bold,
    color: '#111827',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    padding: 8,
  },
  content: {
    paddingBottom: 80,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111827',
    minWidth: 100,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  catItem: {
    width: '22%',
    alignItems: 'center',
    gap: 6,
  },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  noteInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  datePickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  datePickerDone: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  datePickerDoneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
