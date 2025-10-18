import { Suspense } from 'react';

import Link from 'next/link';

import LoginForm from '@/components/forms/login-form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Logo from '@/components/ui/logo';
import Prose from '@/components/ui/prose';
import { Skeleton } from '@/components/ui/skeleton';

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function Login() {
  return (
    <div className="w-full max-w-md">
      <Prose className="mb-8 text-center">
        <Logo className="mx-auto h-12 w-12" aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Sign in to your account</h1>
        <p className="mt-2 text-sm">
          Or{' '}
          <Link
            href="/register"
            className="text-primary hover:text-primary/90 ml-2 font-medium transition-colors">
            start your 14-day free trial
          </Link>
        </p>
      </Prose>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex justify-center border-t px-6 py-4">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-900">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-gray-900">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
