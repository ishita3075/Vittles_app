import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

// Create animated component for icons
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function CustomHeader({
    title,
    showBack = true,
    onBack,
    rightIcon,
    onRightAction,
    subtitle
}) {
    const navigation = useNavigation();
    const { colors } = useTheme();

    // Breathing animation for background circles
    const breathAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(breathAnim, {
                    toValue: 1.1,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(breathAnim, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);


    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#1A237E", "#303F9F", "#1A237E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            >
                {/* --- Animated Background Decoration --- */}
                <View style={styles.bgContainer}>
                    {[
                        { name: "restaurant-outline", size: 48, top: '10%', left: '5%', rotate: '15deg' },
                        { name: "leaf-outline", size: 42, top: '25%', right: '10%', rotate: '-10deg' },
                        { name: "nutrition-outline", size: 54, top: '50%', left: '15%', rotate: '25deg' },
                        { name: "fast-food-outline", size: 40, top: '15%', left: '45%', rotate: '10deg' },
                    ].map((icon, index) => (
                        <AnimatedIcon
                            key={index}
                            name={icon.name}
                            size={icon.size}
                            color="rgba(255,255,255,0.06)"
                            style={{
                                position: 'absolute',
                                top: icon.top,
                                left: icon.left,
                                right: icon.right,
                                bottom: icon.bottom,
                                transform: [
                                    { scale: breathAnim },
                                    { rotate: icon.rotate }
                                ]
                            }}
                        />
                    ))}
                </View>

                <View style={styles.safeArea}>
                    <View style={styles.contentRow}>
                        {/* Left: Back Button */}
                        <View style={styles.leftContainer}>
                            {showBack && (
                                <TouchableOpacity
                                    onPress={handleBack}
                                    style={styles.iconButton}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Center: Title */}
                        <View style={styles.centerContainer}>
                            <Text style={styles.title} numberOfLines={1}>{title}</Text>
                            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                        </View>

                        {/* Right: Action Button or Spacer */}
                        <View style={styles.rightContainer}>
                            {rightIcon && (
                                <TouchableOpacity
                                    onPress={onRightAction}
                                    style={styles.iconButton}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name={rightIcon} size={24} color="#FFF" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Decorative extension or shadow could go here */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 100,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    gradient: {
        paddingTop: Platform.OS === 'android' ? 40 : 50, // Safe area padding
        paddingBottom: 15,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden', // Ensure overflow is hidden for bg icons
    },
    bgContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.8,
    },
    safeArea: {
        width: '100%',
        zIndex: 1, // Ensure content is above bg icons
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44, // Standard header height
    },
    leftContainer: {
        width: 44,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    rightContainer: {
        width: 44,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
