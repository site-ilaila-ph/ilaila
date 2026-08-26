"use client";

import schema from "../../validation/schemas/sign-in";
import signInAction from "@/app/auth/actions/sign-in-action";
import { 
  FormContent, 
  FormFieldGroup, 
  FormFooter, 
  FormHeader, 
  FormSubmitButton, 
  FormTitle 
} from "@/lib/components/form/form";
import { Viewport } from "@/lib/components/layout/viewport";
import { ActionForm, ActionFormField } from "@/lib/components/form/action";
import { useCallback } from "react";
import { redirect } from "next/navigation";

export default function SignInPage() {
  const onSuccess = useCallback(() => {
    redirect('/authentication/signin');
  }, []);

  return (
    <Viewport className="flex flex-col items-center justify-center">
      <ActionForm className="w-full max-w-md" schema={schema} action={signInAction} onSuccess={onSuccess}>
        <FormHeader className="flex flex-row justify-center">
          <FormTitle>
            <h1 className="text-2xl font-semibold">Sign In</h1>
          </FormTitle>
        </FormHeader>

        <FormContent>
          <FormFieldGroup className="space-y-4">
            <ActionFormField name="email" label="Email" type="email" />
            <ActionFormField name="password" label="Password" type="password" />
          </FormFieldGroup>
        </FormContent>

        <FormFooter className="justify-end">
          <FormSubmitButton>Sign in</FormSubmitButton>
        </FormFooter>
      </ActionForm>
    </Viewport>
  );
}