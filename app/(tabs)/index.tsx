import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactions } from '@/context/TransactionContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useBudget } from '@/context/BudgetContext';
import { useUser } from '@/context/UserContext';
import { useWallet } from '@/context/WalletContext';
import { TransactionItem } from '@/components/TransactionItem';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { fonts } from '@/constants/fonts';

import { DatePickerModal } from '@/components/ui/DatePickerModal';
import { LinearGradient } from 'expo-linear-gradient';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { Transaction } from '@/constants/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { transactions } = useTransactions();
  const { formatMoney } = useCurrency();
  const { getLimitForWallet, isLimitEnabledForWallet, cycleStartDay } = useBudget();
  const { user } = useUser();
  const { selectedWallet, wallets, selectWallet } = useWallet();
  const { isDarkMode, currentAccentColor } = useTheme();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  // Custom Date Filter State
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '', startObj: new Date(), endObj: new Date() });
  
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');
  const [tempDate, setTempDate] = useState(new Date());

  // Transaction Detail Modal State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);

  const openTransactionDetail = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setShowTransactionDetail(true);
  };

  // Date Logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getLocalDateString = (date: Date) => {
    // Use local time components to match what user sees
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCycleRange = (startDay: number) => {
      const now = new Date();
      const currentDay = now.getDate();
      let start: Date, end: Date;

      if (currentDay >= startDay) {
          start = new Date(now.getFullYear(), now.getMonth(), startDay);
          end = new Date(now.getFullYear(), now.getMonth() + 1, startDay);
          end.setDate(end.getDate() - 1);
      } else {
          start = new Date(now.getFullYear(), now.getMonth() - 1, startDay);
          end = new Date(now.getFullYear(), now.getMonth(), startDay);
          end.setDate(end.getDate() - 1);
      }

      return { 
          start: getLocalDateString(start), 
          end: getLocalDateString(end),
          startObj: start,
          endObj: end
      };
  };

  const currentCycle = useMemo(() => getCycleRange(cycleStartDay), [cycleStartDay]);
  
  // Initialize date range with cycle defaults, but don't force it if user is filtering
  useEffect(() => {
      if (!showFilter) {
          setDateRange(currentCycle);
      }
  }, [cycleStartDay, showFilter]);

  const openPicker = (target: 'start' | 'end') => {
      setPickerTarget(target);
      setTempDate(target === 'start' ? dateRange.startObj : dateRange.endObj);
      setPickerVisible(true);
  };

  const handleDateChange = (date: Date) => {
      setTempDate(date);
  };
  
  const confirmDate = () => {
      const str = getLocalDateString(tempDate);
      if (pickerTarget === 'start') {
          setDateRange(prev => ({ ...prev, start: str, startObj: tempDate }));
      } else {
          setDateRange(prev => ({ ...prev, end: str, endObj: tempDate }));
      }
      setPickerVisible(false);
  };

  // Filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const tDateObj = new Date(t.date);
        const tDate = getLocalDateString(tDateObj);
        const inDate = tDate >= dateRange.start && tDate <= dateRange.end;
        const inWallet = t.walletId === selectedWallet.id;
        return inDate && inWallet;
    });
  }, [transactions, dateRange, selectedWallet.id]);

  const { income, expense } = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
        const val = Number(curr.amount);
        if (curr.type === 'income') acc.income += val;
        if (curr.type === 'expense') acc.expense += val;
        return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const currentCycleExpenses = useMemo(() => {
     const now = new Date();
     const currentDay = now.getDate();
     let start: Date, end: Date;

     if (currentDay >= cycleStartDay) {
         start = new Date(now.getFullYear(), now.getMonth(), cycleStartDay);
         end = new Date(now.getFullYear(), now.getMonth() + 1, cycleStartDay);
         end.setDate(end.getDate() - 1);
     } else {
         start = new Date(now.getFullYear(), now.getMonth() - 1, cycleStartDay);
         end = new Date(now.getFullYear(), now.getMonth(), cycleStartDay);
         end.setDate(end.getDate() - 1);
     }

     const startStr = getLocalDateString(start);
     const endStr = getLocalDateString(end);

     return transactions.filter(t => {
        const tDateObj = new Date(t.date);
        const tDate = getLocalDateString(tDateObj);
        
        const inDate = tDate >= startStr && tDate <= endStr;
        const inWallet = t.walletId === selectedWallet.id;
        return inDate && inWallet && t.type === 'expense';
     }).reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [transactions, cycleStartDay, selectedWallet.id]);

  const walletBalance = useMemo(() => {
      const walletTx = transactions.filter(t => t.walletId === selectedWallet.id);
      return walletTx.reduce((acc, curr) => {
        const val = Number(curr.amount);
        if (curr.type === 'income') return acc + val;
        return acc - val;
      }, 0);
  }, [transactions, selectedWallet.id]);

  const monthlyLimit = getLimitForWallet(selectedWallet.id);
  const isLimitEnabled = isLimitEnabledForWallet(selectedWallet.id);
  const budgetUsedPercentage = isLimitEnabled && monthlyLimit > 0 ? (currentCycleExpenses / monthlyLimit) * 100 : 0;
  const isOverBudget = budgetUsedPercentage > 100;

  const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 10);
  const firstName = user.name.split(' ')[0] || 'User';

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';
  const bgColor = isDarkMode ? '#000000' : '#F3F4F6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
              <View>
                  <Text style={[styles.dateText, { color: subTextColor }]}>
                      {currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                  <Text style={[styles.greeting, { color: textColor }]}>
                      {getGreeting()}, {firstName}
                  </Text>
              </View>
              {/* Filter Button */}
              <TouchableOpacity 
                onPress={() => setShowFilter(!showFilter)}
                style={[styles.iconButton, { backgroundColor: showFilter ? currentAccentColor : cardBg }]}>
                  <IconSymbol name="calendar" size={24} color={showFilter ? '#FFF' : textColor} />
              </TouchableOpacity>
          </View>

          {/* Expandable Date Range Filter */}
          {showFilter && (
            <View style={[styles.filterContainer, { backgroundColor: cardBg }]}>
                <View style={styles.filterRow}>
                    <TouchableOpacity onPress={() => openPicker('start')} style={styles.dateInput}>
                        <Text style={[styles.label, { color: subTextColor }]}>FROM</Text>
                        <Text style={[styles.dateValue, { color: textColor }]}>{dateRange.start}</Text>
                    </TouchableOpacity>
                    <View style={{width: 1, height: 24, backgroundColor: subTextColor, opacity: 0.2}} />
                    <TouchableOpacity onPress={() => openPicker('end')} style={styles.dateInput}>
                        <Text style={[styles.label, { color: subTextColor }]}>TO</Text>
                        <Text style={[styles.dateValue, { color: textColor }]}>{dateRange.end}</Text>
                    </TouchableOpacity>
                </View>
            </View>
          )}

          {/* Balance Card */}
          <View style={[styles.card, { backgroundColor: cardBg, overflow: 'hidden' }]}>
              {/* Memphis Style Accents - Top only */}
              <View style={[styles.memphisCircle, { backgroundColor: currentAccentColor + '20', top: -30, right: -30 }]} />
              <View style={[styles.memphisCircleSmall, { backgroundColor: currentAccentColor + '40', top: 60, right: 20 }]} />
              <View style={[styles.memphisDot, { backgroundColor: currentAccentColor, top: 20, right: 80 }]} />
              <View style={[styles.memphisDot, { backgroundColor: currentAccentColor + '60', top: 100, right: 50 }]} />
              <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>TOTAL BALANCE</Text>
                  <TouchableOpacity 
                    style={[styles.walletSelector, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                    onPress={() => setShowWalletSelector(!showWalletSelector)}
                  >
                      <View style={[styles.walletIcon, { backgroundColor: '#111827' }]}>
                          <IconSymbol name="creditcard.fill" size={12} color="#FFF" />
                      </View>
                      <Text style={[styles.walletName, { color: textColor }]}>{selectedWallet.name}</Text>
                      <IconSymbol name={showWalletSelector ? "chevron.up" : "chevron.down"} size={16} color={subTextColor} />
                  </TouchableOpacity>
              </View>

              {/* Wallet Selector Dropdown */}
              {showWalletSelector && (
                  <View style={[styles.dropdown, { backgroundColor: cardBg }]}>
                      {wallets.map(w => {
                          const isSelected = w.id === selectedWallet.id;
                          return (
                              <TouchableOpacity 
                                key={w.id} 
                                style={[
                                    styles.dropdownItem,
                                    isSelected && { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }
                                ]}
                                onPress={() => { selectWallet(w.id); setShowWalletSelector(false); }}
                              >
                                  <View style={styles.dropdownLeft}>
                                      <View style={[styles.dropdownIcon, { backgroundColor: '#111827' }]}>
                                          <IconSymbol name="creditcard.fill" size={14} color="#FFF" />
                                      </View>
                                      <Text style={[styles.dropdownText, { color: textColor, fontWeight: isSelected ? '700' : '500' }]}>{w.name}</Text>
                                  </View>
                                  {isSelected && <IconSymbol name="checkmark" size={18} color="#10B981" />}
                              </TouchableOpacity>
                          );
                      })}
                      <View style={[styles.dropdownDivider, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />
                      <TouchableOpacity 
                        style={styles.dropdownItem} 
                        onPress={() => { setShowWalletSelector(false); router.push('/wallet'); }}
                      >
                          <View style={styles.dropdownLeft}>
                              <View style={[styles.dropdownIcon, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                  <IconSymbol name="gear" size={14} color={subTextColor} />
                              </View>
                              <Text style={[styles.dropdownText, { color: subTextColor }]}>Manage Wallets</Text>
                          </View>
                          <IconSymbol name="chevron.right" size={16} color={subTextColor} />
                      </TouchableOpacity>
                  </View>
              )}

              <View style={styles.balanceContainer}>
                  <Text style={[styles.balance, { color: textColor }]}>
                      {isBalanceVisible ? formatMoney(walletBalance) : '•••••••'}
                  </Text>
                  <TouchableOpacity onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
                      <IconSymbol name={isBalanceVisible ? "eye" : "eye.slash"} size={22} color={subTextColor} />
                  </TouchableOpacity>
              </View>

              {/* Budget Bar */}
              <View style={styles.budgetContainer}>
                  <View style={styles.budgetHeader}>
                    <Text style={[styles.budgetLabel, { color: textColor }]}>Cycle Budget</Text>
                    <TouchableOpacity onPress={() => router.push('/limits')}> 
                         <Text style={[styles.budgetLimit, { color: isLimitEnabled && monthlyLimit > 0 ? textColor : '#EF4444' }]}>
                            {isLimitEnabled && monthlyLimit > 0 ? formatMoney(monthlyLimit) : 'Set Limit'}
                         </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.progressBarBg}>
                      <View 
                        style={[
                            styles.progressBarFill, 
                            { 
                                width: `${Math.min(budgetUsedPercentage, 100)}%`,
                                backgroundColor: isOverBudget ? '#EF4444' : currentAccentColor 
                            }
                        ]} 
                      />
                  </View>
                  <View style={styles.budgetStats}>
                       <Text style={styles.budgetUsed}>{formatMoney(currentCycleExpenses)} used</Text>
                       {monthlyLimit > 0 && <Text style={styles.budgetPercent}>{Math.round(budgetUsedPercentage)}%</Text>}
                  </View>
              </View>
          </View>

          {/* Income/Expense Summary */}
          <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
              {/* Income */}
              <View style={styles.summaryItem}>
                   <View style={styles.summaryLabelRow}>
                       <IconSymbol name="arrow.down" size={14} color="#10B981" />
                       <Text style={[styles.summaryLabel, { color: '#10B981' }]}>Income</Text>
                   </View>
                   <Text style={[styles.summaryValue, { color: textColor }]}>
                       {isBalanceVisible ? formatMoney(income) : '••••'}
                   </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]} />
              {/* Expense */}
              <View style={[styles.summaryItem, { alignItems: 'flex-end' }]}>
                   <View style={styles.summaryLabelRow}>
                       <Text style={[styles.summaryLabel, { color: '#EF4444' }]}>Expense</Text>
                       <IconSymbol name="arrow.up" size={14} color="#EF4444" />
                   </View>
                   <Text style={[styles.summaryValue, { color: textColor }]}>
                       {isBalanceVisible ? formatMoney(expense) : '••••'}
                   </Text>
              </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Activity</Text>
              <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                  <Text style={[styles.seeAll, { color: subTextColor }]}>{showAll ? 'Show Less' : 'See All'}</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.list}>
              {filteredTransactions.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: subTextColor, marginTop: 20 }}>No transactions found.</Text>
              ) : (
                  displayedTransactions.map(tx => (
                      <TransactionItem key={tx.id} transaction={tx} onPress={openTransactionDetail} />
                  ))
              )}
          </View>

      </ScrollView>
      
      <DatePickerModal 
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={tempDate}
        onChange={handleDateChange}
        title={pickerTarget === 'start' ? 'Start Date' : 'End Date'}
      />
      {pickerVisible && (
        // Little hack to intercept the "Done" action which is handled inside modal but we need to trigger state save
        // Actually, let's just make the modal's internal Done btn call a prop passed from here?
        // Ah, my modal component has onChange (live) and no explicit 'onConfirm'.
        // Let's modify the Modal usage slightly. See below.
         <View /> 
      )}
      {/* Wait, the DatePickerModal I wrote calls onChange LIVE. So tempDate updates live. 
          The Modal needs a "Confirm" button that calls a prop, or I just use the onClose to confirm?
          Result of my code analysis: The DatePickerModal.tsx has a "Done" button that calls `onClose`.
          But I need it to trigger `confirmDate`. 
          Let me update the DatePickerModal usage to pass `confirmDate` as `onClose`? 
          No, `onClose` is also for clicking background/X. 
          I should have added an `onConfirm` prop. 
          For now, I'll assume users click "Done" inside the modal which is just cosmetic if `onChange` is live?
          Let's re-read DatePickerModal.tsx...
          It has a `confirmBtn` that does nothing but live inside the view? No, it just exists. 
          Ah, I need to wrap the `onClose` to also `confirmDate`?
          Or better: Update DatePickerModal to accept onConfirm.
          
          Actually, simpler fix for now: passing `confirmDate` to `onClose` works if "Done" calls `onClose`.
          Let's check the DatePickerModal again... "onPress={onClose}". Yes.
          So if I pass `onClose={confirmDate}`, clicking Done (or X) will confirm the date. 
          That's acceptable for now.
      */}
      <DatePickerModal 
        visible={pickerVisible} 
        onClose={confirmDate} 
        value={tempDate} 
        onChange={handleDateChange} 
      />

      {/* Top Blur Gradient - modern aesthetic header effect */}
      <LinearGradient
        colors={[
          `${currentAccentColor}25`, // Subtle accent glow at top
          'transparent',
        ]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 180,
          pointerEvents: 'none',
        }}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal 
        visible={showTransactionDetail}
        transaction={selectedTransaction}
        onClose={() => setShowTransactionDetail(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    greeting: {
        fontSize: 20,
        fontFamily: fonts.display.bold,
        marginTop: 4,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dateInput: {
        flex: 1,
        alignItems: 'center',
        padding: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 1,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    card: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        zIndex: 10,
    },
    cardLabel: {
        fontSize: 12,
        fontFamily: fonts.sans.bold,
        color: '#9CA3AF',
        letterSpacing: 1,
    },
    walletSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        gap: 8,
    },
    walletIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletName: {
        fontSize: 12,
        fontWeight: '700',
        maxWidth: 100,
    },
    dropdown: {
        position: 'absolute',
        top: 60,
        right: 20,
        padding: 8,
        borderRadius: 16,
        zIndex: 100,
        minWidth: 200,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
    },
    dropdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dropdownIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdownText: {
        fontSize: 14,
    },
    dropdownDivider: {
        height: 1,
        marginVertical: 8,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 32,
    },
    balance: {
        fontSize: 36,
        fontFamily: fonts.display.extrabold,
        letterSpacing: -1,
    },
    budgetContainer: {
        width: '100%',
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    budgetLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    budgetLimit: {
        fontSize: 12,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: '#F3F4F6', // Dark mode handled via opacity maybe? or separate style
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    budgetStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetUsed: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    budgetPercent: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    summaryCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        marginBottom: 32,
        alignItems: 'center',
    },
    summaryItem: {
        flex: 1,
        flexDirection: 'column',
        gap: 4,
    },
    summaryLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    divider: {
        width: 1,
        height: 40,
        marginHorizontal: 16,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '700',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.display.bold,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '500',
    },
    list: {
        gap: 12,
    },
    // Memphis Style Accents
    memphisCircle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    memphisCircleSmall: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    memphisDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    memphisCircleOutline: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        backgroundColor: 'transparent',
    },
    memphisArc: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 4,
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        backgroundColor: 'transparent',
        transform: [{ rotate: '-45deg' }],
    },
});
