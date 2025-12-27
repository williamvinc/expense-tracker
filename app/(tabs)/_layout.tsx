import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

import { TabBar } from '@/components/ui/TabBar';

export default function TabLayout() {
  const { isDarkMode, currentAccentColor } = useTheme();
  const router = useRouter();

  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
             <IconSymbol 
                size={22} 
                name="house.fill" 
                color={color} 
                style={{ opacity: focused ? 1 : 0.7 }}
             />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
             <IconSymbol 
                size={22} 
                name="chart.pie.fill" 
                color={color}
                style={{ opacity: focused ? 1 : 0.7 }}
             />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => (
              <View style={{
                  width: 64, // Larger
                  height: 64, // Larger
                  borderRadius: 32,
                  backgroundColor: currentAccentColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: currentAccentColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8, // More pop
                  marginTop: -40, // Lift it up significantly above the bar
                  borderWidth: 4,
                  borderColor: isDarkMode ? '#1F2937' : '#FFFFFF' // Add border matching bg to create "cutout" effect
              }}>
                  <IconSymbol size={32} name="plus.circle.fill" color="#ffffff" />
              </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/modal'); // ensure 'modal' routes to app/modal.tsx (check your routing)
          },
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
             <IconSymbol 
                size={22} 
                name="creditcard.fill" 
                color={color} 
                style={{ opacity: focused ? 1 : 0.7 }}
             />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
             <IconSymbol 
                size={22} 
                name="person.fill" 
                color={color} 
                style={{ opacity: focused ? 1 : 0.7 }}
             />
          ),
        }}
      />
      {/* Hidden tabs */}
       <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

