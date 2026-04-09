import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { placeOrder } from '../services/order.service';
import { colors, spacing, fontSize } from '../constants/theme';
import type { CartItem } from '../types';
import type { AppStackParamList } from '../navigation/types';

export default function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<{ orderId: string; total: number } | null>(null);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      Alert.alert('Not signed in', 'Please log in to place an order.');
      return;
    }
    if (items.length === 0) return;

    try {
      setPlacing(true);
      const order = await placeOrder(items.map((i) => ({ crop_id: i.crop.id, quantity: i.quantity })));
      const total = totalPrice;
      clearCart();
      setConfirmation({ orderId: order.id ?? '', total });
    } catch (err: any) {
      Alert.alert('Order Failed', err.message || 'Something went wrong.');
    } finally {
      setPlacing(false);
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardName}>{item.crop.name}</Text>
        <Text style={styles.cardPrice}>₱{item.crop.price.toFixed(2)} each</Text>
      </View>
      <View style={styles.cardRight}>
        <View style={styles.qtyControls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.crop.id, item.quantity - 1)}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.crop.id, item.quantity + 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.lineTotal}>₱{(item.crop.price * item.quantity).toFixed(2)}</Text>
        <TouchableOpacity onPress={() => removeItem(item.crop.id)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Modal visible={!!confirmation} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Ionicons name="checkmark-circle" size={64} color={colors.brand[600]} />
            <Text style={styles.confirmTitle}>Order Placed!</Text>
            <Text style={styles.confirmSub}>Your order has been submitted successfully.</Text>
            {confirmation && (
              <Text style={styles.confirmTotal}>Total: ₱{confirmation.total.toFixed(2)}</Text>
            )}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                const id = confirmation?.orderId;
                setConfirmation(null);
                if (id) navigation.navigate('OrderDetail', { orderId: id });
              }}
            >
              <Text style={styles.confirmBtnText}>View Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmSecondary} onPress={() => setConfirmation(null)}>
              <Text style={styles.confirmSecondaryText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Browse the marketplace to add produce</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.crop.id}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₱{totalPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.orderButton, placing && styles.orderButtonDisabled]}
              onPress={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.orderButtonText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[900] },
  emptyText: { fontSize: fontSize.sm, color: colors.gray[400], marginTop: spacing.sm },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.gray[200],
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md,
  },
  cardLeft: { flex: 1, marginRight: spacing.lg },
  cardName: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[900] },
  cardPrice: { fontSize: fontSize.sm, color: colors.gray[400], marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[700] },
  qtyValue: { fontSize: fontSize.md, fontWeight: '700', color: colors.gray[900], minWidth: 24, textAlign: 'center' },
  lineTotal: { fontSize: fontSize.md, fontWeight: '700', color: colors.brand[700], marginTop: spacing.sm },
  removeText: { fontSize: fontSize.xs, color: colors.red[500], marginTop: spacing.xs },
  footer: {
    backgroundColor: colors.white, padding: spacing.xl,
    borderTopWidth: 1, borderTopColor: colors.gray[200],
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  totalLabel: { fontSize: fontSize.lg, fontWeight: '600', color: colors.gray[700] },
  totalValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.brand[800] },
  orderButton: { backgroundColor: colors.brand[700], borderRadius: 12, paddingVertical: spacing.lg, alignItems: 'center' },
  orderButtonDisabled: { opacity: 0.6 },
  orderButtonText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  confirmCard: { backgroundColor: colors.white, borderRadius: 20, padding: spacing.xxxl, alignItems: 'center', width: '100%' },
  confirmTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.gray[900], marginTop: spacing.lg },
  confirmSub: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: spacing.sm, textAlign: 'center' },
  confirmTotal: { fontSize: fontSize.lg, fontWeight: '700', color: colors.brand[700], marginTop: spacing.lg },
  confirmBtn: { backgroundColor: colors.brand[700], borderRadius: 12, paddingVertical: spacing.lg, paddingHorizontal: spacing.xxxl, marginTop: spacing.xl, width: '100%', alignItems: 'center' },
  confirmBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' },
  confirmSecondary: { marginTop: spacing.md, paddingVertical: spacing.md },
  confirmSecondaryText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[500] },
});
