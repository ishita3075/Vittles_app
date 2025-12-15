import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    Animated,
    TouchableOpacity,
    StyleSheet,
    Easing,
    Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";

const ModernInput = ({
    icon,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    keyboardType = "default",
    autoCapitalize = "none",
    returnKeyType = "done",
    onSubmitEditing
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const focusAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    useEffect(() => {
        if (error) {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }
    }, [error]);

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border || '#E5E7EB', colors.primary]
    });

    const iconColor = error ? colors.error : (isFocused ? colors.primary : colors.textSecondary);

    // Floating label animation
    const labelStyle = {
        position: 'absolute',
        left: 0,
        top: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -22]
        }),
        fontSize: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12]
        }),
        color: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.textSecondary, colors.primary]
        }),
        opacity: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1] // Hide label when inside, show whenever focused/has value
        }),
        fontWeight: '700',
        letterSpacing: 0.5,
        zIndex: 10,
    };

    const showPassword = !secureTextEntry || isPasswordVisible;

    return (
        <Animated.View style={[styles.wrapper, { transform: [{ translateX: shakeAnim }] }]}>
            {/* Always render text, opacity handles visibility */}
            <Animated.Text style={labelStyle}>
                {placeholder}
            </Animated.Text>

            <Animated.View style={[
                styles.container,
                {
                    borderColor: error ? colors.error : borderColor,
                    backgroundColor: isFocused ? '#FFF' : '#F9FAFB',
                    borderWidth: isFocused ? 2 : 1,
                },
                isFocused && styles.shadow
            ]}>
                <View style={[
                    styles.iconBox,
                    {
                        backgroundColor: isFocused ? (colors.primary + '15') : (colors.textSecondary + '10')
                    }
                ]}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>

                <TextInput
                    style={styles.input}
                    placeholder={isFocused ? '' : placeholder}
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={!showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    cursorColor={colors.primary}
                />

                {secureTextEntry && (
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.actionIcon}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}

                {!secureTextEntry && value.length > 0 && isFocused && (
                    <TouchableOpacity onPress={() => onChangeText('')} style={styles.actionIcon}>
                        <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}

            </Animated.View>
            {error ? (
                <Animated.Text entering={Platform.OS !== 'web'} style={styles.errorText}>
                    {error}
                </Animated.Text>
            ) : null}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 24,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        height: 60,
        paddingHorizontal: 12,
    },
    shadow: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
        height: '100%',
    },
    actionIcon: {
        padding: 8,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '600',
    }
});

export default ModernInput; // Re-export for default usage
