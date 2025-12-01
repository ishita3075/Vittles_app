import React, { createContext, useContext, useState, useEffect } from 'react';
import userData from '../data/userData.json';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(userData);
  const [loading, setLoading] = useState(false);

  // Simulate API call to update data
  const updateUserData = async (updatedData) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(prevData => ({
        ...prevData,
        user: { ...prevData.user, ...updatedData }
      }));
    } catch (error) {
      console.error('Error updating user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (newStats) => {
    setData(prevData => ({
      ...prevData,
      stats: { ...prevData.stats, ...newStats }
    }));
  };

  const markNotificationAsRead = (notificationId) => {
    setData(prevData => ({
      ...prevData,
      notifications: prevData.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    }));
  };

  const value = {
    userData: data.user,
    stats: data.stats,
    menuItems: data.menuItems,
    recentOrders: data.recentOrders,
    favoriteRestaurants: data.favoriteRestaurants,
    notifications: data.notifications,
    loading,
    updateUserData,
    updateStats,
    markNotificationAsRead,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};