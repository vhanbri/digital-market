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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUsers, deleteUser } from '../../services/admin.service';
import { colors, spacing, fontSize } from '../../constants/theme';
import type { User, UserRole } from '../../types';

const ROLE_FILTERS: (UserRole | null)[] = [null, 'buyer', 'admin'];

const ROLE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  buyer: { bg: '#dbeafe', text: '#1e40af' },
  admin: { bg: '#dcfce7', text: '#166534' },
  farmer: { bg: '#fef3c7', text: '#92400e' },
};

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | null>(null);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers(roleFilter ?? undefined);
      setUsers(data);
    } catch { /* empty */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = search
    ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  const handleDelete = (user: User) => {
    if (user.role === 'admin') {
      Alert.alert('Cannot Delete', 'Admin accounts cannot be deleted.');
      return;
    }
    Alert.alert('Delete User', `Remove "${user.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(user.id);
            setRefreshing(true);
            fetchUsers();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }: { item: User }) => {
    const badge = ROLE_BADGE_COLORS[item.role] ?? ROLE_BADGE_COLORS.buyer;
    return (
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm }}>
            <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.roleBadgeText, { color: badge.text }]}>{item.role}</Text>
            </View>
            {item.location && <Text style={styles.location}>{item.location}</Text>}
          </View>
        </View>
        {item.role !== 'admin' && (
          <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={18} color={colors.red[500]} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={colors.gray[400]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        {ROLE_FILTERS.map((r) => (
          <TouchableOpacity
            key={r ?? 'all'}
            style={[styles.filterChip, roleFilter === r && styles.filterChipActive]}
            onPress={() => { setRoleFilter(r); setLoading(true); }}
          >
            <Text style={[styles.filterText, roleFilter === r && styles.filterTextActive]}>
              {r ? r.charAt(0).toUpperCase() + r.slice(1) : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} tintColor={colors.brand[600]} />}
        ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No users found</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  topBar: { padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  searchInput: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.gray[900] },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.white, gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: 8, backgroundColor: colors.gray[100] },
  filterChipActive: { backgroundColor: colors.brand[700] },
  filterText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.gray[600] },
  filterTextActive: { color: colors.white },
  list: { padding: spacing.lg },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.md },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand[100], alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.brand[700] },
  cardInfo: { flex: 1 },
  userName: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[900] },
  userEmail: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: 1 },
  roleBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4 },
  roleBadgeText: { fontSize: fontSize.xs, fontWeight: '600', textTransform: 'capitalize' },
  location: { fontSize: fontSize.xs, color: colors.gray[400] },
  deleteIcon: { padding: spacing.sm },
  emptyText: { fontSize: fontSize.md, color: colors.gray[400] },
});
