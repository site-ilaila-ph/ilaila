'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import { readProblemMessage } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Form } from '@/components/ui/form'
import { z } from 'zod'

const schema = z.object({ email: z.string().email('Invalid email format').trim() })

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Type in your email and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form schema={schema} onSubmit={async (data) => {
            const response = await fetch('/api/auth/forgot-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: data.email }),
            });

            if (response.ok) {
              setNotice({ kind: "success", text: "Idinayala sa iyong email ang reset link." });
            } else {
              setNotice({ kind: "error", text: await readProblemMessage(response, "Hindi napadala ang reset email. Subukang muli mamaya.") });
            }
          }}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send reset email
              </Button>
              {notice && (
                <p
                  role="status"
                  className={`rounded-md border px-4 py-3 text-sm ${notice.kind === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
                >
                  {notice.text}
                </p>
              )}
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/sign-up-or-login?mode=login" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
