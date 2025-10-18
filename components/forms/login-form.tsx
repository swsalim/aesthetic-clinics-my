'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client';
import { absoluteUrl } from '@/lib/utils';

import { Checkbox } from '@/components/form-fields/checkbox';
import { Input } from '@/components/form-fields/input';
import { Button } from '@/components/ui/button';

interface AuthError {
  message: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams?.get('redirectedFrom');
  const supabase: SupabaseClient = createClient();

  // Creating URL safely with optional chaining to avoid null errors
  const redirectUrl = new URL(
    '/auth/callback',
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL,
  );
  if (redirectedFrom) {
    redirectUrl.searchParams.set('redirectedFrom', redirectedFrom);
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: absoluteUrl('/api/auth/callback'),
        },
      });

      if (error) throw error;
    } catch (error) {
      const e = error as AuthError;
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: absoluteUrl('/api/auth/callback'),
        },
      });

      if (error) throw error;

      router.push('/check-your-email');
    } catch (error) {
      const e = error as AuthError;
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push(redirectedFrom || '/dashboard');
    } catch (error) {
      const e = error as AuthError;
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="outline"
          className="flex w-full items-center justify-center"
          onClick={handleGoogleLogin}
          disabled={isLoading}>
          <span className="flex items-center">
            Continue with <span className="ml-1 mr-2">Google</span>
            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 30 30">
              <path d="M 15.003906 3 C 8.3749062 3 3 8.373 3 15 C 3 21.627 8.3749062 27 15.003906 27 C 25.013906 27 27.269078 17.707 26.330078 13 L 25 13 L 22.732422 13 L 15 13 L 15 17 L 22.738281 17 C 21.848702 20.448251 18.725955 23 15 23 C 10.582 23 7 19.418 7 15 C 7 10.582 10.582 7 15 7 C 17.009 7 18.839141 7.74575 20.244141 8.96875 L 23.085938 6.1289062 C 20.951937 4.1849063 18.116906 3 15.003906 3 z" />
            </svg>
          </span>
        </Button>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{error}</div>}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="text-sm">
              <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Forgot your password?
              </a>
            </div>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-me" name="remember-me" />
            <label htmlFor="remember-me" className="text-sm">
              Remember me
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={handleSignUp}
            disabled={isLoading}>
            Sign up
          </Button>
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={handleSignIn}
            disabled={isLoading}>
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
