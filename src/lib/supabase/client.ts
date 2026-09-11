import { createBrowserClient } from '@supabase/ssr'
import { assert } from '../assert'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? ''
  
  assert(url, "A supabase url was not configured via environment variable.");
  assert(key, "No supabase key was provided via the environment variables.");

  return createBrowserClient(url, key);
}
