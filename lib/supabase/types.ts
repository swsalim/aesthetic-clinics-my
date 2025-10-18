import type { NextResponse } from 'next/server';

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cookie options for Supabase authentication
 */
export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Result of creating a Supabase client in middleware
 */
export interface MiddlewareClientResult {
  supabase: SupabaseClient;
  response: NextResponse;
}

/**
 * Error thrown when Supabase credentials are missing
 */
export class SupabaseCredentialsError extends Error {
  constructor(clientType: string) {
    super(`Missing Supabase ${clientType} credentials`);
    this.name = 'SupabaseCredentialsError';
  }
}
