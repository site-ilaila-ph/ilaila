'use client'

import { AuthLayout } from '@/presentation/auth-layout'
import { SignUpOrLoginForm } from '@/presentation/sign-up-or-login-form'
import { useSearchParams } from 'next/navigation'

export function SignUpOrLoginPage() {
  const mode = useSearchParams().get('mode') === 'sign-up' ? 'sign-up' : 'login'

  return (
    <AuthLayout maxWidth="3xl">
      <SignUpOrLoginForm defaultMode={mode} />
    </AuthLayout>
  )
}
