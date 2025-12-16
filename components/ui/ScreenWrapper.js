import React from 'react';
import {
    View,
    StyleSheet,
    ImageBackground,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';

const { width, height } = Dimensions.get('window');

const ScreenWrapper = ({
    children,
    backgroundUri = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
    overlayColor = colors.darkOverlay,
    useCustomBackground = true, // Toggle for image background
    style
}) => {
    const insets = useSafeAreaInsets();

    const WrapperContent = (
        <View style={[
            styles.contentContainer,
            { paddingTop: insets.top },
            style
        ]}>
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />
            {children}
        </View>
    );

    if (!useCustomBackground) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {WrapperContent}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: backgroundUri }}
                style={styles.background}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={[overlayColor, overlayColor]}
                    style={styles.overlay}
                />

                {/* Decorative Elements */}
                <View style={styles.circle1} />
                <View style={styles.circle2} />

                {WrapperContent}
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        flex: 1,
    },
    circle1: {
        position: "absolute",
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: "rgba(255,255,255,0.03)", // Subtle tint
        top: -width * 0.5,
        left: -width * 0.1,
    },
    circle2: {
        position: "absolute",
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: "rgba(255,255,255,0.02)",
        top: -width * 0.2,
        right: -width * 0.3,
    },
});

export default ScreenWrapper;
