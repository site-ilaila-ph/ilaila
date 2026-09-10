import { createClient } from '@/lib/supabase/server'

export async function signInService(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUpService(email: string, password: string, origin: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/protected` } })
  if (error) throw error
}

export async function signOutService() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function forgotPasswordService(email: string, origin: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/update-password` })
  if (error) throw error
}

export async function updatePasswordService(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}
