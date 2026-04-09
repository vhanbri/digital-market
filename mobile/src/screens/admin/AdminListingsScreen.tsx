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
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getCrops, createCrop, updateCrop, deleteCrop } from '../../services/crop.service';
import { colors, spacing, fontSize } from '../../constants/theme';
import type { Crop } from '../../types';

export default function AdminListingsScreen() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [formModal, setFormModal] = useState<{ mode: 'create' | 'edit'; crop?: Crop } | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQty, setFormQty] = useState('');
  const [formHarvest, setFormHarvest] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const fetchCrops = useCallback(async () => {
    try {
      const result = await getCrops(1, search || undefined);
      setCrops(result.crops);
    } catch { /* empty */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);

  const openCreate = () => {
    setFormName(''); setFormPrice(''); setFormQty(''); setFormHarvest(''); setFormDesc('');
    setFormModal({ mode: 'create' });
  };

  const openEdit = (crop: Crop) => {
    setFormName(crop.name);
    setFormPrice(String(crop.price));
    setFormQty(String(crop.quantity));
    setFormHarvest(crop.harvest_date ?? '');
    setFormDesc(crop.description ?? '');
    setFormModal({ mode: 'edit', crop });
  };

  const handleSave = async () => {
    if (!formName || !formPrice || !formQty) {
      Alert.alert('Error', 'Name, price, and quantity are required.');
      return;
    }
    try {
      setSaving(true);
      const input = {
        name: formName,
        price: parseFloat(formPrice),
        quantity: parseInt(formQty, 10),
        harvest_date: formHarvest || undefined,
        description: formDesc || undefined,
      };
      if (formModal?.mode === 'create') {
        await createCrop(input);
      } else if (formModal?.crop) {
        await updateCrop(formModal.crop.id, input);
      }
      setFormModal(null);
      setRefreshing(true);
      fetchCrops();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (crop: Crop) => {
    Alert.alert('Delete Listing', `Remove "${crop.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteCrop(crop.id);
            setRefreshing(true);
            fetchCrops();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const renderCrop = ({ item }: { item: Crop }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.cropName}>{item.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cropPrice}>₱{item.price.toFixed(2)}</Text>
          <Text style={[styles.cropStock, item.quantity === 0 && styles.cropStockOut]}>
            {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings..."
          placeholderTextColor={colors.gray[400]}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={crops}
        renderItem={renderCrop}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCrops(); }} tintColor={colors.brand[600]} />}
        ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No listings found</Text></View>}
      />

      <Modal visible={!!formModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{formModal?.mode === 'create' ? 'New Listing' : 'Edit Listing'}</Text>

              <Text style={styles.label}>Name *</Text>
              <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Crop name" placeholderTextColor={colors.gray[400]} />

              <Text style={styles.label}>Price *</Text>
              <TextInput style={styles.input} value={formPrice} onChangeText={setFormPrice} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor={colors.gray[400]} />

              <Text style={styles.label}>Quantity *</Text>
              <TextInput style={styles.input} value={formQty} onChangeText={setFormQty} placeholder="0" keyboardType="number-pad" placeholderTextColor={colors.gray[400]} />

              <Text style={styles.label}>Harvest Date</Text>
              <TextInput style={styles.input} value={formHarvest} onChangeText={setFormHarvest} placeholder="YYYY-MM-DD" placeholderTextColor={colors.gray[400]} />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formDesc} onChangeText={setFormDesc} placeholder="Description..." multiline numberOfLines={3} placeholderTextColor={colors.gray[400]} />

              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>{formModal?.mode === 'create' ? 'Create Listing' : 'Save Changes'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setFormModal(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  topBar: { flexDirection: 'row', padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[200], gap: spacing.sm },
  searchInput: { flex: 1, backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.gray[900] },
  addBtn: { backgroundColor: colors.brand[700], borderRadius: 10, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  addBtnText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '700' },
  list: { padding: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.md, overflow: 'hidden' },
  cardBody: { padding: spacing.lg },
  cropName: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[900] },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  cropPrice: { fontSize: fontSize.md, fontWeight: '700', color: colors.brand[700] },
  cropStock: { fontSize: fontSize.sm, color: colors.gray[400] },
  cropStockOut: { color: colors.red[500] },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.gray[100] },
  editBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.gray[100] },
  editBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.brand[700] },
  deleteBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  deleteBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.red[500] },
  emptyText: { fontSize: fontSize.md, color: colors.gray[400] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xxl, paddingBottom: spacing.xxxl + 20 },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[900], marginBottom: spacing.xl },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[700], marginBottom: spacing.xs },
  input: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.gray[900], marginBottom: spacing.lg },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: colors.brand[700], borderRadius: 10, paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.sm },
  saveBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  cancelBtn: { marginTop: spacing.md, paddingVertical: spacing.md, alignItems: 'center' },
  cancelBtnText: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[500] },
});
