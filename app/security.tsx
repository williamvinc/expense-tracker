import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useSecurity } from '@/context/SecurityContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomToggle } from '@/components/ui/CustomToggle';

export default function SecurityScreen() {
  const router = useRouter();
  const { isDarkMode, currentAccentColor } = useTheme();
  const { isBiometricsEnabled, toggleBiometrics, pin, setPin, isBiometricsSupported } = useSecurity();

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const bgColor = isDarkMode ? '#000000' : '#F3F4F6';
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Security</Text>
      </View>

      <View style={[styles.section, { backgroundColor: cardBg }]}>
          
          {isBiometricsSupported && (
              <>
                <View style={styles.row}>
                    <View>
                        <Text style={[styles.rowLabel, { color: textColor }]}>Biometric Unlock</Text>
                        <Text style={styles.rowSub}>Use FaceID or Fingerprint to unlock</Text>
                    </View>
                    <CustomToggle 
                        value={isBiometricsEnabled} 
                        onValueChange={toggleBiometrics}
                    />
                </View>
                <View style={styles.separator} />
              </>
          )}
          
          <View style={styles.row}>
              <View>
                  <Text style={[styles.rowLabel, { color: textColor }]}>App PIN</Text>
                  <Text style={styles.rowSub}>{pin ? 'PIN is set' : 'No PIN configured'}</Text>
              </View>
              {/* Minimal PIN management - just reset or clear for now in this MVP */}
              {pin ? (
                  <TouchableOpacity 
                    onPress={() => setPin(null)}
                    style={styles.btnOutline}
                  >
                      <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Remove</Text>
                  </TouchableOpacity>
              ) : (
                  <TouchableOpacity 
                    onPress={() => {
                        // Creating a simple mock PIN for demo purposes or prompt
                        // In real app, navigate to PIN creation flow
                        setPin('1234'); 
                        alert('PIN set to 1234 (Demo)');
                    }}
                    style={[styles.btn, { backgroundColor: currentAccentColor }]}
                  >
                      <Text style={{ color: '#000', fontWeight: 'bold' }}>Set PIN</Text>
                  </TouchableOpacity>
              )}
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
    btn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    btnOutline: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
});
