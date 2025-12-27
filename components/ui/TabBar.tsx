import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useDrawer } from '@/context/DrawerContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDarkMode, currentAccentColor } = useTheme();
  const { openAddDrawer } = useDrawer();
  
  const absoluteFillStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Background layer with proper clipping */}
        <View style={[styles.innerBg, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
          {Platform.OS === 'ios' && (
            <BlurView intensity={20} style={absoluteFillStyle} tint={isDarkMode ? 'dark' : 'light'} />
          )}
        </View>

        <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const safeOptions = options as any;
          
          if (safeOptions.href === null) return null;

          const isFocused = state.index === index;
          const label = safeOptions.title || route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
               if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
               navigation.navigate(route.name, route.params);
            }
          };

          // Special styling for "Add" button - STAND OUT design with soft glow
          if (route.name === 'add') {
            const handleAddPress = () => {
              if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              openAddDrawer();
            };
            return (
              <View key={route.key} style={styles.addBtnWrapper}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Add new transaction"
                  onPress={handleAddPress}
                  style={[styles.addBtnOuter, { 
                    shadowColor: currentAccentColor,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.5,
                    shadowRadius: 16,
                  }]}
                >
                  <LinearGradient
                    colors={[currentAccentColor, adjustColor(currentAccentColor, -20)]}
                    style={styles.addBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <IconSymbol size={28} name="plus" color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
            >
               <TabIcon 
                  options={safeOptions} 
                  isFocused={isFocused} 
                  color={isFocused ? currentAccentColor : '#9CA3AF'} 
                  label={label}
                  accentColor={currentAccentColor}
                  isDarkMode={isDarkMode}
              />
            </TouchableOpacity>
          );
        })}
        </View>
      </View>
    </View>
  );
}

// Helper to darken color
function adjustColor(hex: string, amount: number): string {
  const clamp = (val: number) => Math.min(255, Math.max(0, val));
  
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  
  const num = parseInt(color, 16);
  const r = clamp(((num >> 16) & 0xff) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Sub-component for animated icon with label
function TabIcon({ options, isFocused, color, label, accentColor, isDarkMode }: { options: any, isFocused: boolean, color: string, label: string, accentColor: string, isDarkMode: boolean }) {
    const scale = useSharedValue(1);
    const dotOpacity = useSharedValue(0);
    const dotScale = useSharedValue(0);

    // Neutral colors for icons and labels
    const activeColor = isDarkMode ? '#FFFFFF' : '#1F2937';
    const inactiveColor = '#9CA3AF';
    const displayColor = isFocused ? activeColor : inactiveColor;

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1.05 : 1, { damping: 15 });
        dotOpacity.value = withSpring(isFocused ? 1 : 0, { damping: 15 });
        dotScale.value = withSpring(isFocused ? 1 : 0, { damping: 12, stiffness: 150 });
    }, [isFocused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const dotAnimatedStyle = useAnimatedStyle(() => ({
        opacity: dotOpacity.value,
        transform: [{ scale: dotScale.value }],
    }));

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Animated.View style={animatedStyle}>
                {options.tabBarIcon({ focused: isFocused, color: displayColor, size: 22 })}
            </Animated.View>
            <Text style={{ fontSize: 10, fontWeight: isFocused ? '700' : '500', color: displayColor }}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
            </Text>
            <Animated.View style={[{
                width: 5,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: accentColor,
                marginTop: 2,
            }, dotAnimatedStyle]} />
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    container: {
        borderRadius: 0,
        overflow: 'visible',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 12,
    },
    innerBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 0,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    addBtnWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnOuter: {
        marginTop: -36,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    addBtnGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnGlow: {
        position: 'absolute',
        top: -24,
        width: 50,
        height: 20,
        borderRadius: 10,
        opacity: 0.4,
        transform: [{ scaleX: 1.4 }],
    },
});
