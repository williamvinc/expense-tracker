// Using expo-google-fonts with useFonts hook
import {
    useFonts as usePlusJakartaSans,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import {
    useFonts as useInter,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

// Font family names for use in styles
export const fonts = {
    // Sans (body text) - Plus Jakarta Sans
    sans: {
        regular: 'PlusJakartaSans_400Regular',
        medium: 'PlusJakartaSans_500Medium',
        semibold: 'PlusJakartaSans_600SemiBold',
        bold: 'PlusJakartaSans_700Bold',
        extrabold: 'PlusJakartaSans_800ExtraBold',
    },
    // Display (headings) - Inter
    display: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semibold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
        extrabold: 'Inter_800ExtraBold',
    },
};

// Custom hook to load all fonts
export function useCustomFonts() {
    const [plusJakartaLoaded, plusJakartaError] = usePlusJakartaSans({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
        PlusJakartaSans_800ExtraBold,
    });

    const [interLoaded, interError] = useInter({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
    });

    const fontsLoaded = plusJakartaLoaded && interLoaded;
    const fontError = plusJakartaError || interError;

    return { fontsLoaded, fontError };
}
