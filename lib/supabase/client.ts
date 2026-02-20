import { createBrowserClient } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (browserClient) {
    return browserClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || supabaseUrl === 'https://YOUR_PROJECT_ID.supabase.co') {
    console.error('[Supabase] ERROR: NEXT_PUBLIC_SUPABASE_URL is not configured!', supabaseUrl)
  }
  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
    console.error('[Supabase] ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured!')
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}
