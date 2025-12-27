import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Transaction } from '@/constants/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';

interface TransactionItemProps {
    transaction: Transaction;
    onPress?: (transaction: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
    const router = useRouter();
    const { formatMoney } = useCurrency();
    const { isDarkMode, currentAccentColor } = useTheme();

    const isIncome = transaction.type === 'income';

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

    const handlePress = () => {
        if (onPress) {
            onPress(transaction);
        } else {
            router.push(`/transaction/${transaction.id}`);
        }
    };

    // Format date: show "Today" if same day, otherwise "Dec 22 2025"
    const formatDate = (dateStr: string) => {
        const txDate = new Date(dateStr);
        const today = new Date();
        
        const isSameDay = 
            txDate.getDate() === today.getDate() &&
            txDate.getMonth() === today.getMonth() &&
            txDate.getFullYear() === today.getFullYear();
        
        if (isSameDay) {
            return 'Today';
        }
        
        return txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Icon styling based on transaction type
    const iconBg = isIncome ? currentAccentColor + '20' : (isDarkMode ? '#374151' : '#E5E7EB');
    const iconTint = isIncome ? '#F97316' : (isDarkMode ? '#FFFFFF' : '#111827');

    const categoryDisplay = transaction.category || transaction.name;

    return (
        <TouchableOpacity 
            style={[
                styles.container, 
                { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }
            ]}
            onPress={handlePress}
        >
            <View style={styles.left}>
                <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                    <IconSymbol name={transaction.icon as any || 'star.fill'} size={24} color={iconTint} />
                </View>
                <View>
                    <Text style={[styles.name, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{transaction.name}</Text>
                    <Text style={[styles.date, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                       {categoryDisplay} - {formatDate(transaction.date)}
                    </Text>
                </View>
            </View>
            <Text style={[styles.amount, { color: isIncome ? '#10B981' : (isDarkMode ? '#F9FAFB' : '#111827') }]}>
                {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
});
