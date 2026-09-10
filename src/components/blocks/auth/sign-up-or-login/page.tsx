'use client'

import { SignUpOrLoginForm } from '@/app/auth/components/sign-up-or-login-form'
import { useSearchParams } from 'next/navigation'

export default function SignUpOrLoginPage() {
  const mode = useSearchParams().get('mode') === 'sign-up' ? 'sign-up' : 'login'

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl">
        <SignUpOrLoginForm defaultMode={mode} />
      </div>
    </div>
  )
}
