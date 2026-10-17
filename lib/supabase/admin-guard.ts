/**
 * True when the server can construct a service-role client.
 * Static generation in environments without secrets should render empty
 * shells instead of failing the build.
 */
export function hasAdminCredentials(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
