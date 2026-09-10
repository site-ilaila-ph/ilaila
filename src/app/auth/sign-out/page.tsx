'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function signOut() {
      try {
        const response = await fetch('/api/auth/sign-out', { method: 'POST' })
        if (!cancelled && response.ok) {
          router.replace('/auth/sign-up-or-login?mode=login')
          return
        }
      } catch {
        // Ignore fetch failures and fall back to the login page.
      }

      if (!cancelled) {
        router.replace('/auth/sign-up-or-login?mode=login')
      }
    }

    void signOut()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="text-center text-sm text-muted-foreground">
        Signing you out...
      </div>
    </main>
  )
}
