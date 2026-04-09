import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getCrops } from '../services/crop.service';
import { useCart } from '../hooks/useCart';
import { colors, spacing, fontSize } from '../constants/theme';
import type { Crop } from '../types';
import type { BuyerTabParamList, AppStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BuyerTabParamList, 'Marketplace'>,
  NativeStackScreenProps<AppStackParamList>
>;

export default function MarketplaceScreen({ navigation }: Props) {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addItem } = useCart();

  const fetchCrops = useCallback(async () => {
    try {
      const result = await getCrops(1, search || undefined);
      setCrops(result.crops);
    } catch {
      // silently fail — user sees empty list
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCrops();
  };

  const handleAddToCart = (crop: Crop) => {
    addItem(crop, 1);
  };

  const renderCrop = ({ item }: { item: Crop }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CropDetail', { cropId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardImagePlaceholder}>
        <Text style={styles.cardEmoji}>🥬</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description || 'Fresh from Cebu farms'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>₱{item.price.toFixed(2)}</Text>
          <Text style={styles.cardStock}>
            {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, item.quantity === 0 && styles.addButtonDisabled]}
          onPress={() => handleAddToCart(item)}
          disabled={item.quantity === 0}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search produce..."
          placeholderTextColor={colors.gray[400]}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={crops}
        renderItem={renderCrop}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[600]} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No produce found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  searchBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  searchInput: {
    backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200],
    borderRadius: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.gray[900],
  },
  list: { padding: spacing.lg, gap: spacing.md },
  card: {
    backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.md,
  },
  cardImagePlaceholder: {
    height: 120, backgroundColor: colors.brand[50],
    alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji: { fontSize: 48 },
  cardBody: { padding: spacing.lg },
  cardName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.gray[900] },
  cardDesc: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: spacing.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  cardPrice: { fontSize: fontSize.lg, fontWeight: '700', color: colors.brand[700] },
  cardStock: { fontSize: fontSize.xs, color: colors.gray[400] },
  addButton: {
    backgroundColor: colors.brand[700], borderRadius: 10,
    paddingVertical: spacing.sm + 2, alignItems: 'center', marginTop: spacing.md,
  },
  addButtonDisabled: { backgroundColor: colors.gray[300] },
  addButtonText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '600' },
  emptyText: { fontSize: fontSize.md, color: colors.gray[400] },
});
