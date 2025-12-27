import { StyleSheet } from 'react-native';
import { fonts } from './fonts';

// Reusable card styles without shadows/borders
export const cardStyles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
    },
    cardSmall: {
        borderRadius: 16,
        padding: 16,
    },
    cardLarge: {
        borderRadius: 32,
        padding: 24,
    },
});

// Global text styles with custom fonts
export const textStyles = StyleSheet.create({
    // Display fonts (Inter) - for headings
    displayLarge: {
        fontFamily: fonts.display.bold,
        fontSize: 32,
    },
    displayMedium: {
        fontFamily: fonts.display.bold,
        fontSize: 24,
    },
    displaySmall: {
        fontFamily: fonts.display.semibold,
        fontSize: 20,
    },

    // Sans fonts (Plus Jakarta Sans) - for body
    headlineLarge: {
        fontFamily: fonts.sans.bold,
        fontSize: 18,
    },
    headlineMedium: {
        fontFamily: fonts.sans.semibold,
        fontSize: 16,
    },
    bodyLarge: {
        fontFamily: fonts.sans.medium,
        fontSize: 16,
    },
    bodyMedium: {
        fontFamily: fonts.sans.regular,
        fontSize: 14,
    },
    bodySmall: {
        fontFamily: fonts.sans.regular,
        fontSize: 12,
    },
    labelLarge: {
        fontFamily: fonts.sans.bold,
        fontSize: 14,
    },
    labelMedium: {
        fontFamily: fonts.sans.semibold,
        fontSize: 12,
    },
    labelSmall: {
        fontFamily: fonts.sans.medium,
        fontSize: 10,
        letterSpacing: 1,
    },

    // Number/amount styles
    amountLarge: {
        fontFamily: fonts.display.extrabold,
        fontSize: 36,
        letterSpacing: -1,
    },
    amountMedium: {
        fontFamily: fonts.display.bold,
        fontSize: 24,
    },
    amountSmall: {
        fontFamily: fonts.sans.bold,
        fontSize: 16,
    },
});

export { fonts };
