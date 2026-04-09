import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getMyOrders, getOrderItems } from '../services/order.service';
import { colors, spacing, fontSize } from '../constants/theme';
import type { Order, OrderItem, OrderStatus } from '../types';
import type { AppStackParamList } from '../navigation/types';

const STEPS: { status: OrderStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { status: 'pending', label: 'Placed', icon: 'receipt-outline' },
  { status: 'accepted', label: 'Accepted', icon: 'checkmark-circle-outline' },
  { status: 'delivered', label: 'Delivered', icon: 'cube-outline' },
];

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  accepted: { bg: '#dbeafe', text: '#1e40af' },
  rejected: { bg: '#fef2f2', text: '#991b1b' },
  delivered: { bg: '#dcfce7', text: '#166534' },
};

function getStepIndex(status: OrderStatus): number {
  if (status === 'rejected') return -1;
  return STEPS.findIndex((s) => s.status === status);
}

export default function OrderDetailScreen() {
  const route = useRoute<RouteProp<AppStackParamList, 'OrderDetail'>>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [allOrders, orderItems] = await Promise.all([
        getMyOrders(),
        getOrderItems(orderId),
      ]);
      const found = allOrders.find((o) => o.id === orderId) ?? null;
      setOrder(found);
      setItems(orderItems);
    } catch { /* empty */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  if (!order) {
    return <View style={styles.center}><Text style={styles.errorText}>Order not found</Text></View>;
  }

  const currentStep = getStepIndex(order.status);
  const isRejected = order.status === 'rejected';
  const s = STATUS_COLORS[order.status];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.brand[600]} />}
    >
      <View style={styles.headerCard}>
        <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
        <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.text }]}>{order.status}</Text>
        </View>
      </View>

      {!isRejected ? (
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Order Progress</Text>
          <View style={styles.progressTrack}>
            {STEPS.map((step, idx) => {
              const isActive = idx <= currentStep;
              const isLast = idx === STEPS.length - 1;
              return (
                <View key={step.status} style={styles.step}>
                  <View style={styles.stepIndicator}>
                    <View style={[styles.stepCircle, isActive && styles.stepCircleActive]}>
                      <Ionicons name={step.icon} size={16} color={isActive ? colors.white : colors.gray[400]} />
                    </View>
                    {!isLast && <View style={[styles.stepLine, isActive && idx < currentStep && styles.stepLineActive]} />}
                  </View>
                  <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={[styles.progressCard, { backgroundColor: colors.red[50] }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="close-circle" size={22} color={colors.red[500]} />
            <Text style={[styles.cardTitle, { color: colors.red[500] }]}>Order Rejected</Text>
          </View>
        </View>
      )}

      {(order.delivery_name || order.delivery_address || order.delivery_phone) && (
        <View style={styles.deliveryCard}>
          <Text style={styles.cardTitle}>Delivery Information</Text>
          {order.delivery_name && (
            <View style={styles.deliveryRow}>
              <Ionicons name="person-outline" size={16} color={colors.gray[400]} />
              <Text style={styles.deliveryText}>{order.delivery_name}</Text>
            </View>
          )}
          {order.delivery_address && (
            <View style={styles.deliveryRow}>
              <Ionicons name="location-outline" size={16} color={colors.gray[400]} />
              <Text style={styles.deliveryText}>{order.delivery_address}</Text>
            </View>
          )}
          {order.delivery_phone && (
            <View style={styles.deliveryRow}>
              <Ionicons name="call-outline" size={16} color={colors.gray[400]} />
              <Text style={styles.deliveryText}>{order.delivery_phone}</Text>
            </View>
          )}
          {order.delivery_notes && (
            <View style={styles.deliveryRow}>
              <Ionicons name="document-text-outline" size={16} color={colors.gray[400]} />
              <Text style={[styles.deliveryText, { fontStyle: 'italic', color: colors.gray[500] }]}>{order.delivery_notes}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.itemsCard}>
        <Text style={styles.cardTitle}>Items ({items.length})</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.crops?.name ?? 'Unknown crop'}</Text>
              <Text style={styles.itemMeta}>Qty: {item.quantity} x ₱{item.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.itemTotal}>₱{(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₱{order.total_price.toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: fontSize.md, color: colors.gray[400] },

  headerCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: spacing.xxl,
    borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.lg, alignItems: 'center',
  },
  orderId: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[900] },
  orderDate: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: spacing.xs },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 8, marginTop: spacing.md },
  badgeText: { fontSize: fontSize.sm, fontWeight: '700', textTransform: 'capitalize' },

  progressCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: spacing.xxl,
    borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.gray[900], marginBottom: spacing.lg },
  progressTrack: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { alignItems: 'center', flex: 1 },
  stepIndicator: { alignItems: 'center', flexDirection: 'row' },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[200],
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  stepCircleActive: { backgroundColor: colors.brand[600] },
  stepLine: { position: 'absolute', left: 36, top: 16, height: 3, width: 60, backgroundColor: colors.gray[200] },
  stepLineActive: { backgroundColor: colors.brand[600] },
  stepLabel: { fontSize: fontSize.xs, color: colors.gray[400], marginTop: spacing.sm },
  stepLabelActive: { color: colors.brand[700], fontWeight: '600' },

  deliveryCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: spacing.xxl,
    borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.lg,
  },
  deliveryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  deliveryText: { fontSize: fontSize.sm, color: colors.gray[700], flex: 1 },

  itemsCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: spacing.xxl,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  itemName: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[900] },
  itemMeta: { fontSize: fontSize.sm, color: colors.gray[400], marginTop: 2 },
  itemTotal: { fontSize: fontSize.md, fontWeight: '700', color: colors.brand[700] },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.lg, marginTop: spacing.sm,
  },
  totalLabel: { fontSize: fontSize.lg, fontWeight: '600', color: colors.gray[700] },
  totalValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.brand[800] },
});
