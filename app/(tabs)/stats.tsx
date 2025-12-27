import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '@/context/TransactionContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWallet } from '@/context/WalletContext';
import { useBudget } from '@/context/BudgetContext';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BarChart, PieChart } from 'react-native-gifted-charts';

type StatsView = 'expense' | 'income';

export default function StatsScreen() {
  const { transactions } = useTransactions();
  const { formatMoney } = useCurrency();
  const { selectedWallet } = useWallet();
  const { cycleStartDay } = useBudget();
  const { isDarkMode, currentAccentColor } = useTheme();

  const [view, setView] = useState<StatsView>('expense');
  const [showFilter, setShowFilter] = useState(false);

  // --- Date Range Logic ---
  const getLocalDateString = (date: Date) => date.toISOString().split('T')[0];

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
          end: getLocalDateString(end)
      };
  };

  const [dateRange, setDateRange] = useState(getCycleRange(cycleStartDay));

  useEffect(() => {
      setDateRange(getCycleRange(cycleStartDay));
  }, [cycleStartDay]);

  // --- Data Preparation ---
  const filteredData = useMemo(() => {
      return transactions.filter(t => {
          const tDate = t.date.split('T')[0];
          const inDate = tDate >= dateRange.start && tDate <= dateRange.end;
          const inWallet = t.walletId === selectedWallet.id;
          const isType = t.type === view;
          return inDate && inWallet && isType;
      });
  }, [transactions, selectedWallet.id, view, dateRange]);

  const totalValue = useMemo(() => {
      return filteredData.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [filteredData]);

  // Group for Pie Chart
  const categoryData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(t => {
      const cat = t.category || (view === 'income' ? 'Source' : 'Other');
      groups[cat] = (groups[cat] || 0) + Number(t.amount);
    });
    
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4);
    const otherVal = sorted.slice(4).reduce((acc, curr) => acc + curr[1], 0);
    
    if (otherVal > 0) top.push(['Others', otherVal]);
    
    const colors = view === 'expense' 
        ? ['#F43F5E', '#FB923C', '#FBBF24', '#EC4899', '#818CF8'] 
        : ['#22C55E', '#34D399', '#2DD4BF', '#06B6D4', '#3B82F6'];

    return top.map(([name, value], index) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: colors[index % colors.length],
      text: `${Math.round(totalValue > 0 ? (value / totalValue) * 100 : 0)}%`
    }));
  }, [filteredData, totalValue, view]);

  // Group for List
  const platformData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(t => {
      const p = t.platform || t.paymentMethod || (view === 'income' ? 'Direct' : 'Etc');
      groups[p] = (groups[p] || 0) + Number(t.amount);
    });

    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    return sorted.map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }));
  }, [filteredData, totalValue, view]);

  // Weekly Bar Data
  const weeklyData = useMemo(() => {
    const data = [];
    const endDate = new Date(dateRange.end);
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(endDate.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = getLocalDateString(d);
        
        const dayTotal = filteredData
            .filter(t => t.date.split('T')[0] === dateStr)
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
        
        data.push({ 
            label: dayStr, 
            value: dayTotal,
            frontColor: view === 'income' ? '#22C55E' : '#F43F5E'
        });
    }
    return data;
  }, [filteredData, dateRange.end, view]);

  const averageDaily = weeklyData.reduce((acc, curr) => acc + curr.value, 0) / 7;
  
  const getEntityIcon = (name: string) => {
      const lower = name.toLowerCase();
      if (lower.includes('tokopedia')) return { type: 'img', src: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Logo-Tokopedia.png' };
      if (lower.includes('shopee')) return { type: 'img', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/320px-Shopee.svg.png' };
      if (lower.includes('blibli')) return { type: 'img', src: 'https://toppng.com/uploads/preview/logo-blibli-11550708547os1lsnmgan.png' };
      
      if (lower.includes('salary') || lower.includes('work')) return { type: 'icon', icon: 'work' };
      if (lower.includes('bonus')) return { type: 'icon', icon: 'card_giftcard' }; // redeem -> card_giftcard
      if (lower.includes('freelance')) return { type: 'icon', icon: 'person.fill' }; // laptop_mac -> person
      if (lower.includes('gift')) return { type: 'icon', icon: 'card_giftcard' };
      if (lower.includes('crypto')) return { type: 'icon', icon: 'currency_bitcoin' };
      
      if (view === 'income') return { type: 'icon', icon: 'arrow.down' };
      return { type: 'icon', icon: 'creditcard.fill' }; // shopping_bag -> creditcard.fill
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const bgColor = isDarkMode ? '#000000' : '#F3F4F6';
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
            <View>
                <Text style={[styles.title, { color: textColor }]}>Financial Report</Text>
                <Text style={styles.subtitle}>{selectedWallet.name}</Text>
            </View>
            <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: cardBg }]}
                onPress={() => setShowFilter(!showFilter)}
            >
                <IconSymbol name="calendar" size={24} color={textColor} />
            </TouchableOpacity>
        </View>

        {/* View Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
            <TouchableOpacity 
                style={[styles.toggleBtn, view === 'expense' && { backgroundColor: cardBg }]}
                onPress={() => setView('expense')}
            >
                <IconSymbol name="arrow.up" size={18} color={view === 'expense' ? textColor : '#6B7280'} />
                <Text style={[styles.toggleText, { color: view === 'expense' ? textColor : '#6B7280'}]}>Expenses</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.toggleBtn, view === 'income' && { backgroundColor: cardBg }]}
                onPress={() => setView('income')}
            >
                <IconSymbol name="arrow.down" size={18} color={view === 'income' ? textColor : '#6B7280'} />
                <Text style={[styles.toggleText, { color: view === 'income' ? textColor : '#6B7280'}]}>Income</Text>
            </TouchableOpacity>
        </View>

        {/* Total Value */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
             <View>
                 <Text style={styles.cardLabel}>{view === 'expense' ? 'Total Spent' : 'Total Income'}</Text>
                 <Text style={[styles.totalValue, { color: view === 'income' ? '#22C55E' : textColor }]}>{formatMoney(totalValue)}</Text>
             </View>
             <View style={[styles.trendIcon, { backgroundColor: view === 'income' ? '#DCFCE7' : '#FEE2E2' }]}>
                 <IconSymbol 
                    name={view === 'income' ? 'arrow.up' : 'arrow.down'} 
                    size={24} 
                    color={view === 'income' ? '#16A34A' : '#EF4444'} 
                 />
             </View>
        </View>

        {/* Bar Chart */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
             <View style={styles.chartHeader}>
                 <View>
                    <Text style={[styles.chartTitle, { color: textColor }]}>Trend</Text>
                    <Text style={styles.chartSubtitle}>Last 7 days of period</Text>
                 </View>
                 <View>
                     <Text style={styles.cardLabel}>Daily Avg.</Text>
                     <Text style={[styles.avgValue, { color: textColor }]}>{formatMoney(averageDaily)}</Text>
                 </View>
             </View>
             <View style={{ overflow: 'hidden' }}>
                <BarChart
                    data={weeklyData}
                    barWidth={22}
                    noOfSections={3}
                    barBorderRadius={4}
                    frontColor={view === 'income' ? '#22C55E' : '#F43F5E'}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    yAxisTextStyle={{ color: '#9CA3AF' }}
                    xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
                    hideRules
                    height={150}
                    width={300} // Approximate width fitting
                />
             </View>
        </View>

        {/* Pie Chart */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
             <Text style={[styles.chartTitle, { color: textColor, marginBottom: 24 }]}>
                 {view === 'income' ? 'Revenue Sources' : 'Top Categories'}
             </Text>
             
             <View style={styles.pieContainer}>
                 <PieChart
                    data={categoryData}
                    donut
                    showText
                    textColor="white" // Text inside slices if applicable or custom
                    radius={100}
                    innerRadius={60}
                    textSize={12}
                    focusOnPress
                    labelsPosition='outward'
                 />
                 <View style={styles.pieCenter}>
                     <Text style={styles.pieCenterLabel}>Total</Text>
                     <Text style={[styles.pieCenterValue, { color: textColor }]}>{formatMoney(totalValue)}</Text>
                 </View>
             </View>

             <View style={styles.legend}>
                 {categoryData.map((cat, i) => (
                     <View key={i} style={styles.legendItem}>
                         <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                         <Text style={[styles.legendText, { color: textColor }]}>{cat.name}</Text>
                         <Text style={[styles.legendPerc, { color: textColor }]}>{Math.round(cat.percentage)}%</Text>
                     </View>
                 ))}
             </View>
        </View>

        {/* Distribution List */}
        <View style={[styles.card, { backgroundColor: cardBg, marginBottom: 40 }]}>
             <Text style={[styles.chartTitle, { color: textColor, marginBottom: 24 }]}>
                 {view === 'income' ? 'Income Channels' : 'Spending by Platform'}
             </Text>
             
             {platformData.map((item, i) => {
                 const iconData = getEntityIcon(item.name);
                 return (
                     <View key={i} style={styles.distItem}>
                         <View style={styles.distHeader}>
                             <View style={styles.distLeft}>
                                 <View style={[styles.distIcon, { backgroundColor: isDarkMode ? '#374151' : '#F9FAFB' }]}>
                                     {iconData.type === 'img' ? (
                                         <Image source={{ uri: iconData.src }} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
                                     ) : (
                                         <IconSymbol name={iconData.icon as any} size={20} color={textColor} />
                                     )}
                                 </View>
                                 <View>
                                     <Text style={[styles.distName, { color: textColor }]}>{item.name}</Text>
                                     <Text style={styles.distSub}>{Math.round(item.percentage)}% of total</Text>
                                 </View>
                             </View>
                             <Text style={[styles.distValue, { color: view === 'income' ? '#22C55E' : textColor }]}>
                                 {view === 'income' ? '+' : ''}{formatMoney(item.value)}
                             </Text>
                         </View>
                         <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                             <View 
                                style={[
                                    styles.progressBarFill, 
                                    { 
                                        width: `${item.percentage}%`,
                                        backgroundColor: view === 'income' ? '#22C55E' : '#F43F5E'
                                    }
                                ]} 
                             />
                         </View>
                     </View>
                 );
             })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
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
    subtitle: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        padding: 6,
        borderRadius: 16,
        marginBottom: 24,
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
        fontSize: 14,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    cardLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    trendIcon: {
        position: 'absolute',
        right: 24,
        top: 24,
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    chartSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    avgValue: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    pieContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    pieCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieCenterLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    pieCenterValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    legend: {
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    legendText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    legendPerc: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    distItem: {
        marginBottom: 16,
    },
    distHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    distLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    distIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    distName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    distSub: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    distValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});
