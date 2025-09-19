'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth/authProvider';

export default function AuthForm() {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) setError(error.message);
        else setSuccess('Check your email to confirm your account!');
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
        else setSuccess('Logged in successfully!');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Loading...' : (mode === 'login' ? 'Login' : 'Sign Up')}
        </Button>
      </form>

      <div className="mt-4 text-center">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              className="text-blue-600 underline"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccess(null);
              }}
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              className="text-blue-600 underline"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccess(null);
              }}
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
