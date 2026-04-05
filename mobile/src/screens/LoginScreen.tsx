import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, fontSize } from '../constants/theme';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🌱</Text>
          </View>
          <Text style={styles.logoText}>
            Ani<Text style={styles.logoAccent}>Ko</Text>
          </Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your AniKo account</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.gray[400]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.gray[400]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>
            Don't have an account?{' '}
            <Text style={styles.linkBold}>Get started</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo accounts:</Text>
          <Text style={styles.demoText}>Admin: admin@aniko.ph / admin123</Text>
          <Text style={styles.demoText}>Buyer: ana@buyer.com / buyer123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  logoBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.brand[800], alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoIcon: { fontSize: 20 },
  logoText: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.brand[800] },
  logoAccent: { color: colors.amber[500] },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.gray[900], textAlign: 'center' },
  subtitle: { fontSize: fontSize.sm, color: colors.gray[500], textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xxl },
  form: {
    backgroundColor: colors.white, borderRadius: 16, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.lg,
  },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[700], marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200],
    borderRadius: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.gray[900], marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.brand[700], borderRadius: 10,
    paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  linkText: { textAlign: 'center', fontSize: fontSize.sm, color: colors.gray[500] },
  linkBold: { fontWeight: '600', color: colors.brand[800] },
  demoBox: {
    marginTop: spacing.xxl, backgroundColor: colors.gray[50],
    borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[100],
  },
  demoTitle: { fontSize: fontSize.xs, fontWeight: '600', color: colors.gray[500], marginBottom: spacing.sm },
  demoText: { fontSize: fontSize.xs, color: colors.gray[500], marginBottom: 2 },
});
