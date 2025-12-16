import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

// Global Typography Constants
export const fonts = {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semiBold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
};

export const commonStyles = StyleSheet.create({
    // Premium Card Style (Clean white with colored glow)
    card: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary, // Colored shadow for "glow"
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
            },
            android: {
                elevation: 6,
                shadowColor: colors.primary, // Android 9+ supports colored elevation shadows often
            },
        }),
    },

    // Interactive Card (Pressed state style if needed)
    cardActive: {
        transform: [{ scale: 0.98 }],
    },

    // Deep Shadow for floating elements
    shadowDepth: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
            },
            android: {
                elevation: 12,
            },
        }),
    },

    // Flex Helpers
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Typography
    headerTitle: {
        fontFamily: fonts.bold,
        fontSize: 28,
        color: colors.text,
    },
    subTitle: {
        fontFamily: fonts.medium,
        fontSize: 16,
        color: colors.textSecondary,
    }
});
