import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  try {
    const { email, password } = await request.json()
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!cleanEmail.includes('@')) {
      return json({ error: 'Invalid e-mail.' }, 400)
    }

    if (typeof password !== 'string' || password.length < 6) {
      return json({ error: 'Password must have at least 6 characters.' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Supabase admin environment is not configured.' }, 500)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        app: 'habit-game',
      },
    })

    if (error) {
      const status = error.message.toLowerCase().includes('already') ? 409 : 400
      return json({ error: error.message }, status)
    }

    return json({ userId: data.user?.id ?? null }, 200)
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}
