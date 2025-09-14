
'use client';

import { useAuth } from '@/providers/auth/authProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // 🚨 redirect if not logged in
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null; // Prevent flash

  return <div>Welcome, {user.email}!</div>;
}