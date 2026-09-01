"use client";

import schema from "../../validation/schemas/sign-in";
import { signInAction } from "@/app/auth/actions/auth.actions";
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
    <Viewport className="flex flex-col items-center justify-center">
      <Form className="w-full max-w-md" schema={schema}>
        <ActionFormExtension
          action={signInAction}
          onSuccess={() => {
            redirect('/home');
          }}
        />
        <FormHeader className="flex flex-row justify-center">
          <FormTitle>
            <h1 className="text-2xl font-semibold">Sign In</h1>
          </FormTitle>
        </FormHeader>

        <SignInFields />

        <FormFooter className="justify-end">
          <FormSubmitButton>Sign in</FormSubmitButton>
        </FormFooter>
      </Form>
    </Viewport>
  );
}