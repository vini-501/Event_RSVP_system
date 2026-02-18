import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || supabaseUrl === 'https://YOUR_PROJECT_ID.supabase.co') {
    console.error('[Supabase] ERROR: NEXT_PUBLIC_SUPABASE_URL is not configured!', supabaseUrl)
  }
  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
    console.error('[Supabase] ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured!')
  }

  console.log('[Supabase] Creating client with URL:', supabaseUrl?.substring(0, 30) + '...')

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
