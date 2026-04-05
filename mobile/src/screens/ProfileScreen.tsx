import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, fontSize } from '../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'admin' ? 'Admin' : 'Buyer'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>{user?.location || 'Not set'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: { alignItems: 'center', paddingVertical: spacing.xxxl, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.brand[100], alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.xxxl, fontWeight: '700', color: colors.brand[700] },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[900], marginTop: spacing.md },
  email: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: spacing.xs },
  roleBadge: { backgroundColor: colors.brand[50], paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 6, marginTop: spacing.sm },
  roleText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.brand[700] },
  section: { backgroundColor: colors.white, marginTop: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.gray[200] },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  infoLabel: { fontSize: fontSize.md, color: colors.gray[500] },
  infoValue: { fontSize: fontSize.md, fontWeight: '500', color: colors.gray[900] },
  divider: { height: 1, backgroundColor: colors.gray[100], marginHorizontal: spacing.xl },
  logoutButton: {
    marginHorizontal: spacing.xl, marginTop: spacing.xxxl,
    backgroundColor: colors.red[50], borderRadius: 12, paddingVertical: spacing.lg, alignItems: 'center',
    borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontSize: fontSize.md, fontWeight: '600', color: colors.red[500] },
});
