'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Check role before allowing login from admin portal
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData?.user?.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'Access Denied: You do not have admin privileges.' }
  }

  revalidatePath('/admin')
  redirect('/admin')
}

