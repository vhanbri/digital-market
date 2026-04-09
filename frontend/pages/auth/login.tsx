import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Sprout, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const router = useRouter();
  const redirect = router.query.redirect as string | undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password, redirect);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800">
              <Sprout size={22} className="text-white" />
            </span>
            <span className="text-2xl font-bold text-brand-800">Ani<span className="text-amber-500">Ko</span></span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your AniKo account
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-6"
        >
          <FormInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-brand-800 hover:underline"
          >
            Get started
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
