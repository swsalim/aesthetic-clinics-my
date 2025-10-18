import { cookies } from 'next/headers';

import { Database } from '@/types/database.types';
import {
  type CookieMethodsServerDeprecated,
  type CookieOptions,
  createServerClient,
} from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { SupabaseCredentialsError } from './types';

/**
 * Creates a Supabase client for server environments
 * @returns A Supabase client configured for server-side rendering
 * @throws {SupabaseCredentialsError} If Supabase credentials are missing
 */
export async function createClient(): Promise<SupabaseClient<Database, 'public'>> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseCredentialsError('server');
  }

  const cookieMethods: CookieMethodsServerDeprecated = {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value, ...options });
      } catch {
        // The `set` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
      }
    },
    remove(name: string, options: Pick<CookieOptions, 'path' | 'domain'>) {
      try {
        cookieStore.set({ name, value: '', ...options });
      } catch {
        // The `delete` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
      }
    },
  };

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}
