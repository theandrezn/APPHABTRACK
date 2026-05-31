import { createClient } from '@supabase/supabase-js'

const fallbackSupabaseUrl = 'https://rbsrgfaqmpoidudpsqyd.supabase.co'
const fallbackSupabasePublishableKey = 'sb_publishable_FQC55-0wdb5gVGWK4yu5eg_rK-gSvYU'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? fallbackSupabaseUrl
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? fallbackSupabasePublishableKey

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
