import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ExternalLink } from '@/components/external-link';
import { fonts } from '@/constants/fonts';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isDarkMode, currentAccentColor } = useTheme();

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const bgColor = isDarkMode ? '#000000' : '#F3F4F6';
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Profile</Text>
            <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: cardBg }]}
                onPress={() => router.push('/settings')}
            >
                <IconSymbol name="gear" size={24} color={textColor} /> 
                {/* Note: 'gear' or 'settings' needs to be mapped if not present. 'settings' usually mapped to 'settings' Material. 
                   Checking icon-symbol mappings later if needed. 'gear' is SF Symbol.
                */}
            </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.profileHeader}>
                 <View style={[styles.avatarContainer, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                     {user.avatar ? (
                         <Image source={{ uri: user.avatar }} style={styles.avatar} />
                     ) : (
                         <IconSymbol name="person.fill" size={48} color="#9CA3AF" />
                     )}
                     <TouchableOpacity 
                        style={[styles.editBadge, { backgroundColor: currentAccentColor }]}
                        onPress={() => router.push('/personal-info')}
                     >
                         <IconSymbol name="pencil" size={14} color="#000" />
                     </TouchableOpacity>
                 </View>
                 <Text style={[styles.name, { color: textColor }]}>{user.name}</Text>
                 <Text style={styles.email}>{user.email}</Text>
            </View>

            {/* Recent Summary Preview (Static/Mock for now as per web logic) */}
            <View style={[styles.summaryBox, { backgroundColor: isDarkMode ? '#000' : '#F9FAFB' }]}>
                 <Text style={styles.summaryTitle}>RECENT ACTIVITY SUMMARY</Text>
                 <View style={styles.summaryItem}>
                     <View style={styles.summaryLeft}>
                         <View style={[styles.summaryIcon, { backgroundColor: cardBg }]}>
                             <IconSymbol name="cart.fill" size={16} color={textColor} />
                         </View>
                         <View>
                             <Text style={[styles.summaryText, { color: textColor }]}>Whole Foods</Text>
                             <Text style={styles.summaryDate}>Yesterday</Text>
                         </View>
                     </View>
                     <Text style={[styles.summaryAmount, { color: textColor }]}>-$124.00</Text>
                 </View>
                 <View style={styles.summaryItem}>
                     <View style={styles.summaryLeft}>
                         <View style={[styles.summaryIcon, { backgroundColor: cardBg }]}>
                             <IconSymbol name="banknote" size={16} color="#CA8A04" />
                         </View>
                         <View>
                             <Text style={[styles.summaryText, { color: textColor }]}>Salary Deposit</Text>
                             <Text style={styles.summaryDate}>Oct 20</Text>
                         </View>
                     </View>
                     <Text style={[styles.summaryAmount, { color: '#16A34A' }]}>+$3,250.00</Text>
                 </View>
            </View>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>General</Text>

        <View style={styles.menuList}>
            <TouchableOpacity 
                style={[styles.menuItem, { backgroundColor: cardBg }]}
                onPress={() => router.push('/personal-info')}
            >
                <View style={styles.menuLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                        <IconSymbol name="person" size={20} color={textColor} />
                    </View>
                    <Text style={[styles.menuText, { color: textColor }]}>Personal Info</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.menuItem, { backgroundColor: cardBg }]}
                onPress={() => router.push('/security')}
            >
                <View style={styles.menuLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                        <IconSymbol name="lock" size={20} color={textColor} />
                    </View>
                    <Text style={[styles.menuText, { color: textColor }]}>Security</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.menuItem, { backgroundColor: cardBg }]}
                onPress={() => router.push('/help')}
            >
                <View style={styles.menuLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                        <IconSymbol name="questionmark.circle" size={20} color={textColor} />
                    </View>
                    <Text style={[styles.menuText, { color: textColor }]}>Help & Support</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.menuItem, { backgroundColor: cardBg }]}
                onPress={() => require('expo-web-browser').openBrowserAsync('https://teer.id/williamvnct')}
            >
                 <View style={styles.menuLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                        <IconSymbol name="heart.fill" size={20} color={isDarkMode ? '#F472B6' : '#EC4899'} />
                    </View>
                    <Text style={[styles.menuText, { color: textColor }]}>Tip the Developer</Text>
                </View>
                <IconSymbol name="arrow.up.right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </View>

        <View style={styles.footer}>
            <Text style={styles.footerText}>Created with </Text>
            <IconSymbol name="heart.fill" size={12} color="#EF4444" />
            <Text style={styles.footerText}> by Williamvnct</Text>
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
        fontSize: 32,
        fontWeight: 'bold',
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        borderRadius: 32,
        padding: 24,
        marginBottom: 32,
        alignItems: 'center',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF', 
    },
    name: {
        fontSize: 24,
        fontFamily: fonts.display.bold,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    summaryBox: {
        width: '100%',
        borderRadius: 20,
        padding: 16,
    },
    summaryTitle: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    summaryIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    summaryDate: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    summaryAmount: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.display.bold,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    menuList: {
        gap: 12,
        marginBottom: 32,
    },
    menuItem: {
        padding: 16,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 120,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
});
