import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getMyOrders } from '../services/order.service';
import { colors, spacing, fontSize } from '../constants/theme';
import type { Order, OrderStatus } from '../types';

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  accepted: { bg: '#dbeafe', text: '#1e40af' },
  rejected: { bg: '#fef2f2', text: '#991b1b' },
  delivered: { bg: '#dcfce7', text: '#166534' },
};

export default function BuyerDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { totalItems, totalPrice: cartTotal } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch { /* empty */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const activeOrders = orders.filter((o) => o.status === 'pending' || o.status === 'accepted');
  const totalSpent = orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.total_price, 0);
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={colors.brand[600]} />}
    >
      <Text style={styles.greeting}>Hello, {user?.name ?? 'there'}!</Text>
      <Text style={styles.subtitle}>Here's your activity summary</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={22} color={colors.brand[600]} />
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Cart Items</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Orders')}>
          <Ionicons name="time" size={22} color="#f59e0b" />
          <Text style={styles.statValue}>{activeOrders.length}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </TouchableOpacity>

        <View style={styles.statCard}>
          <Ionicons name="wallet" size={22} color={colors.brand[700]} />
          <Text style={styles.statValue}>{totalSpent > 0 ? `₱${totalSpent.toFixed(0)}` : '₱0'}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>

        <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Marketplace')}>
          <Ionicons name="storefront" size={22} color={colors.blue[500]} />
          <Text style={styles.statValue}>{cartTotal > 0 ? `₱${cartTotal.toFixed(0)}` : '₱0'}</Text>
          <Text style={styles.statLabel}>Cart Value</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No orders yet. Browse the marketplace!</Text>
          </View>
        ) : (
          recentOrders.map((order) => {
            const s = STATUS_COLORS[order.status];
            return (
              <TouchableOpacity key={order.id} style={styles.orderRow} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                  <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.orderPrice}>₱{order.total_price.toFixed(2)}</Text>
                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.badgeText, { color: s.text }]}>{order.status}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Marketplace')}>
          <Ionicons name="storefront-outline" size={20} color={colors.brand[700]} />
          <Text style={styles.actionText}>Browse marketplace</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={20} color={colors.brand[700]} />
          <Text style={styles.actionText}>View cart ({totalItems})</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.gray[900] },
  subtitle: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: spacing.xs, marginBottom: spacing.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: {
    width: '47%', backgroundColor: colors.white, borderRadius: 14, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  statValue: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.gray[900], marginTop: spacing.sm },
  statLabel: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2 },
  section: { marginTop: spacing.xxl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.gray[900] },
  seeAll: { fontSize: fontSize.sm, color: colors.brand[700], fontWeight: '600' },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    padding: spacing.lg, borderRadius: 12, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.sm, gap: spacing.sm,
  },
  orderId: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[900] },
  orderDate: { fontSize: fontSize.xs, color: colors.gray[400], marginTop: 1 },
  orderPrice: { fontSize: fontSize.sm, fontWeight: '700', color: colors.brand[700] },
  badge: { paddingHorizontal: spacing.sm + 2, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600', textTransform: 'capitalize' },
  emptyCard: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.xxl, alignItems: 'center', borderWidth: 1, borderColor: colors.gray[200] },
  emptyText: { fontSize: fontSize.sm, color: colors.gray[400] },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    padding: spacing.lg, borderRadius: 12, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.sm,
  },
  actionText: { flex: 1, fontSize: fontSize.md, color: colors.gray[700], marginLeft: spacing.md },
});
