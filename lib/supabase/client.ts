import { Database } from '@/types/database.types';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { SupabaseCredentialsError } from './types';

/**
 * Creates a Supabase client for browser environments
 * @returns A Supabase client configured for browser use
 * @throws {SupabaseCredentialsError} If Supabase credentials are missing
 */
export const createClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseCredentialsError('client');
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};

// TODO: Remove this function once we have a better way to approve clinics
/**
 * Approves a clinic by moving it from the to_be_reviewed_clinics table to the clinics table
 * and updates the review status to approved in a single transaction
 * @param clinicId - The ID of the clinic to approve
 * @returns The ID of the newly created clinic or null if operation fails
 */
export const approveClinic = async (
  clinicId: number,
): Promise<{
  data: { id: number } | null;
  error: Error | null;
}> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc('approve_clinic', {
        to_be_reviewed_clinic_id_param: clinicId,
      })
      .single();

    if (error) throw error;

    return {
      data: data ? { id: data as number } : null,
      error: null,
    };
  } catch (error) {
    console.error(`Error approving clinic with ID "${clinicId}":`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
