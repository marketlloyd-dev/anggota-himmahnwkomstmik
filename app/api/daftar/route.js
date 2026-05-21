import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { email, password, nama_lengkap, divisi, jabatan } = await request.json()

    if (!email || !password || !nama_lengkap || !divisi) {
      return new Response(
        JSON.stringify({ error: 'Email, password, nama, dan divisi wajib diisi' }),
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. Buat user langsung terkonfirmasi
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nama_lengkap, divisi, jabatan: jabatan || 'Anggota' }
    })

    if (authError) {
      if (authError.message.includes('duplicate')) {
        return new Response(
          JSON.stringify({ error: 'Email sudah terdaftar. Silakan login.' }),
          { status: 400 }
        )
      }
      throw authError
    }

    const userId = authData.user.id

    // 2. Masukkan ke public.users (role selalu 'anggota')
    const { error: profilError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        nama_lengkap,
        divisi,
        jabatan: jabatan || 'Anggota',
        role: 'anggota'
      })

    if (profilError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw new Error('Gagal menyimpan data profil: ' + profilError.message)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Akun berhasil dibuat. Silakan login.' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error pendaftaran:', error.message)
    return new Response(
      JSON.stringify({ error: error.message || 'Terjadi kesalahan saat mendaftar' }),
      { status: 500 }
    )
  }
}