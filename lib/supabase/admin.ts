import { Database } from '@/types/database.types';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { SupabaseCredentialsError } from './types';

/**
 * Creates a Supabase admin client with service role privileges
 * @returns A Supabase client with admin privileges
 * @throws {SupabaseCredentialsError} If Supabase credentials are missing
 */
export const createAdminClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new SupabaseCredentialsError('admin');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
};
