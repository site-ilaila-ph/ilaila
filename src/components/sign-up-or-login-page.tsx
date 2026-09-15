'use client'

import { AuthLayout } from '@/components/auth-layout'
import { SignUpOrLoginForm } from '@/components/sign-up-or-login-form'
import { useSearchParams } from 'next/navigation'

export function SignUpOrLoginPage() {
  const mode = useSearchParams().get('mode') === 'sign-up' ? 'sign-up' : 'login'

  return (
    <AuthLayout maxWidth="3xl">
      <SignUpOrLoginForm defaultMode={mode} />
    </AuthLayout>
  )
}
