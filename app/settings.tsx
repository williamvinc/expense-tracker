import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomToggle } from '@/components/ui/CustomToggle';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, accentColor, setAccentColor, ACCENT_COLORS } = useTheme();
  const { currency, setCurrency, AVAILABLE_CURRENCIES } = useCurrency();

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const bgColor = isDarkMode ? '#000000' : '#F3F4F6';
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Settings</Text>
      </View>

      <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Appearance</Text>
          
          <View style={styles.row}>
              <View>
                  <Text style={[styles.rowLabel, { color: textColor }]}>Dark Mode</Text>
                  <Text style={styles.rowSub}>Use dark colors for UI</Text>
              </View>
              <CustomToggle 
                value={isDarkMode} 
                onValueChange={toggleTheme}
              />
          </View>

          <View style={styles.separator} />
          
          <Text style={[styles.rowLabel, { color: textColor, marginBottom: 12 }]}>Accent Color</Text>
          <View style={styles.colorGrid}>
              {ACCENT_COLORS.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.colorOption, { backgroundColor: c.color }, accentColor === c.id && { borderWidth: 2, borderColor: textColor }]}
                    onPress={() => setAccentColor(c.id)}
                  />
              ))}
          </View>
      </View>

      <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Preferences</Text>
          
          <View>
              <Text style={[styles.rowLabel, { color: textColor }]}>Currency</Text>
              <Text style={[styles.rowSub, { marginBottom: 12 }]}>Display currency for all values</Text>
              <View style={styles.currencyOptions}>
                  {AVAILABLE_CURRENCIES.map(curr => (
                      <TouchableOpacity
                        key={curr.code}
                        style={[
                            styles.currencyBadge, 
                            { 
                                backgroundColor: currency === curr.code ? accentColor : (isDarkMode ? '#374151' : '#F3F4F6') 
                            }
                        ]}
                        onPress={() => setCurrency(curr.code)}
                      >
                          <Text style={{ 
                              color: currency === curr.code ? '#000' : textColor, 
                              fontWeight: 'bold',
                              fontSize: 14,
                          }}>{curr.symbol} {curr.code}</Text>
                      </TouchableOpacity>
                  ))}
              </View>
          </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        gap: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    section: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    rowSub: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(156, 163, 175, 0.2)',
        marginVertical: 16,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    currencyOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    currencyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
});
