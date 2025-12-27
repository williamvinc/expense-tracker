import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '@/context/TransactionContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWallet } from '@/context/WalletContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/constants/data';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction, deleteTransaction } = useTransactions();
  const { formatMoney, symbol } = useCurrency();
  const { wallets } = useWallet();
  const { isDarkMode, currentAccentColor } = useTheme();

  const transaction = useMemo(() => transactions.find(t => t.id === id), [transactions, id]);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    if (transaction) {
      setEditName(transaction.name);
      setEditAmount(String(transaction.amount));
      setEditNote(transaction.note || '');
      setEditDate(transaction.date.split('T')[0]);
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#F3F4F6' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={24} color={isDarkMode ? '#FFF' : '#111'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#111' }]}>Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = transaction.type === 'income';
  const wallet = wallets.find(w => w.id === transaction.walletId);
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';

  const allCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
  const categoryInfo = allCategories.find(c => c.label === transaction.category);

  const handleSave = () => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    updateTransaction(transaction.id, {
      name: editName,
      amount: parseFloat(editAmount),
      note: editNote,
      date: new Date(editDate).toISOString(),
    });
    setIsEditing(false);
  };

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
            router.back();
          }
        },
      ]
    );
  };

  const getIconColor = (colorClass?: string) => {
    if (!colorClass) return '#9CA3AF';
    if (colorClass.includes('red')) return '#EF4444';
    if (colorClass.includes('green')) return '#10B981';
    if (colorClass.includes('blue')) return '#3B82F6';
    if (colorClass.includes('yellow')) return '#F59E0B';
    if (colorClass.includes('purple')) return '#8B5CF6';
    if (colorClass.includes('pink')) return '#EC4899';
    if (colorClass.includes('indigo')) return '#6366F1';
    if (colorClass.includes('orange')) return '#F97316';
    return '#9CA3AF';
  };
  const iconColor = getIconColor(transaction.color);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#F3F4F6' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Transaction Details</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.backBtn}>
          <IconSymbol name={isEditing ? "xmark" : "pencil"} size={20} color={currentAccentColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {/* Icon & Amount */}
          <View style={styles.topSection}>
            <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
              <IconSymbol name={transaction.icon as any || 'star.fill'} size={32} color={iconColor} />
            </View>
            {isEditing ? (
              <View style={styles.amountEditRow}>
                <Text style={[styles.currencySymbol, { color: textColor }]}>{symbol}</Text>
                <TextInput
                  style={[styles.amountInput, { color: textColor, borderColor: currentAccentColor }]}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={subTextColor}
                />
              </View>
            ) : (
              <Text style={[styles.amount, { color: isIncome ? '#10B981' : textColor }]}>
                {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
              </Text>
            )}
            <View style={[styles.typeBadge, { backgroundColor: isIncome ? '#D1FAE5' : '#FEE2E2' }]}>
              <Text style={{ color: isIncome ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: '700' }}>
                {transaction.type.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <DetailRow 
              label="Name" 
              value={isEditing ? undefined : transaction.name}
              editValue={editName}
              onEditChange={setEditName}
              isEditing={isEditing}
              textColor={textColor}
              subTextColor={subTextColor}
              accentColor={currentAccentColor}
            />
            <DetailRow 
              label="Category" 
              value={transaction.category}
              textColor={textColor}
              subTextColor={subTextColor}
            />
            <DetailRow 
              label="Date" 
              value={isEditing ? undefined : new Date(transaction.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
              editValue={editDate}
              onEditChange={setEditDate}
              isEditing={isEditing}
              textColor={textColor}
              subTextColor={subTextColor}
              accentColor={currentAccentColor}
              isDate
            />
            {transaction.platform && (
              <DetailRow label="Platform" value={transaction.platform} textColor={textColor} subTextColor={subTextColor} />
            )}
            <DetailRow label="Wallet" value={wallet?.name || 'Unknown'} textColor={textColor} subTextColor={subTextColor} />
            <DetailRow label="Status" value={transaction.status || 'Successful'} textColor={textColor} subTextColor={subTextColor} />
            <DetailRow 
              label="Note" 
              value={isEditing ? undefined : (transaction.note || '-')}
              editValue={editNote}
              onEditChange={setEditNote}
              isEditing={isEditing}
              textColor={textColor}
              subTextColor={subTextColor}
              accentColor={currentAccentColor}
              multiline
            />
          </View>
        </View>

        {/* Actions */}
        {isEditing ? (
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: currentAccentColor }]} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <IconSymbol name="trash" size={18} color="#EF4444" />
            <Text style={styles.deleteBtnText}>Delete Transaction</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper component for detail rows
function DetailRow({ 
  label, value, editValue, onEditChange, isEditing, textColor, subTextColor, accentColor, multiline, isDate 
}: { 
  label: string; 
  value?: string; 
  editValue?: string; 
  onEditChange?: (t: string) => void;
  isEditing?: boolean; 
  textColor: string; 
  subTextColor: string;
  accentColor?: string;
  multiline?: boolean;
  isDate?: boolean;
}) {
  return (
    <View style={detailStyles.row}>
      <Text style={[detailStyles.label, { color: subTextColor }]}>{label}</Text>
      {isEditing && onEditChange ? (
        <TextInput
          style={[detailStyles.input, { color: textColor, borderColor: accentColor }]}
          value={editValue}
          onChangeText={onEditChange}
          placeholder={label}
          placeholderTextColor={subTextColor}
          multiline={multiline}
        />
      ) : (
        <Text style={[detailStyles.value, { color: textColor }]}>{value}</Text>
      )}
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156,163,175,0.2)',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  input: {
    flex: 1,
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  amountEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    borderBottomWidth: 2,
    minWidth: 120,
    textAlign: 'center',
    paddingVertical: 4,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailsSection: {
    marginTop: 8,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
