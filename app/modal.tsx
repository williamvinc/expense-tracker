import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTransactions } from '@/context/TransactionContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWallet } from '@/context/WalletContext';
import { Transaction } from '@/constants/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { CategoryItem, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, PLATFORMS, PlatformItem, CUSTOM_CATEGORY_ICONS } from '@/constants/data';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ModalScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { symbol, currency } = useCurrency();
  const { selectedWallet } = useWallet();
  const { isDarkMode, currentAccentColor } = useTheme();
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Categories Logic
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
  
  // UI States
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // New Category Form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState(CUSTOM_CATEGORY_ICONS[0]);

  // Reset category on type change if needed
  useEffect(() => {
      const exists = currentCategories.find(c => c.id === selectedCategory.id);
      if (!exists) {
          setSelectedCategory(currentCategories[0]);
      }
  }, [type]);

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const bgColor = isDarkMode ? '#000000' : '#FFFFFF';
  const cardBg = isDarkMode ? '#1F2937' : '#F3F4F6';

  const formatAmount = (value: string) => {
    // Simple basic formatting for mobile input
    return value.replace(/[^0-9.]/g, ''); 
  };

  const handleAmountChange = (text: string) => {
      setAmount(formatAmount(text));
  };

  const parseAmount = (value: string) => parseFloat(value) || 0;

  const handleSave = () => {
      const numericAmount = parseAmount(amount);
      if (numericAmount <= 0) return;

      const newTransaction: Transaction = {
          id: Date.now().toString(),
          name: selectedCategory.label, 
          date: new Date(date).toISOString(), 
          amount: numericAmount,
          type,
          icon: selectedCategory.icon,
          color: type === 'income' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-900', // Web compatibility
          category: selectedCategory.label,
          platform: type === 'expense' ? selectedPlatform.label : undefined,
          status: 'Successful',
          paymentMethod: selectedWallet.name,
          note: note,
          walletId: selectedWallet.id
      };

      addTransaction(newTransaction);
      router.back();
  };

  const handleCreateCategory = async () => {
      if (!newCategoryName.trim()) return;
      const newCat: CategoryItem = {
          id: `custom_${Date.now()}`,
          label: newCategoryName,
          icon: newCategoryIcon,
          type: type
      };
      
      const updated = [...customCategories, newCat];
      setCustomCategories(updated);
      await AsyncStorage.setItem('wallet_custom_categories', JSON.stringify(updated));
      
      setSelectedCategory(newCat);
      setIsCreatingCategory(false);
      setNewCategoryName('');
  };

  const displayedCategories = showAllCategories ? currentCategories : currentCategories.slice(0, 8);

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={[styles.container, { backgroundColor: bgColor }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>New Transaction</Text>
            <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: cardBg }]}>
                <IconSymbol name="xmark" size={24} color={textColor} />
            </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
            <Text style={styles.label}>Enter Amount</Text>
            <View style={styles.inputRow}>
                <Text style={[styles.currencySymbol, { color: textColor }]}>{symbol}</Text>
                <TextInput 
                    value={amount}
                    onChangeText={handleAmountChange}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.amountInput, { color: textColor }]}
                    autoFocus
                />
            </View>
        </View>

        {/* Type Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: cardBg }]}>
            <TouchableOpacity 
                style={[styles.toggleBtn, type === 'expense' && { backgroundColor: currentAccentColor }]}
                onPress={() => setType('expense')}
            >
                <IconSymbol name="arrow.up" size={18} color={type === 'expense' ? '#000' : '#6B7280'} />
                <Text style={[styles.toggleText, { color: type === 'expense' ? '#000' : '#6B7280'}]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.toggleBtn, type === 'income' && { backgroundColor: currentAccentColor }]}
                onPress={() => setType('income')}
            >
                <IconSymbol name="arrow.down" size={18} color={type === 'income' ? '#000' : '#6B7280'} />
                <Text style={[styles.toggleText, { color: type === 'income' ? '#000' : '#6B7280'}]}>Income</Text>
            </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: textColor }]}>Category</Text>
                <View style={styles.row}>
                     <TouchableOpacity onPress={() => setIsCreatingCategory(true)}>
                         <Text style={{ color: currentAccentColor, fontWeight: 'bold', fontSize: 13, marginRight: 16 }}>+ New</Text>
                     </TouchableOpacity>
                     <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)}>
                         <Text style={{ color: '#D97706', fontWeight: 'bold', fontSize: 13 }}>{showAllCategories ? 'Show Less' : 'See All'}</Text>
                     </TouchableOpacity>
                </View>
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
                             selectedCategory.id === cat.id 
                                ? { backgroundColor: currentAccentColor } 
                                : { backgroundColor: cardBg }
                         ]}>
                             <IconSymbol name={cat.icon as any || 'star'} size={24} color={selectedCategory.id === cat.id ? '#000' : '#6B7280'} />
                         </View>
                         <Text numberOfLines={1} style={[styles.catLabel, { color: selectedCategory.id === cat.id ? textColor : '#6B7280', fontWeight: selectedCategory.id === cat.id ? '700' : '400' }]}>
                             {cat.label}
                         </Text>
                     </TouchableOpacity>
                 ))}
            </View>
        </View>

        {/* Date & Note */}
        <View style={styles.section}>
             <Text style={[styles.label, { color: textColor }]}>Details</Text>
             <View style={[styles.inputGroup, { backgroundColor: cardBg }]}>
                 <View style={styles.inputItem}>
                     <IconSymbol name="calendar" size={20} color="#9CA3AF" />
                     {/* For simplicity using text input for date in YYYY-MM-DD. Ideally use DateTimePicker */}
                     <TextInput 
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.detailInput, { color: textColor }]}
                     />
                 </View>
                 <View style={[styles.divider, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />
                 <View style={styles.inputItem}>
                     <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
                     <TextInput 
                        value={note}
                        onChangeText={setNote}
                        placeholder="Add a note"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.detailInput, { color: textColor }]}
                     />
                 </View>
             </View>
        </View>

        <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: currentAccentColor }]}
            onPress={handleSave}
        >
            <Text style={styles.saveBtnText}>Save Transaction</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Create Category Modal Overlay */}
      <Modal visible={isCreatingCategory} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
                   <View style={styles.modalHeader}>
                       <Text style={[styles.title, { color: textColor }]}>New Category</Text>
                       <TouchableOpacity onPress={() => setIsCreatingCategory(false)} style={[styles.closeBtn, { backgroundColor: cardBg }]}>
                            <IconSymbol name="xmark" size={24} color={textColor} />
                       </TouchableOpacity>
                   </View>
                   <TextInput 
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        placeholder="Category Name"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.modalInput, { color: textColor, backgroundColor: cardBg }]}
                        autoFocus
                   />
                   <Text style={[styles.label, { marginTop: 24, marginBottom: 12 }]}>Choose Icon</Text>
                   <View style={styles.iconGrid}>
                       {CUSTOM_CATEGORY_ICONS.map(icon => (
                           <TouchableOpacity 
                                key={icon}
                                onPress={() => setNewCategoryIcon(icon)}
                                style={[
                                    styles.iconOption, 
                                    { backgroundColor: newCategoryIcon === icon ? currentAccentColor : cardBg }
                                ]}
                           >
                                <IconSymbol name={icon as any} size={24} color={newCategoryIcon === icon ? '#000' : '#6B7280'} />
                           </TouchableOpacity>
                       ))}
                   </View>
                   <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: currentAccentColor, marginTop: 24 }]}
                        onPress={handleCreateCategory}
                   >
                        <Text style={styles.saveBtnText}>Create Category</Text>
                   </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 80,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    amountContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
        fontWeight: '600',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '600',
        marginRight: 8,
    },
    amountInput: {
        fontSize: 48,
        fontWeight: 'bold',
        minWidth: 100,
        textAlign: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        padding: 6,
        borderRadius: 16,
        marginBottom: 32,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    toggleText: {
        fontWeight: '700',
        fontSize: 16,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'flex-start',
    },
    catItem: {
        width: '21%', // approx 4 cols
        alignItems: 'center',
        gap: 8,
    },
    catIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    catLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    inputGroup: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    inputItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    divider: {
        height: 1,
        marginLeft: 48,
    },
    detailInput: {
        fontSize: 16,
        flex: 1,
    },
    saveBtn: {
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 80,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    modalInput: {
        fontSize: 20,
        padding: 20,
        borderRadius: 16,
        fontWeight: '600',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
