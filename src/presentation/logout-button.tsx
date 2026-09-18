'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/presentation/ui/button'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    router.push('/auth/sign-up-or-login?mode=login')
  }

  return <Button onClick={logout}>Sign out</Button>
}
