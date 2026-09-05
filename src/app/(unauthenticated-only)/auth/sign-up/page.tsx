"use client";

import schema from "@/app/(unauthenticated-only)/auth/validation/schemas/sign-up";
import { signUpAction } from "@/app/(unauthenticated-only)/auth/actions";
import { 
  Form,
  FormContent, 
  FormFieldGroup, 
  FormFooter, 
  FormHeader, 
  FormNextButton, 
  FormPreviousButton, 
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

function SignUpFields() {
  const { register } = useFormContext();

  return (
    <FormContent>
      <FormFieldGroup>
        <div className="space-y-2">
          <Label htmlFor="userName">Pangalan ng user</Label>
          <Input
            {...register("userName")}
            id="userName"
            placeholder="john_doe"
          />
          <FormError name="userName" />
        </div>
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
      </FormFieldGroup>
      <FormFieldGroup>
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Kumpirmahin ang password</Label>
          <Input
            {...register("confirmPassword")}
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
          />
          <FormError name="confirmPassword" />
        </div>
      </FormFieldGroup>
    </FormContent>
  );
}

export default function SignUpPage() {
  return (
    <Viewport className="overflow-y-auto bg-linear-to-br from-primary/10 via-background to-secondary">
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col items-center text-center" aria-label="Ilaila">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-md" aria-hidden="true">I</span>
          <span className="mt-3 font-heading text-2xl font-semibold tracking-tight text-primary">Ilaila</span>
          <p className="mt-2 text-sm text-muted-foreground">Pagkain. Kuwento. Komunidad.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-lg sm:p-8">
          <Form
            className="w-full max-w-none"
            schema={schema}
            type="multi"
            onSubmit={() => {
              redirect('/home');
            }}
          >
            <ActionFormExtension action={signUpAction} />
            <FormHeader className="flex flex-col items-center gap-2 text-center">
              <FormTitle>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">Gumawa ng account</h1>
              </FormTitle>
              <p className="text-sm text-muted-foreground">Magsimula sa pagtuklas ng lokal na pagkain.</p>
            </FormHeader>
            <SignUpFields />
            <FormFooter className="flex flex-row justify-between gap-2">
              <FormPreviousButton />
              <FormNextButton />
              <FormSubmitButton />
            </FormFooter>
          </Form>
        </div>
      </div>
    </Viewport>
  );
}
