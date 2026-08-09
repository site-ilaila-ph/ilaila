"use client";

import schema from "../../validation/schemas/sign-up"
import signUp from "../../actions/sign-up-action";
import { FormContent, FormFieldGroup, FormFooter, FormHeader, FormNextButton, FormPreviousButton, FormSubmitButton, FormTitle } from "@/lib/client/components/form/form";
import { Viewport } from "@/lib/client/components/layout/viewport";
import { ActionForm, ActionFormField } from "@/lib/client/components/form/action";

export default function SignUpPage() {
  return (
    <Viewport className="flex flex-col items-center justify-center">
      <ActionForm className="w-120" schema={schema} action={signUp} type="multi">
        <FormHeader className="flex flex-row justify-center">
          <FormTitle>
            <h1 className="text-2xl">Sign Up</h1>
          </FormTitle>
        </FormHeader>
        <FormContent>
          <FormFieldGroup>
            <ActionFormField name="userName" label="User Name" />
            <ActionFormField name="email" label="Email" />
          </FormFieldGroup>
          <FormFieldGroup>
            <ActionFormField name="password" label="Password" />
            <ActionFormField name="confirmPassword" label="Confirm Password" />
          </FormFieldGroup>
        </FormContent>
        <FormFooter className="flex flex-row justify-between">
          <FormPreviousButton />
          <FormNextButton />
          <FormSubmitButton />
        </FormFooter>
      </ActionForm>
    </Viewport>
  );
}
