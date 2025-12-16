import React from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useWishlist } from '../contexts/WishlistContext';
import RestaurantCard from '../components/RestaurantCard';
import CustomHeader from '../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

export default function WishlistScreen({ navigation }) {
    const { colors } = useTheme();
    const { wishlist } = useWishlist();

    const renderItem = ({ item }) => (
        <View style={styles.cardWrapper}>
            <RestaurantCard restaurant={item} />
        </View>
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="heart-outline" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your wishlist is empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Save your favorite restaurants here to find them quickly later!
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

            <CustomHeader title="Favorites" showBack={true} />

            <FlatList
                data={wishlist}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[
                    styles.listContent,
                    wishlist.length === 0 && styles.flexGrow
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyComponent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        paddingTop: 35, // Increased from 10 for better spacing
    },
    flexGrow: {
        flexGrow: 1,
    },
    cardWrapper: {
        marginBottom: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: -60, // Visual balance
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: "Outfit_800ExtraBold",
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: 'Outfit_400Regular',
    },
});
