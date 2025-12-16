import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { colors } from '../../styles/colors';
import { commonStyles } from '../../styles/common';

const BackButton = ({
    mode = 'standard', // 'standard' | 'glass' | 'white'
    onPress,
    style
}) => {
    const navigation = useNavigation();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            navigation.goBack();
        }
    };

    if (mode === 'glass') {
        return (
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.8}
                style={[styles.container, style]}
            >
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </BlurView>
            </TouchableOpacity>
        );
    }

    if (mode === 'white') {
        return (
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.8}
                style={[styles.container, styles.whiteContainer, commonStyles.shadowDepth, style]}
            >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
        );
    }

    // Standard (Transparent background, usually for plain headers)
    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.6}
            style={[styles.container, styles.standardContainer, style]}
        >
            <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)', // Fallback if blur not supported
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
    },
    whiteContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
    },
    standardContainer: {
        // No background
    }
});

export default BackButton;
