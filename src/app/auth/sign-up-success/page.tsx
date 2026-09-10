import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Matagumpay ang iyong pagpaparehistro!</CardTitle>
              <CardDescription>Handa na ang iyong account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Matagumpay na nalikha ang iyong account. Maaari ka nang mag-sign in at gamitin ang iyong account.
              </p>
            </CardContent>
            <CardFooter>
              <CardAction>
                <Button as={Link} href="/auth/sign-up-or-login?mode=login">
                  Magpatuloy sa Login
                </Button>
              </CardAction>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
