import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
    Animated,
    TouchableOpacity,
    Easing,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

// Create animated component for icons
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function VendorNavbar({
    isOpen,
    toggleShop,
    dailyIncome,
    isHalted,
    togglePause
}) {
    const { width } = useWindowDimensions();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { notifications } = useData();

    // 1. Animation Controllers
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-30)).current;
    const badgeScale = useRef(new Animated.Value(0)).current;
    // Breathing animation for background circles
    const breathAnim = useRef(new Animated.Value(1)).current;

    // Income update animation
    const incomeScale = useRef(new Animated.Value(1)).current;

    const unreadCount = notifications?.filter(n => !n.read)?.length || 0;

    // 2. Setup Animations
    useEffect(() => {
        // Entrance Sequence
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.poly(4)),
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Infinite Breathing Loop for Background
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

    // Badge Pop Effect
    useEffect(() => {
        Animated.spring(badgeScale, {
            toValue: unreadCount > 0 ? 1 : 0,
            friction: 6,
            useNativeDriver: true,
        }).start();
    }, [unreadCount]);

    // Income Update Effect
    useEffect(() => {
        Animated.sequence([
            Animated.timing(incomeScale, { toValue: 1.2, duration: 200, useNativeDriver: true }),
            Animated.timing(incomeScale, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();
    }, [dailyIncome]);

    // 3. Helpers
    const responsivePadding = width < 380 ? 20 : 24;

    const getUserInitials = () => {
        if (user && user.name) {
            const names = user.name.split(' ');
            return names[0][0].toUpperCase() + (names.length > 1 ? names[1][0].toUpperCase() : '');
        }
        return "V";
    };

    return (
        <View style={styles.outerContainer}>
            <LinearGradient
                colors={["#1A237E", "#303F9F", "#1A237E"]} // Deep Indigo Gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            >
                <SafeAreaView edges={["top"]} style={styles.safeContent}>

                    {/* --- Animated Background Decoration --- */}
                    <View style={styles.bgContainer}>
                        {[
                            { name: "restaurant-outline", size: 48, top: '10%', left: '5%', rotate: '15deg' },
                            { name: "cash-outline", size: 42, top: '25%', right: '10%', rotate: '-10deg' },
                            { name: "trending-up-outline", size: 54, top: '50%', left: '15%', rotate: '25deg' },
                            { name: "receipt-outline", size: 45, top: '40%', right: '25%', rotate: '-5deg' },
                            { name: "wallet-outline", size: 40, top: '15%', left: '45%', rotate: '10deg' },
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

                    {/* --- Main Content --- */}
                    <Animated.View
                        style={[
                            styles.contentContainer,
                            {
                                paddingHorizontal: responsivePadding,
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        {/* Header Row */}
                        <View style={styles.headerRow}>

                            {/* Profile Section */}
                            <TouchableOpacity
                                style={styles.profileSection}
                                onPress={() => navigation.navigate("Account")}
                                activeOpacity={0.8}
                            >
                                <View style={styles.avatarWrapper}>
                                    <LinearGradient
                                        colors={["#E1F0FA", "#FFFFFF"]}
                                        style={styles.avatarGradient}
                                    >
                                        <Text style={styles.avatarText}>{getUserInitials()}</Text>
                                    </LinearGradient>
                                </View>

                                <View style={styles.textColumn}>
                                    <Text style={styles.greetingText}>Hello, Chef!</Text>
                                    <Text style={styles.nameText} numberOfLines={1}>
                                        {user?.name || "My Store"}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Action Section (Bell) */}
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => navigation.navigate("Alerts")}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="notifications-outline" size={26} color="#FFFFFF" />
                                <Animated.View style={[styles.badge, { transform: [{ scale: badgeScale }] }]}>
                                    <Text style={styles.badgeText}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Text>
                                </Animated.View>
                            </TouchableOpacity>
                        </View>

                        {/* --- Revenue & Status Section --- */}
                        <View style={styles.statusSection}>
                            {/* Revenue Card (Glass) */}
                            <BlurView intensity={20} tint="light" style={styles.revenueCard}>
                                <Text style={styles.revenueLabel}>TODAY'S EARNINGS</Text>
                                <Animated.Text style={[styles.revenueValue, { transform: [{ scale: incomeScale }] }]}>
                                    ₹{dailyIncome.toLocaleString()}
                                </Animated.Text>
                            </BlurView>

                            {/* Switch (Glass) */}
                            <BlurView intensity={20} tint="light" style={styles.switchCard}>
                                <View style={styles.switchInfo}>
                                    <Text style={styles.switchLabel}>Store Status</Text>
                                    <Text style={[styles.switchStatus, { color: isOpen ? '#4ADE80' : '#F87171' }]}>
                                        {isOpen ? 'ONLINE' : 'OFFLINE'}
                                    </Text>
                                </View>

                                <TouchableOpacity onPress={toggleShop} activeOpacity={0.8}>
                                    <View style={[styles.switchTrack, { backgroundColor: isOpen ? '#4ADE80' : 'rgba(255,255,255,0.2)' }]}>
                                        <View style={[styles.switchThumb, { transform: [{ translateX: isOpen ? 24 : 2 }] }]} />
                                    </View>
                                </TouchableOpacity>
                            </BlurView>
                        </View>

                    </Animated.View>
                </SafeAreaView>
            </LinearGradient>

            {/* Shadow Drop to separate from content */}
            <View style={styles.dropShadow} />
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: 'transparent',
        zIndex: 100,
    },
    gradient: {
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    safeContent: {
        paddingBottom: 0,
    },
    // Background Pattern
    bgContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        overflow: 'hidden',
    },
    // Content
    contentContainer: {
        zIndex: 1,
        paddingTop: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarWrapper: {
        marginRight: 14,
        shadowColor: "#0A2342",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    avatarGradient: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0A2342",
    },
    textColumn: {
        flex: 1,
    },
    greetingText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    nameText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
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
    badge: {
        position: "absolute",
        top: -2,
        right: -2,
        backgroundColor: "#FFFFFF",
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#5A94C4",
        paddingHorizontal: 3,
    },
    badgeText: {
        color: "#5A94C4",
        fontSize: 10,
        fontWeight: "900",
    },

    // Status Section
    statusSection: {
        flexDirection: 'row',
        gap: 12,
    },
    revenueCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        minHeight: 80,
    },
    revenueLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    revenueValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    switchCard: {
        flex: 0.8,
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    switchInfo: {
        flex: 1,
    },
    switchLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
    },
    switchStatus: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    switchTrack: {
        width: 52,
        height: 30,
        borderRadius: 15,
        padding: 2,
        justifyContent: 'center',
    },
    switchThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
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
