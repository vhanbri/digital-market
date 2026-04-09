import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import BuyerDashboardScreen from '../screens/BuyerDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useCart } from '../hooks/useCart';
import { colors } from '../constants/theme';
import type { BuyerTabParamList } from './types';

const Tab = createBottomTabNavigator<BuyerTabParamList>();

export default function BuyerTabs() {
  const { totalItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.brand[700],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.gray[200] },
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.gray[900],
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="BuyerDashboard"
        component={BuyerDashboardScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          title: 'Market',
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Cart',
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.brand[600] },
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
