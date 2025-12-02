// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your Render URL here
const BASE_URL = 'https://foodapp-3-kmi1.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log('API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// ---------------- VENDOR API (your existing code) ----------------

const vendorApi = axios.create({
  baseURL: 'https://ineat-vendor.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

vendorApi.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

vendorApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log('Vendor API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Get vendor's menu
export const getVendorMenu = async (vendorId) => {
  try {
    const response = await vendorApi.get(`/vendors/${vendorId}/menu`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor menu:', error);
    throw error;
  }
};

// Add item to vendor's menu
export const addMenuItem = async (vendorId, menuItem) => {
  try {
    const response = await vendorApi.post(`/vendors/${vendorId}/menu`, {
      itemName: menuItem.name,
      price: menuItem.price,
      category: menuItem.category,
      description: menuItem.description,
      available: menuItem.available
    });
    return response.data;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

// Update menu item availability
export const updateMenuItemAvailability = async (vendorId, itemId, available) => {
  try {
    const response = await vendorApi.patch(`/vendors/${vendorId}/menu/${itemId}`, {
      available: available ? 1 : 0
    });
    return response.data;
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

// Delete menu item
export const deleteMenuItem = async (vendorId, itemId) => {
  try {
    const response = await vendorApi.delete(`/vendors/${vendorId}/menu/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// NEW: Vendor fetching functions
export const getAllVendors = async () => {
  try {
    const response = await vendorApi.get('/vendors');
    return response.data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

export const getVendorById = async (vendorId) => {
  try {
    const response = await vendorApi.get(`/vendors/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    throw error;
  }
};

export const searchVendors = async (query) => {
  try {
    const response = await vendorApi.get('/vendors/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching vendors:', error);
    throw error;
  }
};

export const createVendor = async (vendorData) => {
  try {
    const response = await vendorApi.post('/vendors', vendorData);
    return response.data;
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw error;
  }
};

export const updateVendor = async (vendorId, vendorData) => {
  try {
    const response = await vendorApi.put(`/vendors/${vendorId}`, vendorData);
    return response.data;
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
};

export const getOrdersByVendor = async (vendorId) => {
  try {
    const response = await vendorApi.get(`/orders/vendor/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor orders:", error.response?.data || error);
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  try {
    const response = await vendorApi.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error.response?.data || error);
    throw error;
  }
};

// PATCH all orders of a customerId (vendor updating order status)
export const updateOrderStatusByCustomerAPI = async (customerId, status) => {
  try {
    const response = await vendorApi.patch(`/orders/customer/${customerId}`, {
      status
    });
    return response.data;
  } catch (error) {
    console.log("updateOrderStatusByCustomerAPI ERROR:", error.response?.data || error);
    throw error;
  }
};

// ---------------- PAYMENT API (Spring Boot + Razorpay) ----------------

// ⚠️ CHANGE THIS TO YOUR SPRING BOOT URL (use your PC IPv4 instead of localhost)
const paymentApi = axios.create({
  baseURL: 'http://10.10.180.162:8089', // e.g. http://192.168.1.10:8089
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create Razorpay order via Spring Boot backend
 * @param {number} amountInPaise - e.g. 10000 for ₹100
 */
export const createRazorpayOrder = async (amountInPaise) => {
  try {
    const response = await paymentApi.post('/api/payments/create-order', {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });
    return response.data; // { orderId, currency, amount, razorpayKeyId }
  } catch (error) {
    console.error('Error creating Razorpay order:', error.response?.data || error);
    throw error;
  }
};

export default api;
