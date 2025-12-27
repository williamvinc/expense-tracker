import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBudget } from '@/context/BudgetContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWallet } from '@/context/WalletContext';
import { useTransactions } from '@/context/TransactionContext';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomToggle } from '@/components/ui/CustomToggle';
import { fonts } from '@/constants/fonts';

export default function LimitsScreen() {
  const router = useRouter();
  const { isDarkMode, currentAccentColor } = useTheme();
  const { getLimitForWallet, setLimitForWallet, isLimitEnabledForWallet, toggleLimitForWallet, cycleStartDay, setCycleStartDay } = useBudget();
  const { symbol, currency: code, formatMoney } = useCurrency();
  const { selectedWallet } = useWallet();
  const { transactions } = useTransactions();

  const currentLimit = getLimitForWallet(selectedWallet.id);
  const currentEnabled = isLimitEnabledForWallet(selectedWallet.id);

  const [localEnabled, setLocalEnabled] = useState(currentEnabled);
  const [localLimit, setLocalLimit] = useState(currentLimit > 0 ? currentLimit.toString() : '');
  const [localCycleDay, setLocalCycleDay] = useState(cycleStartDay);

  useEffect(() => {
    setLocalEnabled(currentEnabled);
    setLocalLimit(currentLimit > 0 ? currentLimit.toString() : '');
    setLocalCycleDay(cycleStartDay);
  }, [selectedWallet.id]);

  // --- Date & Usage Calculation Logic (Synced with Dashboard) ---
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentCycleExpenses = useMemo(() => {
      const now = new Date();
      const currentDay = now.getDate();
      let start: Date, end: Date;

      // Calculate cycle based on localCycleDay (dynamic preview)
      if (currentDay >= localCycleDay) {
          start = new Date(now.getFullYear(), now.getMonth(), localCycleDay);
          end = new Date(now.getFullYear(), now.getMonth() + 1, localCycleDay);
          end.setDate(end.getDate() - 1);
      } else {
          start = new Date(now.getFullYear(), now.getMonth() - 1, localCycleDay);
          end = new Date(now.getFullYear(), now.getMonth(), localCycleDay);
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
  }, [transactions, localCycleDay, selectedWallet.id]);

  // Preview calculations
  const parsedLimit = parseFloat(localLimit) || 0;
  const usagePercent = localEnabled && parsedLimit > 0 ? (currentCycleExpenses / parsedLimit) * 100 : 0;
  const isOverBudget = usagePercent > 100;
  // ------------------------------------------------------------

  const handleSave = () => {
      const limitValue = parseFloat(localLimit);
      if (localEnabled && (isNaN(limitValue) || limitValue <= 0)) {
          Alert.alert('Invalid Limit', 'Please enter a valid amount greater than 0');
          return;
      }

      setLimitForWallet(selectedWallet.id, limitValue || 0);
      toggleLimitForWallet(selectedWallet.id, localEnabled);
      setCycleStartDay(localCycleDay);
      router.back();
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  const bgColor = isDarkMode ? '#000000' : '#F3F4F6';
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';

  const getDaySuffix = (d: number) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
      }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: cardBg }]}>
              <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Manage Limits</Text>
          <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
          {/* Wallet Info */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
             <View style={styles.walletHeader}>
                 <View style={[styles.walletIconSquare, { backgroundColor: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                     <IconSymbol name="creditcard.fill" size={22} color={isDarkMode ? '#111827' : '#FFFFFF'} />
                 </View>
                 <View style={{ flex: 1 }}>
                     <Text style={[styles.walletName, { color: textColor }]}>{selectedWallet.name}</Text>
                     <Text style={{ color: subTextColor, fontSize: 12 }}>ID: ...{selectedWallet.cardNumber || selectedWallet.id.slice(-4)}</Text>
                 </View>
             </View>
             <Text style={[styles.walletDescription, { color: subTextColor }]}>
                 Set spending limits to control your expenses for this wallet. Changes apply instantly.
             </Text>
          </View>

          {/* Feature Info Card */}
          <View style={[styles.infoCard, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }]}>
              <View style={styles.infoCardHeader}>
                  <IconSymbol name="star.fill" size={18} color="#3B82F6" />
                  <Text style={[styles.infoCardTitle, { color: textColor }]}>How Spending Limits Work</Text>
              </View>
              <Text style={[styles.infoCardText, { color: subTextColor }]}>
                  Set a spending limit to easily track your expenses against your budget. You'll see your progress on the home screen, helping you stay on top of your finances throughout each cycle.
              </Text>
              <View style={[styles.tipBox, { backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.15)' : '#FFFBEB' }]}>
                  <IconSymbol name="star.fill" size={14} color="#F59E0B" />
                  <Text style={[styles.tipText, { color: isDarkMode ? '#FCD34D' : '#92400E' }]}>
                      Pro tip: Set your cycle start date to match your payday for the most accurate tracking.
                  </Text>
              </View>
          </View>

          {/* Cycle Day Selector */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={styles.sectionHeader}>
                  <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}>
                      <IconSymbol name="calendar" size={20} color="#3B82F6" />
                  </View>
                  <View>
                      <Text style={[styles.sectionTitle, { color: textColor }]}>Budget Cycle</Text>
                      <Text style={{ color: subTextColor, fontSize: 12 }}>Reset day for your budget</Text>
                  </View>
              </View>

              <Text style={[styles.label, { color: subTextColor }]}>START DAY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <TouchableOpacity
                          key={day}
                          onPress={() => setLocalCycleDay(day)}
                          style={[
                              styles.dayBtn,
                              localCycleDay === day ? { backgroundColor: currentAccentColor } : { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }
                          ]}
                      >
                          <Text style={[
                              styles.dayText, 
                              { color: localCycleDay === day ? '#000' : subTextColor, fontWeight: localCycleDay === day ? 'bold' : 'normal' }
                          ]}>{day}</Text>
                      </TouchableOpacity>
                  ))}
              </ScrollView>
              
              <View style={[styles.infoBox, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                  <Text style={{ color: textColor, fontSize: 12, textAlign: 'center' }}>
                      Resets on the <Text style={{ fontWeight: 'bold'}}>{localCycleDay}{getDaySuffix(localCycleDay)}</Text> of every month.
                  </Text>
              </View>
          </View>

          {/* Limit Toggle & Input */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={[styles.row, { marginBottom: 16 }]}>
                  <View style={[styles.row, { gap: 12 }]}>
                      <View style={[styles.iconBox, { backgroundColor: localEnabled ? (isDarkMode ? 'rgba(236, 72, 153, 0.2)' : '#FCE7F3') : (isDarkMode ? '#374151' : '#F3F4F6') }]}>
                           <IconSymbol name="banknote" size={20} color={localEnabled ? '#EC4899' : '#9CA3AF'} />
                      </View>
                      <View>
                          <Text style={[styles.sectionTitle, { color: textColor }]}>Cycle Limit</Text>
                          <Text style={{ color: subTextColor, fontSize: 12 }}>Max spend per cycle</Text>
                      </View>
                  </View>
                  <CustomToggle 
                    value={localEnabled} 
                    onValueChange={setLocalEnabled}
                  />
              </View>

              {localEnabled && (
                  <>
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#000' : '#F9FAFB' }]}>
                        <Text style={[styles.currencyPrefix, { color: subTextColor }]}>{symbol}</Text>
                        <TextInput 
                            value={localLimit}
                            onChangeText={setLocalLimit}
                            placeholder="0"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            style={[styles.limitInput, { color: textColor }]}
                        />
                        <Text style={[styles.currencySuffix, { color: subTextColor }]}>{code}</Text>
                    </View>
                  </>
              )}
          </View>

      </ScrollView>

      <View style={styles.footer}>
          <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: currentAccentColor }]} 
              onPress={handleSave}
          >
              <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: fonts.display.bold,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
        gap: 20,
    },
    card: {
        borderRadius: 24,
        padding: 20,
    },
    walletHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    walletIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    walletIconSquare: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletDescription: {
        fontSize: 13,
        lineHeight: 20,
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1,
    },
    dayScroll: {
        gap: 8,
        paddingBottom: 4,
    },
    dayBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 14,
    },
    infoBox: {
        marginTop: 20,
        padding: 12,
        borderRadius: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 16,
        height: 56,
    },
    currencyPrefix: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    limitInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        height: '100%',
    },
    currencySuffix: {
        fontSize: 14,
        marginLeft: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    saveBtn: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    infoCard: {
        borderRadius: 20,
        padding: 20,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    infoCardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    infoCardText: {
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 16,
    },
    tipBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 14,
        borderRadius: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
    },
});
