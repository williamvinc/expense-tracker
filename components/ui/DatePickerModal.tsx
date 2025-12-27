import React from 'react';
import { Modal, View, Text, TouchableOpacity,  StyleSheet, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from './icon-symbol';
import { useTheme } from '@/context/ThemeContext';

interface DatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    value: Date;
    onChange: (date: Date) => void;
    title?: string;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({ visible, onClose, value, onChange, title = 'Select Date' }) => {
    const { isDarkMode, currentAccentColor } = useTheme();
    const bgColor = isDarkMode ? '#1F2937' : '#FFFFFF';
    const textColor = isDarkMode ? '#FFFFFF' : '#111827';
    
    // Generate dates for current month view logic is complex for a simple modal without a library.
    // simpler approach: specialized wheel picker or just a simple +/- day/month/year interface.
    // Let's go with a simple clean 3-column scroll or just simple +/- buttons for Day, Month, Year for now to ensure robustness.
    
    const increment = (field: 'day' | 'month' | 'year', amount: number) => {
        const newDate = new Date(value);
        if (field === 'day') newDate.setDate(newDate.getDate() + amount);
        if (field === 'month') newDate.setMonth(newDate.getMonth() + amount);
        if (field === 'year') newDate.setFullYear(newDate.getFullYear() + amount);
        onChange(newDate);
    }
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {Platform.OS === 'ios' && <BlurView intensity={20} style={StyleSheet.absoluteFill} />}
                 <View style={[styles.container, { backgroundColor: bgColor }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                         <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <IconSymbol name="xmark.circle.fill" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pickerContainer}>
                        {/* Month */}
                        <View style={styles.column}>
                            <TouchableOpacity onPress={() => increment('month', 1)} style={styles.arrowBtn}>
                                <IconSymbol name="chevron.up" size={20} color={currentAccentColor} />
                            </TouchableOpacity>
                            <Text style={[styles.valueText, { color: textColor }]}>{months[value.getMonth()]}</Text>
                             <TouchableOpacity onPress={() => increment('month', -1)} style={styles.arrowBtn}>
                                <IconSymbol name="chevron.down" size={20} color={currentAccentColor} />
                            </TouchableOpacity>
                        </View>

                        {/* Day */}
                        <View style={styles.column}>
                             <TouchableOpacity onPress={() => increment('day', 1)} style={styles.arrowBtn}>
                                <IconSymbol name="chevron.up" size={20} color={currentAccentColor} />
                            </TouchableOpacity>
                            <Text style={[styles.valueText, { color: textColor }]}>{value.getDate()}</Text>
                             <TouchableOpacity onPress={() => increment('day', -1)} style={styles.arrowBtn}>
                                <IconSymbol name="chevron.down" size={20} color={currentAccentColor} />
                            </TouchableOpacity>
                        </View>

                        {/* Year */}
                        <View style={styles.column}>
                             <TouchableOpacity onPress={() => increment('year', 1)} style={styles.arrowBtn}>
                                <IconSymbol name="chevron.up" size={20} color={currentAccentColor} />
                            </TouchableOpacity>
                            <Text style={[styles.valueText, { color: textColor }]}>{value.getFullYear()}</Text>
                             <TouchableOpacity onPress={() => increment('year', -1)} style={styles.arrowBtn}>
                                <IconSymbol name="chevron.down" size={20} color={currentAccentColor} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={onClose} style={[styles.confirmBtn, { backgroundColor: currentAccentColor }]}>
                        <Text style={styles.confirmText}>Done</Text>
                    </TouchableOpacity>
                 </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    container: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 4,
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
    },
    column: {
        alignItems: 'center',
        width: 60,
    },
    arrowBtn: {
        padding: 10,
    },
    valueText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    confirmBtn: {
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    confirmText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
