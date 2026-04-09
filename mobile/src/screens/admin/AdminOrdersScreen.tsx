import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAdminOrders } from '../../services/admin.service';
import { updateOrderStatus } from '../../services/order.service';
import { colors, spacing, fontSize } from '../../constants/theme';
import type { Order, OrderStatus } from '../../types';
import type { AppStackParamList } from '../../navigation/types';

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  accepted: { bg: '#dbeafe', text: '#1e40af' },
  rejected: { bg: '#fef2f2', text: '#991b1b' },
  delivered: { bg: '#dcfce7', text: '#166534' },
};

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'accepted', 'rejected', 'delivered'];

export default function AdminOrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | null>(null);
  const [statusModal, setStatusModal] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getAdminOrders();
      setOrders(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleUpdateStatus = async (order: Order, newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      setStatusModal(null);
      setRefreshing(true);
      fetchOrders();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const s = STATUS_COLORS[item.status];
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.price}>₱{item.total_price.toFixed(2)}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.updateBtn} onPress={() => setStatusModal(item)}>
          <Text style={styles.updateBtnText}>Update Status</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollableFilters filter={filter} setFilter={setFilter} counts={statusCounts} />

      <FlatList
        data={filtered}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={colors.brand[600]} />}
        ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No orders found</Text></View>}
      />

      <Modal visible={!!statusModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            <Text style={styles.modalSub}>#{statusModal?.id.slice(0, 8)}</Text>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusOption, statusModal?.status === s && styles.statusOptionActive]}
                onPress={() => statusModal && handleUpdateStatus(statusModal, s)}
                disabled={updating}
              >
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[s].text }]} />
                <Text style={styles.statusOptionText}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStatusModal(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            {updating && <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.brand[600]} />}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ScrollableFilters({ filter, setFilter, counts }: { filter: OrderStatus | null; setFilter: (f: OrderStatus | null) => void; counts: Record<string, number> }) {
  return (
    <View style={styles.filterRow}>
      <TouchableOpacity style={[styles.filterChip, !filter && styles.filterChipActive]} onPress={() => setFilter(null)}>
        <Text style={[styles.filterText, !filter && styles.filterTextActive]}>All</Text>
      </TouchableOpacity>
      {STATUS_OPTIONS.map((s) => (
        <TouchableOpacity key={s} style={[styles.filterChip, filter === s && styles.filterChipActive]} onPress={() => setFilter(filter === s ? null : s)}>
          <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{s} ({counts[s] || 0})</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  list: { padding: spacing.lg },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[200], gap: spacing.sm, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: 8, backgroundColor: colors.gray[100] },
  filterChipActive: { backgroundColor: colors.brand[700] },
  filterText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.gray[600], textTransform: 'capitalize' },
  filterTextActive: { color: colors.white },
  card: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.md, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  orderId: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[900] },
  badge: { paddingHorizontal: spacing.sm + 2, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600', textTransform: 'capitalize' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  price: { fontSize: fontSize.md, fontWeight: '700', color: colors.brand[700] },
  date: { fontSize: fontSize.sm, color: colors.gray[400] },
  updateBtn: { borderTopWidth: 1, borderTopColor: colors.gray[100], paddingVertical: spacing.md, alignItems: 'center' },
  updateBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.brand[700] },
  emptyText: { fontSize: fontSize.md, color: colors.gray[400] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xxl, paddingBottom: spacing.xxxl + 20 },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[900] },
  modalSub: { fontSize: fontSize.sm, color: colors.gray[400], marginBottom: spacing.xl },
  statusOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 10, marginBottom: spacing.sm },
  statusOptionActive: { backgroundColor: colors.gray[100] },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  statusOptionText: { fontSize: fontSize.md, fontWeight: '500', color: colors.gray[700] },
  cancelBtn: { marginTop: spacing.md, paddingVertical: spacing.md, alignItems: 'center' },
  cancelBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[500] },
});
