import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getMyOrders } from '../services/order.service';
import { colors, spacing, fontSize } from '../constants/theme';
import type { Order, OrderStatus } from '../types';
import type { AppStackParamList } from '../navigation/types';

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  accepted: { bg: '#dbeafe', text: '#1e40af' },
  rejected: { bg: '#fef2f2', text: '#991b1b' },
  delivered: { bg: '#dcfce7', text: '#166534' },
};

export default function OrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const renderOrder = ({ item }: { item: Order }) => {
    const statusStyle = STATUS_COLORS[item.status];
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>₱{item.total_price.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Placed</Text>
            <Text style={styles.detailValue}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={colors.brand[600]} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Place your first order from the marketplace</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.md, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  orderId: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[900] },
  badge: { paddingHorizontal: spacing.sm + 2, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  cardBody: { padding: spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  detailLabel: { fontSize: fontSize.sm, color: colors.gray[400] },
  detailValue: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[700] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[900] },
  emptyText: { fontSize: fontSize.sm, color: colors.gray[400], marginTop: spacing.sm },
});
