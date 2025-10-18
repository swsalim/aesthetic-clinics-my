/**
 * Supabase client utilities for Next.js
 * This is the main export file that applications should import from
 */

// Export clients
export { createAdminClient } from './supabase/admin';
export { createClient as createBrowserClient } from './supabase/client';
export { createClient as createMiddlewareClient } from './supabase/middleware';
export { createClient as createServerClient } from './supabase/server';

// Export types
export type { CookieOptions, MiddlewareClientResult } from './supabase/types';
export { SupabaseCredentialsError } from './supabase/types';
