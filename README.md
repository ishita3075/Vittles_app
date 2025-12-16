# Vittles App

## Overview
Vittles is a comprehensive food ordering mobile application built with React Native and Expo. It bridges the gap between hungry customers and college cafeterias food vendors, offering a seamless experience for browsing menus, placing orders, and managing deliveries. The app supports two distinct user roles: **Customers** and **Vendors**, each with tailored dashboards and features.

## Features

### Customer Features
- **User Authentication**: Secure Login, Signup, and Password Reset functionality using JWT.
- **Home & Discovery**:
  - Personalized recommendations.
  - Category-based browsing (Veg/Non-Veg, Cuisines).
  - Search functionality for restaurants and dishes.
- **Ordering Process**:
  - Add items to Cart with conflict resolution (ordering from multiple vendors).
  - Seamless Checkout process.
  - **Payment Integration**: Razorpay support for secure transactions.
- **Order Management**:
  - Real-time Order Tracking.
  - Order History with detailed views.
- **Profile**:
  - Manage personal information.
  - View Wishlist and Reviews.
  - Toggle between Light/Dark themes.

### Vendor Features
- **Dashboard**: Real-time overview of orders and earnings.
- **Menu Management**:
  - Add, Edit, and Delete menu items.
  - Manage item availability (In Stock / Out of Stock).
- **Order Fulfillment**: View and update order status (Pending, Preparing, Ready, etc.).
- **Business Profile**: Manage operating hours and restaurant details.

## Tech Stack

### Frontend
- **Framework**: React Native (Expo SDK 54).
- **Navigation**: React Navigation (Native Stack & Bottom Tabs).
- **Networking**: Axios for API requests.
- **State Management**: React Context API (`AuthContext`, `CartContext`, `ThemeContext`, `WishlistContext`).
- **UI/UX**:
  - `react-native-paper` for UI components.
  - `react-native-reanimated` for smooth animations.
  - `expo-google-fonts/outfit` for typography.
  - Custom Design System with centralized color palette.

### Backend Services
The app connects to multiple backend microservices:
- **Auth API**: `https://foodapp-3-kmi1.onrender.com` (User management & Auth).
- **Vendor API**: `https://ineat-vendor.onrender.com` (Vendor & Menu management).
- **Payment API**: Spring Boot backend for Razorpay order generation.
- **Notification API**: Hosted on Render.

## Project Structure

```
Vittles_app/
├── assets/             # Images, icons, and fonts
├── components/         # Reusable UI components (Buttons, Cards, Modals)
├── contexts/           # React Context Providers (Auth, Cart, Theme, etc.)
├── navigation/         # Navigation stacks (HomeStack, ProfileStack, etc.)
├── screens/            # Application screens
│   ├── LoginScreen.js
│   ├── HomeScreen.js
│   ├── CartScreen.js
│   ├── VendorDashboard.js
│   └── ...
├── styles/             # Global styles and color definitions
├── api.js              # Centralized API configuration and endpoints
├── App.js              # Application entry point and Root Navigator
└── package.json        # Dependencies and scripts
```

## Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ishita3075/Vittles_app.git
    cd Vittles_app
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the application**:
    ```bash
    npm start
    ```
    This command runs `expo start`, which allows you to run the app on:
    - **Android Emulator / iOS Simulator**: Press `a` (Android) or `i` (iOS).
    - **Physical Device**: Scan the QR code using the Expo Go app.
    - **Web**: Press `w`.

## Key Configuration Files

- **`api.js`**: Contains the `axios` instances and interceptors for different microservices.
- **`config.js`**: (If present) Centralized configuration for API URLs.
- **`App.js`**: Handles the root navigation logic, checking for authentication state to switch between Auth and Main flows.
- **`styles/colors.js`**: Defines the application's color palette (Primary, Secondary, Backgrounds, etc.).

## Dependencies
Major dependencies include:
- `@react-navigation/*`: For routing.
- `firebase`: Backend integration.
- `react-native-safe-area-context`: Handling safe areas on notched devices.
- `react-native-gesture-handler` & `react-native-reanimated`: Gestures and Animations.