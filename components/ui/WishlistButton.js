import React, { useRef, useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../styles/colors';

const WishlistButton = ({
    isActive = false,
    onPress,
    size = 24,
    activeColor = '#EF4444',
    inactiveColor = '#FFF', // Default for glass/overlay mode
    style
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Trigger bounce on change if active
        if (isActive) {
            triggerAnimation();
        }
    }, [isActive]);

    const triggerAnimation = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePress = () => {
        // Haptic Feedback
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (!isActive) {
            triggerAnimation();
        }
        onPress && onPress();
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={[styles.container, style]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                    name={isActive ? "heart" : "heart-outline"}
                    size={size}
                    color={isActive ? activeColor : inactiveColor}
                    style={styles.shadow}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    shadow: {
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    }
});

export default WishlistButton;
