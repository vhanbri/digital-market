import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
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
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<{ orderId: string; total: number } | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const openCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert('Not signed in', 'Please log in to place an order.');
      return;
    }
    setDeliveryName(user?.name ?? '');
    setDeliveryAddress(user?.location ?? '');
    setDeliveryPhone(user?.phone ?? '');
    setDeliveryNotes('');
    setShowCheckout(true);
  };

  const handleConfirmOrder = async () => {
    if (!deliveryName.trim() || !deliveryAddress.trim() || !deliveryPhone.trim()) {
      Alert.alert('Missing Info', 'Please fill in your name, delivery address, and phone number.');
      return;
    }
    const digitsOnly = deliveryPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number (10-13 digits).');
      return;
    }
    try {
      setPlacing(true);
      const order = await placeOrder(
        items.map((i) => ({ crop_id: i.crop.id, quantity: i.quantity })),
        {
          name: deliveryName.trim(),
          address: deliveryAddress.trim(),
          phone: deliveryPhone.trim(),
          notes: deliveryNotes.trim() || undefined,
        },
      );
      const total = totalPrice;
      clearCart();
      setShowCheckout(false);
      setConfirmation({ orderId: order.id, total });
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
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.crop.id, item.quantity - 1)}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.crop.id, item.quantity + 1)}>
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
      {/* Confirmation Modal */}
      <Modal visible={!!confirmation} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Ionicons name="checkmark-circle" size={64} color={colors.brand[600]} />
            <Text style={styles.confirmTitle}>Order Accepted!</Text>
            <Text style={styles.confirmSub}>Your order was validated and automatically accepted.</Text>
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

      {/* Checkout Form Modal */}
      <Modal visible={showCheckout} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.checkoutOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.checkoutScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.checkoutCard}>
              <View style={styles.checkoutHeader}>
                <TouchableOpacity onPress={() => setShowCheckout(false)}>
                  <Ionicons name="arrow-back" size={22} color={colors.gray[700]} />
                </TouchableOpacity>
                <Text style={styles.checkoutTitle}>Delivery Information</Text>
              </View>

              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} value={deliveryName} onChangeText={setDeliveryName} placeholder="Your full name" placeholderTextColor={colors.gray[400]} />

              <Text style={styles.label}>Delivery Address *</Text>
              <TextInput style={[styles.input, styles.textArea]} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Complete delivery address" multiline numberOfLines={3} placeholderTextColor={colors.gray[400]} />

              <Text style={styles.label}>Phone Number *</Text>
              <TextInput style={styles.input} value={deliveryPhone} onChangeText={setDeliveryPhone} placeholder="e.g. 09171234567" keyboardType="phone-pad" placeholderTextColor={colors.gray[400]} />

              <Text style={styles.label}>Order Notes (optional)</Text>
              <TextInput style={[styles.input, styles.textArea]} value={deliveryNotes} onChangeText={setDeliveryNotes} placeholder="Special instructions..." multiline numberOfLines={2} placeholderTextColor={colors.gray[400]} />

              <View style={styles.checkoutSummary}>
                <Text style={styles.summaryLabel}>{totalItems} items</Text>
                <Text style={styles.summaryValue}>₱{totalPrice.toFixed(2)}</Text>
              </View>

              <TouchableOpacity style={[styles.orderButton, placing && styles.orderButtonDisabled]} onPress={handleConfirmOrder} disabled={placing}>
                {placing ? <ActivityIndicator color={colors.white} /> : <Text style={styles.orderButtonText}>Confirm Order</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmSecondary} onPress={() => setShowCheckout(false)}>
                <Text style={styles.confirmSecondaryText}>Back to Cart</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
            <TouchableOpacity style={styles.orderButton} onPress={openCheckout}>
              <Text style={styles.orderButtonText}>Proceed to Checkout</Text>
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
  footer: { backgroundColor: colors.white, padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.gray[200] },
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
  checkoutOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  checkoutScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  checkoutCard: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xxl, paddingBottom: spacing.xxxl + 20 },
  checkoutHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  checkoutTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[900] },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[700], marginBottom: spacing.xs },
  input: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.gray[900], marginBottom: spacing.lg },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  checkoutSummary: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray[200], marginTop: spacing.sm, marginBottom: spacing.lg },
  summaryLabel: { fontSize: fontSize.md, color: colors.gray[500] },
  summaryValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.brand[800] },
});
