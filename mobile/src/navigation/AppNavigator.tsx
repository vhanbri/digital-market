import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import AuthStack from './AuthStack';
import BuyerTabs from './BuyerTabs';
import AdminTabs from './AdminTabs';
import CropDetailScreen from '../screens/CropDetailScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import { colors } from '../constants/theme';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

function BuyerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={BuyerTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="CropDetail"
        component={CropDetailScreen}
        options={{ title: 'Produce Details', headerStyle: { backgroundColor: colors.white }, headerTintColor: colors.gray[900], headerShadowVisible: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details', headerStyle: { backgroundColor: colors.white }, headerTintColor: colors.gray[900], headerShadowVisible: false }}
      />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details', headerStyle: { backgroundColor: colors.white }, headerTintColor: colors.gray[900], headerShadowVisible: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray[50] }}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === 'admin' ? (
        <AdminStack />
      ) : (
        <BuyerStack />
      )}
    </NavigationContainer>
  );
}
