import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from './config';

/* =========================================================================
   MAIN CUSTOMER API
   ========================================================================= */

const BASE_URL = API_URLS.CUSTOMER;

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

/* =========================================================================
   VENDOR API
   ========================================================================= */

const vendorApi = axios.create({
  baseURL: API_URLS.VENDOR,
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
    console.log("addMenuItem called with:", JSON.stringify(menuItem));
    /* 
       Ensure we send BOTH foodType and isVeg to satisfy backend.
       Derived from either property to be safe.
    */
    const isVeg = menuItem.isVeg !== undefined ? menuItem.isVeg : (menuItem.foodType === "Veg");
    const foodType = menuItem.foodType || (isVeg ? "Veg" : "Non-Veg");

    const payload = {
      itemName: menuItem.itemName ?? menuItem.name,
      price: menuItem.price,
      category: menuItem.category,
      description: menuItem.description,
      foodType: foodType,
      isVeg: isVeg, // Sending explicit boolean as well
      available: menuItem.available,
    };
    console.log("Sending payload to API:", JSON.stringify(payload));

    const response = await vendorApi.post(`/vendors/${vendorId}/menu`, payload);
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
      available: available ? 1 : 0,
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
      params: { q: query },
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
    console.error('Error fetching vendor orders:', error.response?.data || error);
    throw error;
  }
};

export const getOrdersByCustomer = async (customerId) => {
  try {
    const response = await vendorApi.get(`/orders/customer/${customerId}`);
    return response.data; // ALWAYS return axios data
  } catch (error) {
    console.error("getOrdersByCustomer ERROR:", error.response?.data || error);
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  try {
    // orderData is already in correct backend format
    // {
    //   customerId,
    //   customerName,
    //   vendorId,
    //   vendorName,
    //   items: [ {menuId, menuName, quantity} ]
    // }

    const payload = {
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      vendorId: orderData.vendorId,
      vendorName: orderData.vendorName,
      items: orderData.items
    };

    console.log("📦 Final Order Payload →", payload);

    const response = await vendorApi.post('/orders', payload);
    return response.data;

  } catch (error) {
    console.error("❌ Error placing order:", error.response?.data || error);
    throw error;
  }
};

// PATCH all orders of a customerId (vendor updating order status)
export const updateOrderStatusByCustomerAPI = async (customerId, status) => {
  try {
    const response = await vendorApi.patch(`/orders/customer/${customerId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.log('updateOrderStatusByCustomerAPI ERROR:', error.response?.data || error);
    throw error;
  }
};

/* =========================================================================
   PAYMENT API (Spring Boot + Razorpay)
   ========================================================================= */

const paymentApi = axios.create({
  baseURL: API_URLS.PAYMENT,
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

/* =========================================================================
   NOTIFICATION API (Render)
   ========================================================================= */

// 👉 Use your real notification service URL
const NOTIFICATION_BASE_URL = API_URLS.NOTIFICATION;

const notificationApi = axios.create({
  baseURL: NOTIFICATION_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// If your notification API also needs JWT, keep this interceptor.
// If not, you can remove this whole block.
notificationApi.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

notificationApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log('Notification API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// 🔔 Get all notifications for a user
export const getNotifications = async (userId) => {
  // backend route: GET /api/notifications/user/{userId}
  const res = await notificationApi.get(`/api/notifications/user/${userId}`);
  return res.data; // [{ id, orderId, message, type, createdAt }, ...]
};

// 🔔 Mark one notification as read
// (these will 404 until you add endpoints in backend; they are wired
// to the "future" routes you might create)
export const markNotificationRead = async (notificationId) => {
  // expected backend route (when you add it): PATCH /api/notifications/{id}/read
  const res = await notificationApi.patch(`/api/notifications/${notificationId}/read`);
  return res.data;
};

// 🔔 Delete a single notification
export const deleteNotificationApi = async (notificationId) => {
  // expected backend route: DELETE /api/notifications/{id}
  const res = await notificationApi.delete(`/api/notifications/${notificationId}`);
  return res.data;
};

// 🔔 Clear all notifications for a user
export const clearAllNotifications = async (userId) => {
  // expected backend route: DELETE /api/notifications/user/{userId}/all
  const res = await notificationApi.delete(`/api/notifications/user/${userId}/all`);
  return res.data;
};

/* =========================================================================
   AUTH API (for /api/user/me)
   ========================================================================= */

const AUTH_BASE_URL = API_URLS.AUTH;

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

authApi.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Fetch current user using JWT and return { id, name, email }
 */
export const fetchCurrentUser = async () => {
  const res = await authApi.get('/api/user/me');
  return res.data; // { id, name, email }
};

/* =========================================================================
   DEFAULT EXPORT
   ========================================================================= */

export default api;
