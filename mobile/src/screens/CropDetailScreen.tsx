import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getCropById } from '../services/crop.service';
import { useCart } from '../hooks/useCart';
import { colors, spacing, fontSize } from '../constants/theme';
import type { Crop } from '../types';
import type { AppStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'CropDetail'>;

export default function CropDetailScreen({ route, navigation }: Props) {
  const { cropId } = route.params;
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    getCropById(cropId)
      .then(setCrop)
      .catch(() => Alert.alert('Error', 'Failed to load crop details'))
      .finally(() => setLoading(false));
  }, [cropId]);

  const handleAdd = () => {
    if (!crop) return;
    addItem(crop, qty);
    Alert.alert('Added to Cart', `${qty}x ${crop.name} added.`);
    navigation.goBack();
  };

  if (loading || !crop) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.emoji}>🥬</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{crop.name}</Text>
        <Text style={styles.price}>₱{crop.price.toFixed(2)}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Stock</Text>
            <Text style={styles.metaValue}>{crop.quantity} available</Text>
          </View>
          {crop.harvest_date && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Harvest</Text>
              <Text style={styles.metaValue}>{crop.harvest_date}</Text>
            </View>
          )}
        </View>

        <Text style={styles.descTitle}>Description</Text>
        <Text style={styles.desc}>{crop.description || 'Fresh produce sourced from Cebu farms.'}</Text>

        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.min(crop.quantity, qty + 1))}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, crop.quantity === 0 && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={crop.quantity === 0}
        >
          <Text style={styles.addButtonText}>
            {crop.quantity === 0 ? 'Out of Stock' : `Add to Cart — ₱${(crop.price * qty).toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { paddingBottom: spacing.xxxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholder: { height: 220, backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 80 },
  body: { padding: spacing.xl },
  name: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.gray[900] },
  price: { fontSize: fontSize.xl, fontWeight: '700', color: colors.brand[700], marginTop: spacing.sm },
  metaRow: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.xxl },
  metaItem: {},
  metaLabel: { fontSize: fontSize.xs, color: colors.gray[400], textTransform: 'uppercase', fontWeight: '600' },
  metaValue: { fontSize: fontSize.md, color: colors.gray[700], marginTop: 2 },
  descTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[900], marginTop: spacing.xxl },
  desc: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: spacing.sm, lineHeight: 22 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xxl },
  qtyLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[700] },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  qtyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.gray[700] },
  qtyValue: { fontSize: fontSize.lg, fontWeight: '700', color: colors.gray[900], minWidth: 28, textAlign: 'center' },
  addButton: { backgroundColor: colors.brand[700], borderRadius: 12, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xxl },
  addButtonDisabled: { backgroundColor: colors.gray[300] },
  addButtonText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' },
});
