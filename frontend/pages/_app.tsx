import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { CartProvider } from '../hooks/useCart';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: '14px', borderRadius: '12px' },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <Component {...pageProps} />
      </CartProvider>
    </AuthProvider>
  );
}
