import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  const { userId } = await request.json()
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}