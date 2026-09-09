'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { safeNextPath } from '@/lib/safe-next-path'

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nextParam = formData.get('next') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const destination = safeNextPath(nextParam, '/protected')
  redirect(destination)
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: `${origin}/protected` },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/sign-up-success')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string

  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  const supabase = await createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/update-password`,
  })

  if (error) redirect("/auth/error?error=Something%20went%20wrong")
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) redirect("/auth/error?error=Something%20went%20wrong")

  redirect('/protected')
}
