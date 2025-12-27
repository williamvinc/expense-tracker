import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface CustomToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function CustomToggle({ value, onValueChange, disabled = false }: CustomToggleProps) {
  const { currentAccentColor } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        {
          backgroundColor: value ? currentAccentColor : '#E5E7EB',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: value ? 20 : 0 }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 4,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
});
