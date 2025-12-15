import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function CartConflictModal() {
    const { colors } = useTheme();
    const {
        showRestaurantWarning,
        confirmRestaurantChange,
        dismissWarning,
        cart
    } = useCart();

    if (!showRestaurantWarning) return null;

    const currentRestaurantName = cart.length > 0 ? cart[0].restaurantName : 'another restaurant';

    return (
        <Modal
            transparent
            visible={showRestaurantWarning}
            animationType="fade"
            onRequestClose={dismissWarning}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="basket" size={40} color={colors.primary} />
                        <View style={styles.warningBadge}>
                            <Ionicons name="alert" size={16} color="#FFF" />
                        </View>
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>Start a new basket?</Text>

                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                        Your basket contains items from <Text style={{ fontWeight: '700', color: colors.text }}>{currentRestaurantName}</Text>.
                        Do you want to discard them and add items from the new restaurant?
                    </Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                            onPress={dismissWarning}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>No</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
                            onPress={confirmRestaurantChange}
                        >
                            <Text style={[styles.buttonText, { color: '#FFF' }]}>Yes, Start New</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    iconContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    warningBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    confirmButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
