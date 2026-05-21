import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // gunakan service role untuk akses admin
  )

  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]

  // Ambil semua user
  const { data: users } = await supabase.from('users').select('id, email')

  for (let user of users) {
    const { data: kas } = await supabase
      .from('kas')
      .select('status_pembayaran')
      .eq('user_id', user.id)
      .eq('bulan', monthStart)
      .single()

    if (!kas || kas.status_pembayaran !== 'lunas') {
      // Simpan notifikasi peringatan
      await supabase.from('notifications').insert({
        user_id: user.id,
        pesan: 'Peringatan: Anda belum melunasi kas bulan ini. Segera bayar!'
      })
    }
  }

  return NextResponse.json({ success: true, processed: users.length })
}