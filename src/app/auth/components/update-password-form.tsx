'use client'

import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
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
import { Form, ActionFormExtension } from '@/components/ui/form'
import { updatePasswordAction } from '@/app/auth/actions'
import { z } from 'zod'

const schema = z.object({ password: z.string().min(6, 'Password must be at least 6 characters') })

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter()

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Please enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form schema={schema}>
            <ActionFormExtension action={updatePasswordAction} onSuccess={() => router.push('/protected')} />
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" name="password" type="password" placeholder="New password" required />
              </div>
              <Button type="submit" className="w-full">Save new password</Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
