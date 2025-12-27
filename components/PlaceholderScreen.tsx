import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PlaceholderScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const bgColor = isDarkMode ? '#000000' : '#F3F4F6';

  const title = pathname.replace('/', '').replace('-', ' ').toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
          <IconSymbol name="hammer.fill" size={64} color={textColor} />
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          <Text style={styles.sub}>Coming Soon</Text>
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    sub: {
        fontSize: 16,
        color: '#9CA3AF',
    },
});
