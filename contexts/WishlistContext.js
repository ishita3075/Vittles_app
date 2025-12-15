import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid, Platform, Alert } from 'react-native';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load wishlist from storage on mount
    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const storedWishlist = await AsyncStorage.getItem('user_wishlist');
            if (storedWishlist) {
                setWishlist(JSON.parse(storedWishlist));
            }
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveWishlist = async (newWishlist) => {
        try {
            await AsyncStorage.setItem('user_wishlist', JSON.stringify(newWishlist));
        } catch (error) {
            console.error('Failed to save wishlist:', error);
        }
    };

    const addToWishlist = async (restaurant) => {
        // Avoid duplicates
        if (wishlist.some(item => item.id === restaurant.id)) return;

        const newWishlist = [...wishlist, restaurant];
        setWishlist(newWishlist);
        saveWishlist(newWishlist);

        if (Platform.OS === 'android') {
            ToastAndroid.show(`${restaurant.name} added to favorites!`, ToastAndroid.SHORT);
        }
    };

    const removeFromWishlist = async (restaurantId) => {
        const newWishlist = wishlist.filter(item => item.id !== restaurantId);
        setWishlist(newWishlist);
        saveWishlist(newWishlist);

        if (Platform.OS === 'android') {
            ToastAndroid.show('Removed from favorites', ToastAndroid.SHORT);
        }
    };

    const toggleWishlist = (restaurant) => {
        if (isInWishlist(restaurant.id)) {
            removeFromWishlist(restaurant.id);
        } else {
            addToWishlist(restaurant);
        }
    };

    const isInWishlist = (restaurantId) => {
        return wishlist.some(item => item.id === restaurantId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            isLoading: loading,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
