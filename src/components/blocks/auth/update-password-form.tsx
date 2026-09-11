'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
import { Form } from '@/components/ui/form'
import { z } from 'zod'

const schema = z.object({ password: z.string().min(6, 'Password must be at least 6 characters') })

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter()
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Please enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form schema={schema} onSubmit={async (data) => {
            const response = await fetch('/api/auth/update-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password: data.password }),
            });

            if (response.ok) {
              router.push('/home');
            } else {
              setNotice({ kind: "error", text: await readProblemMessage(response, "Hindi na-update ang password. Subukang muli mamaya.") });
            }
          }}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" name="password" type="password" placeholder="New password" required />
              </div>
              <Button type="submit" className="w-full">Save new password</Button>
              {notice && (
                <p
                  role="alert"
                  className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                  {notice.text}
                </p>
              )}
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
