import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileNavbar({ title = "Profile" }) {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    // Decorative circles similar to TopNavbar but static or simple
    // We can reuse the "Animated Icon" idea if we want, but static is fine for Profile to keep it lightweight
    // Let's use the same gradient and shape.

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#1A237E", "#303F9F", "#1A237E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            >
                <SafeAreaView edges={["top"]} style={styles.safeArea}>
                    <View style={styles.contentRow}>
                        {/* Left: Back Button */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.iconButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>

                        {/* Center: Title */}
                        <View style={styles.centerContainer}>
                            <Text style={styles.title}>{title}</Text>
                        </View>

                        {/* Right: Spacer to balance layout */}
                        <View style={styles.rightContainer} />
                    </View>
                </SafeAreaView>

                {/* Decorative Background Icons (Static for performance, but matching theme) */}
                <View style={styles.bgContainer}>
                    <Ionicons name="person-outline" size={80} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', top: -10, right: -20, transform: [{ rotate: '15deg' }] }} />
                    <Ionicons name="settings-outline" size={60} color="rgba(255,255,255,0.03)" style={{ position: 'absolute', bottom: 10, left: -10, transform: [{ rotate: '-10deg' }] }} />
                </View>

            </LinearGradient>

            {/* Drop Shadow */}
            <View style={styles.dropShadow} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 100,
    },
    gradient: {
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    safeArea: {
        paddingBottom: 0,
        zIndex: 10,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    rightContainer: {
        width: 44,
    },
    bgContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        pointerEvents: 'none',
    },
    dropShadow: {
        height: 15,
        marginTop: -15,
        backgroundColor: 'transparent',
        shadowColor: '#0A2342',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        zIndex: -1,
    }
});
