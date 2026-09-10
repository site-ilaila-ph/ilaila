import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { actionify } from '@/lib/action/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { safeNextPath } from '@/lib/safe-next-path'

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

const emailSchema = z.email('Invalid email format').trim()
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters')
const nextParamSchema = z.string().optional()

export const signInAction = actionify(
  async ({ email, password, next }: { email: string; password: string; next?: string }) => {
    await signInService(email, password);
    // redirect to client side.
  },
  z.object({ email: emailSchema, password: passwordSchema, next: nextParamSchema })
)

export const signUpAction = actionify(
  async ({ email, password }: { email: string; password: string }) => {
    const headersList = await headers()
    const origin = headersList.get('origin') || ''
    await signUpService(email, password, origin)
    redirect('/auth/sign-up-success')
  },
  z.object({ email: emailSchema, password: passwordSchema })
)

export const signOutAction = actionify(
  async ({}) => {
    await signOutService()
  },
  z.object({})
)

export const forgotPasswordAction = actionify(
  async ({ email }: { email: string }) => {
    const headersList = await headers()
    const origin = headersList.get('origin') || ''
    await forgotPasswordService(email, origin)
  },
  z.object({ email: emailSchema })
)

export const updatePasswordAction = actionify(
  async ({ password }: { password: string }) => {
    await updatePasswordService(password)
    redirect('/protected')
  },
  z.object({ password: passwordSchema })
)
