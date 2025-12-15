import React from 'react';
import {
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';

const GradientButton = ({
    onPress,
    title,
    icon,
    isLoading,
    disabled,
    style,
    colors: gradientColors = colors.primaryGradient // Default to primary gradient
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.9}
            style={[
                styles.container,
                (disabled || isLoading) && styles.disabled,
                style
            ]}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <>
                        <Text style={styles.text}>{title}</Text>
                        {icon && (
                            <View style={styles.iconContainer}>
                                <Ionicons name={icon} size={18} color={colors.primary} />
                            </View>
                        )}
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8, // Android shadow
        marginBottom: 16,
    },
    disabled: {
        opacity: 0.7,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 58,
        paddingHorizontal: 20,
        gap: 12,
    },
    text: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    iconContainer: {
        backgroundColor: '#FFF',
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default GradientButton;
