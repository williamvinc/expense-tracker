import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSecurity } from '@/context/SecurityContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function LockScreen() {
    const { isLocked, unlock, authenticateWithBiometrics, hasPin } = useSecurity();
    const { currentAccentColor, isDarkMode } = useTheme();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isLocked) {
            authenticateWithBiometrics();
        }
    }, [isLocked]);

    if (!isLocked) return null;

    const handlePress = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                const success = unlock(newPin);
                if (!success) {
                    setError(true);
                    setTimeout(() => {
                        setPin('');
                        setError(false);
                    }, 500);
                } else {
                    setPin('');
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: currentAccentColor + '20' }]}>
                   <IconSymbol name="lock.fill" size={40} color={currentAccentColor} />
                </View>
                <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
                   Wallet Locked
                </Text>
                <Text style={styles.subtitle}>Enter your PIN to unlock</Text>

                <View style={styles.dotsContainer}>
                    {[0, 1, 2, 3].map(i => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { 
                                    borderColor: error ? 'red' : currentAccentColor,
                                    backgroundColor: i < pin.length ? (error ? 'red' : currentAccentColor) : 'transparent' 
                                }
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.pad}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <TouchableOpacity
                            key={num}
                            style={styles.key}
                            onPress={() => handlePress(num.toString())}
                        >
                            <Text style={[styles.keyText, { color: isDarkMode ? '#fff' : '#000' }]}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.key} onPress={() => authenticateWithBiometrics()}>
                         <IconSymbol name="faceid" size={28} color={isDarkMode ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
                        <Text style={[styles.keyText, { color: isDarkMode ? '#fff' : '#000' }]}>0</Text>
                    </TouchableOpacity>
                     <TouchableOpacity style={styles.key} onPress={handleDelete}>
                        <IconSymbol name="delete.left.fill" size={24} color={isDarkMode ? '#fff' : '#000'} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 40,
        height: 20,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
    },
    pad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 280,
        gap: 20,
        justifyContent: 'center',
    },
    key: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    keyText: {
        fontSize: 28,
        fontWeight: '500',
    },
});
