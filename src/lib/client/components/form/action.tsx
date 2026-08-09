"use client";

import {
  ActionFailure,
  AnyFunctionCoercedServerAction,
  InferFunctionCoercedServerActionResultData,
} from "@/lib/server/actions";
import React, { useCallback } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Form } from "./form";
import { Input } from "./inputs";
import useServerAction from "../../hooks/use-server-action";
import { Label } from "./label";

interface ActionFormSuccessCallback<
  TAction extends AnyFunctionCoercedServerAction,
> {
  (data: InferFunctionCoercedServerActionResultData<TAction>): Promise<void> | void;
}

interface ActionFormFailureCallback {
  (failureResult: ActionFailure): Promise<void> | void;
}

interface ActionFormProps<
  TSchema extends z.ZodType,
  TAction extends AnyFunctionCoercedServerAction,
> {
  action: TAction;
  schema: TSchema;
  onSuccess?: ActionFormSuccessCallback<TAction>;
  onFailure?: ActionFormFailureCallback;
}

export function ActionForm<
  TSchema extends z.ZodType,
  TAction extends AnyFunctionCoercedServerAction,
>({
  action,
  schema,
  onSuccess,
  onFailure,
  ...formProps
}: ActionFormProps<TSchema, TAction> &
  Omit<React.ComponentProps<typeof Form>, "onSubmit" | "action">) {
  const methods = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
  });
  const { execute } = useServerAction({ action });

  const onSubmit = useCallback(
    async (data: z.output<TSchema>) => {
      const result = await execute(data as Parameters<TAction>[0]);

      if (result.success) {
        console.log("Success!");
        await onSuccess?.(result.data);
        return;
      }

      if (result.type === "validation") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          const message = messages?.[0];
          if (message) {
            methods.setError(field, { type: "server", message });
          }
        }
      }

      await onFailure?.(result);
    },
    [execute, methods, onFailure, onSuccess],
  );

  return (
    <FormProvider {...methods}>
      <Form {...formProps} onSubmit={methods.handleSubmit(onSubmit)} />
    </FormProvider>
  );
}

export interface ActionFormFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "name" | "onChange"> {
  name: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export function ActionFormField({
  name,
  label,
  description,
  onChange: customOnChange,
  ...inputProps
}: ActionFormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { onChange: registerOnChange, onBlur, ref, ...registration } = register(name);
  const error = errors[name];

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      registerOnChange(event);
      customOnChange?.(event);
    },
    [customOnChange, registerOnChange],
  );

  return (
    <div className="flex w-full flex-col space-y-2 text-left">
      <Label
        htmlFor={name}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>

      <Input
        {...inputProps}
        {...registration}
        ref={ref}
        id={name}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
      />

      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      {error?.message && <p className="text-sm font-medium text-destructive">{String(error.message)}</p>}
    </div>
  );
}
