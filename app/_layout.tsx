import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { UserProvider } from '@/context/UserContext';
import { TransactionProvider } from '@/context/TransactionContext';
import { WalletProvider } from '@/context/WalletContext';
import { BudgetProvider } from '@/context/BudgetContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { SecurityProvider } from '@/context/SecurityContext';
import { DrawerProvider, useDrawer } from '@/context/DrawerContext';
import { AddTransactionDrawer } from '@/components/AddTransactionDrawer';
import { useCustomFonts } from '@/constants/fonts';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isDarkMode } = useTheme();

  return (
    <NavThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="limits" options={{ headerShown: false }} />
        <Stack.Screen name="security" options={{ headerShown: false }} />
        <Stack.Screen name="personal-info" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
        <Stack.Screen name="send" options={{ headerShown: false }} />
        <Stack.Screen name="top-up" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

function AddDrawerWrapper() {
  const { isAddDrawerOpen, closeAddDrawer } = useDrawer();
  return <AddTransactionDrawer visible={isAddDrawerOpen} onClose={closeAddDrawer} />;
}

import LockScreen from '@/components/LockScreen';

export default function RootLayout() {
  const { fontsLoaded, fontError } = useCustomFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppThemeProvider>
      <SecurityProvider>
        <UserProvider>
          <CurrencyProvider>
            <WalletProvider>
              <TransactionProvider>
                <BudgetProvider>
                  <DrawerProvider>
                    <RootLayoutNav />
                    <AddDrawerWrapper />
                    <LockScreen />
                  </DrawerProvider>
                </BudgetProvider>
              </TransactionProvider>
            </WalletProvider>
          </CurrencyProvider>
        </UserProvider>
      </SecurityProvider>
    </AppThemeProvider>
  );
}
