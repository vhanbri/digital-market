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
import { getAdminStats, AdminStats } from '../../services/admin.service';
import { colors, spacing, fontSize } from '../../constants/theme';

interface StatCardProps {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

function StatCard({ label, value, icon, color, onPress }: StatCardProps) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand[600]} /></View>;
  }

  const completionRate = stats && stats.totalOrders > 0
    ? Math.round(((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor={colors.brand[600]} />}
    >
      <Text style={styles.greeting}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Platform overview at a glance</Text>

      <View style={styles.grid}>
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon="people" color={colors.brand[600]} onPress={() => navigation.navigate('AdminUsers')} />
        <StatCard label="Buyers" value={stats?.buyers ?? 0} icon="person" color={colors.blue[500]} />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon="receipt" color={colors.amber[500]} onPress={() => navigation.navigate('AdminOrders')} />
        <StatCard label="Pending" value={stats?.pendingOrders ?? 0} icon="time" color="#f97316" onPress={() => navigation.navigate('AdminOrders')} />
        <StatCard label="Listings" value={stats?.totalCrops ?? 0} icon="leaf" color={colors.brand[700]} onPress={() => navigation.navigate('AdminListings')} />
        <StatCard label="Completion" value={completionRate} icon="checkmark-circle" color={colors.brand[500]} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('AdminOrders')}>
          <Ionicons name="receipt-outline" size={20} color={colors.brand[700]} />
          <Text style={styles.actionText}>Manage orders</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('AdminListings')}>
          <Ionicons name="leaf-outline" size={20} color={colors.brand[700]} />
          <Text style={styles.actionText}>Manage listings</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('AdminUsers')}>
          <Ionicons name="people-outline" size={20} color={colors.brand[700]} />
          <Text style={styles.actionText}>Manage users</Text>
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
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  statValue: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.gray[900] },
  statLabel: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2 },
  section: { marginTop: spacing.xxl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.gray[900], marginBottom: spacing.md },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    padding: spacing.lg, borderRadius: 12, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.sm,
  },
  actionText: { flex: 1, fontSize: fontSize.md, color: colors.gray[700], marginLeft: spacing.md },
});
