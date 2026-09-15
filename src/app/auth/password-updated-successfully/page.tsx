import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Matagumpay na nabago ang iyong password!
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ang iyong bagong password ay aktibo na. Maaari ka nang mag-sign in gamit ang iyong bagong password.
            </p>
          </CardContent>

          <CardFooter>
            <CardAction>
              <Button render={<Link href="/auth/sign-up-or-login?mode=login" />}>
                Mag-sign in
              </Button>
            </CardAction>
          </CardFooter>
        </Card>
      </div>
    </AuthLayout>
  );
}
