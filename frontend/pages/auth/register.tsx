import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Sprout, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        name,
        email,
        password,
        role: 'buyer',
        location: location || undefined,
        phone: phone || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800">
              <Sprout size={22} className="text-white" />
            </span>
            <span className="text-2xl font-bold text-brand-800">Ani<span className="text-amber-500">Ko</span></span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Join AniKo to start ordering fresh, Cebu-sourced produce
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
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
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
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <FormInput
            label="Location"
            placeholder="City or region (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <FormInput
            label="Phone Number"
            type="tel"
            placeholder="e.g. 09171234567 (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-brand-800 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
