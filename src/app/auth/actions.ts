import { createClient } from "@/lib/supabase/server"
import { EmailOtpType } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export async function verifyEmailOtp(
  token_hash: string,
  type: EmailOtpType,
  _next?: string
) {
  const next = _next?.startsWith('/') ? _next : '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      redirect(next)
    }

    redirect(`/auth/error?error=${error.message}`)
  }

  redirect(`/auth/error?error=No token hash or type`)
}