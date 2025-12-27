import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { fonts } from '@/constants/fonts';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const DEVELOPER_EMAIL = 'wiliam@insignia.co.id';
const APP_VERSION = '2.4.0';

export default function HelpScreen() {
  const router = useRouter();
  const { isDarkMode, currentAccentColor } = useTheme();

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const bgColor = isDarkMode ? '#000000' : '#F5F5F5';
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';

  // Floating animation
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleGoBack = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEmailPress = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`mailto:${DEVELOPER_EMAIL}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View style={[styles.iconContainer, floatingStyle]}>
          <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
            <IconSymbol name="headphones" size={40} color="#3B82F6" />
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={[styles.title, { color: textColor }]}>Need Assistance?</Text>

        {/* Description */}
        <Text style={styles.description}>
          If you have any questions, encountered a bug, or just want to say hi, feel free to reach out directly.
        </Text>

        {/* Contact Card */}
        <View style={[styles.contactCard, { backgroundColor: cardBg }]}>
          <Text style={styles.contactLabel}>DEVELOPER CONTACT</Text>
          <View style={styles.emailRow}>
            <IconSymbol name="at" size={16} color="#9CA3AF" />
            <Text style={[styles.emailText, { color: textColor }]}>{DEVELOPER_EMAIL}</Text>
          </View>
          <Text style={styles.availabilityText}>Monday - Friday, 9AM - 5PM</Text>
        </View>

        {/* Email Button */}
        <TouchableOpacity 
          style={[styles.emailButton, { backgroundColor: currentAccentColor }]}
          onPress={handleEmailPress}
          activeOpacity={0.8}
        >
          <IconSymbol name="envelope.fill" size={20} color="#000" />
          <Text style={styles.emailButtonText}>Email Me</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>App Version {APP_VERSION}</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.display.bold,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.display.bold,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  contactCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  contactLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
  },
  availabilityText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
  },
  emailButtonText: {
    fontSize: 16,
    fontFamily: fonts.sans.bold,
    color: '#000',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  versionText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
