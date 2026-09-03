"use client";

import schema from "@/app/(unauthenticated-only)/auth/validation/schemas/sign-in";
import { signInAction } from "@/app/(unauthenticated-only)/auth/actions";
import { 
  Form,
  FormContent, 
  FormFieldGroup, 
  FormFooter, 
  FormHeader, 
  FormSubmitButton, 
  FormTitle,
  FormError,
} from "@/lib/components/form/form";
import { Viewport } from "@/lib/components/layout/viewport";
import { ActionFormExtension } from "@/lib/components/form/action";
import { Input } from "@/lib/components/form/inputs";
import { Label } from "@/lib/components/form/label";
import { useFormContext } from "react-hook-form";
import { redirect } from "next/navigation";

function SignInFields() {
  const { register } = useFormContext();

  return (
    <FormContent>
      <FormFieldGroup className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            {...register("email")}
            id="email"
            type="email"
            placeholder="you@example.com"
          />
          <FormError name="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            {...register("password")}
            id="password"
            type="password"
            placeholder="••••••••"
          />
          <FormError name="password" />
        </div>
      </FormFieldGroup>
    </FormContent>
  );
}

export default function SignInPage() {
  return (
    <Viewport className="overflow-y-auto bg-linear-to-br from-primary/10 via-background to-secondary">
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col items-center text-center" aria-label="Ilaila">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-md" aria-hidden="true">I</span>
          <span className="mt-3 font-heading text-2xl font-semibold tracking-tight text-primary">Ilaila</span>
          <p className="mt-2 text-sm text-muted-foreground">Pagkain. Kuwento. Komunidad.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-lg sm:p-8">
          <Form className="w-full max-w-none" schema={schema}>
            <ActionFormExtension
              action={signInAction}
              onSuccess={() => {
                redirect('/home');
              }}
            />
            <FormHeader className="flex flex-col items-center gap-2 text-center">
              <FormTitle>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">Mag-sign in</h1>
              </FormTitle>
              <p className="text-sm text-muted-foreground">Maligayang pagbabalik sa Ilaila.</p>
            </FormHeader>

            <SignInFields />

            <FormFooter className="justify-stretch">
              <FormSubmitButton className="w-full">Mag-sign in</FormSubmitButton>
            </FormFooter>
          </Form>
          </div>
      </div>
    </Viewport>
  );
}