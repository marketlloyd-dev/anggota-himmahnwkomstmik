import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { userId, nama_lengkap, email, password_sekarang, password_baru } = await request.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID diperlukan' }), { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Jika ingin update nama saja, langsung update tabel users
    if (nama_lengkap && !password_sekarang) {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ nama_lengkap })
        .eq('id', userId)

      if (error) throw error
      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }

    // Jika ingin ganti email/password, verifikasi password sekarang dulu
    if (password_sekarang) {
      // Coba login untuk verifikasi password
      const { data: userData, error: signInError } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (!userData?.user) throw new Error('User tidak ditemukan')

      // Verifikasi password dengan signIn (tidak bisa langsung cek password dari admin API)
      // Kita gunakan supabase client biasa untuk verifikasi
      const { error: loginError } = await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ).auth.signInWithPassword({
        email: userData.user.email,
        password: password_sekarang,
      })

      if (loginError) {
        return new Response(JSON.stringify({ error: 'Password saat ini salah' }), { status: 401 })
      }

      // Update email jika diisi
      if (email && email !== userData.user.email) {
        const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(userId, { email })
        if (emailError) throw emailError
      }

      // Update password jika diisi
      if (password_baru) {
        const { error: passError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: password_baru })
        if (passError) throw passError
      }

      // Jika ada perubahan nama juga
      if (nama_lengkap) {
        await supabaseAdmin.from('users').update({ nama_lengkap }).eq('id', userId)
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }

    return new Response(JSON.stringify({ error: 'Tidak ada perubahan yang diminta' }), { status: 400 })
  } catch (error) {
    console.error('Update profil error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Terjadi kesalahan' }), { status: 500 })
  }
}