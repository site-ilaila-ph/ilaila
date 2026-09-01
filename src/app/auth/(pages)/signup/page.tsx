"use client";

import schema from "../../validation/schemas/sign-up"
import { signUpAction } from "@/app/auth/actions/auth.actions";
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
          <Label htmlFor="userName">User Name</Label>
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
          <Label htmlFor="confirmPassword">Confirm Password</Label>
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
    <Viewport className="flex flex-col items-center justify-center">
      <Form 
        className="w-120" 
        schema={schema} 
        type="multi"
        onSubmit={() => {
          redirect('/home');
        }}
      >
        <ActionFormExtension action={signUpAction} />
        <FormHeader className="flex flex-row justify-center">
          <FormTitle>
            <h1 className="text-2xl">Sign Up</h1>
          </FormTitle>
        </FormHeader>
        <SignUpFields />
        <FormFooter className="flex flex-row justify-between">
          <FormPreviousButton />
          <FormNextButton />
          <FormSubmitButton />
        </FormFooter>
      </Form>
    </Viewport>
  );
}
