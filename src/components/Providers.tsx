'use client';
import { useEffect } from 'react';
import { AuthProvider } from '@/lib/auth';
import InstallPrompt from './InstallPrompt';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return <AuthProvider>{children}<InstallPrompt /></AuthProvider>;
}
