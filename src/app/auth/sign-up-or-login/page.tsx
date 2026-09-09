import { SignUpOrLoginForm } from '@/app/auth/components/sign-up-or-login-form'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const d = useSearchParams().get('mode') == 'sign-up' ? 'sign-up' : 'login';
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpOrLoginForm defaultMode={d} />
      </div>
    </div>
  )
}
