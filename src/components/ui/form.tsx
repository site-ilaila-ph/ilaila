"use client";

import React, {
  createContext,
  useContext,
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  useForm,
  FormProvider,
  useFormContext,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useServerAction } from "@/lib/action/client";
import { AnyFunctionCoercedServerAction, InferFunctionCoercedServerActionResultData } from "@/lib/action/server";
import { ActionFailure } from "@/lib/common-server-action-protocol";
import { cn } from "@/lib/utils";
import { Button } from "@base-ui/react";
import { Card } from "./card";
import { FieldSet } from "./field";

type FormType = "single" | "multi";

type UseEmblaCarouselType = ReturnType<typeof useEmblaCarousel>;

/**
 * Returning { halt: true } stops the submit pipeline — no further
 * interceptors run, and Form's own `onSubmit` prop does not fire.
 * Use this after reporting a failure (e.g. mapped server field
 * errors) so a caller's onSubmit (redirect, reset, etc.) doesn't run
 * against a submission that didn't actually succeed.
 */
type SubmitInterceptorResult = void | { halt: true };

export type SubmitInterceptor<TFieldValues extends FieldValues> = (
  data: TFieldValues,
  methods: UseFormReturn<TFieldValues>,
) => SubmitInterceptorResult | Promise<SubmitInterceptorResult>;

interface MagicFormContextValue<
  TFieldValues extends FieldValues = FieldValues,
> {
  // layout
  type: FormType;
  emblaRef: UseEmblaCarouselType[0];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  // submit pipeline
  registerSubmitInterceptor: (
    interceptor: SubmitInterceptor<TFieldValues>,
  ) => () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MagicFormContext = createContext<MagicFormContextValue<any> | null>(
  null,
);

export const useMagicFormContext = <
  TFieldValues extends FieldValues = FieldValues,
>() => {
  const context = useContext(MagicFormContext);
  if (!context) {
    throw new Error("Magic Form components must be used within a <Form>");
  }
  return context as MagicFormContextValue<TFieldValues>;
};

/**
 * Typed re-export of RHF's useFormContext — the internal RHF API
 * (setError, watch, trigger, reset, ...) that field components and
 * extensions both read/write through. Form itself never calls these
 * on anyone's behalf beyond running the schema resolver.
 */
export const useMagicFormMethods = <
  TFieldValues extends FieldValues = FieldValues,
>() => useFormContext<TFieldValues>();

export const useFormExtensionApi = <
  TFieldValues extends FieldValues = FieldValues,
>() => {
  const { registerSubmitInterceptor } = useMagicFormContext<TFieldValues>();
  return { registerSubmitInterceptor };
};

// ===========================================================================
// Base Form Container
// ===========================================================================
interface FormProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  type?: FormType;

  /**
   * Client-side shape validation, baked in directly via RHF's
   * resolver — no separate validator abstraction. Omit for the rare
   * form with no meaningful shape to check.
   */
  schema?: z.ZodType<TFieldValues>;

  defaultValues?: DefaultValues<TFieldValues>;

  /**
   * Runs after schema validation AND every registered extension has
   * passed (none returned `{ halt: true }`). Keep this for
   * form-level bookkeeping (close a modal, advance a wizard) —
   * action-specific submission behavior belongs in an extension, not
   * here.
   */
  onSubmit?: (data: TFieldValues) => Promise<void> | void;
}

const FormInner = <TFieldValues extends FieldValues = FieldValues>(
  {
    type = "single",
    schema,
    defaultValues,
    onSubmit,
    className,
    children,
    ...props
  }: FormProps<TFieldValues>,
  ref: React.ForwardedRef<HTMLFormElement>,
) => {
  // Form always owns the RHF instance — no bring-your-own-instance
  // prop. Anything that needs `methods` gets it via context.
  const methods = useForm<TFieldValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: schema ? zodResolver(schema as any) : undefined,
    defaultValues,
  });

  const interceptorsRef = useRef<SubmitInterceptor<TFieldValues>[]>([]);

  const registerSubmitInterceptor = useCallback(
    (interceptor: SubmitInterceptor<TFieldValues>) => {
      interceptorsRef.current.push(interceptor);
      return () => {
        interceptorsRef.current = interceptorsRef.current.filter(
          (i) => i !== interceptor,
        );
      };
    },
    [],
  );

  // eslint-disable-next-line react-hooks/refs
  const handleSubmit = methods.handleSubmit(async (data) => {
    for (const interceptor of interceptorsRef.current) {
      const result = await interceptor(data, methods);
      if (result?.halt) return;
    }
    await onSubmit?.(data);
  });

  // ---- carousel wiring (unchanged) ----
  const [emblaRef, emblaApi] = useEmblaCarousel({ active: type === "multi" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect(emblaApi);
    emblaApi.on("reInit", () => onSelect(emblaApi));
    emblaApi.on("select", () => onSelect(emblaApi));
  }, [emblaApi, onSelect]);

  return (
    <MagicFormContext.Provider
      value={{
        type,
        emblaRef,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        registerSubmitInterceptor,
      }}
    >
      {/* FormProvider makes `methods` reachable from any descendant
          via useFormContext()/useMagicFormMethods() — this is the
          "internal RHF API access" both field components and
          extensions rely on. */}
      <FormProvider {...methods}>
        <Card
          as="form"
          {...props}
          ref={ref}
          onSubmit={handleSubmit}
          className={cn(
            "px-4 py-2",
            type === "multi" && "flex flex-col",
            className,
          )}
        >
          {children}
        </Card>
      </FormProvider>
    </MagicFormContext.Provider>
  );
};

// forwardRef + generics needs a cast — TS can't express a generic
// forwardRef signature natively. Preserves TFieldValues inference at
// call sites (inferred from `schema`).
export const Form: React.FC<FormProps> = forwardRef(
  FormInner as React.ForwardRefRenderFunction<HTMLFormElement, FormProps>,
) as React.FC<FormProps>;

Form.displayName = "Form";

// ===========================================================================
// Header & Typography Primitives
// ===========================================================================
export const FormHeader: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    data-slot="form-header"
    className={cn(
      "group/form-header @container/form-header grid auto-rows-min items-start gap-1.5 rounded-t-4xl px-(--form-spacing) has-data-[slot=form-action]:grid-cols-[1fr_auto] has-data-[slot=form-description]:grid-rows-[auto_auto] [.border-b]:pb-(--form-spacing)",
      className,
    )}
    {...props}
  />
);

FormHeader.displayName = "FormHeader";

export const FormTitle: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    data-slot="form-title"
    className={cn("font-heading text-base font-medium", className)}
    {...props}
  />
);

FormTitle.displayName = "FormTitle";

export const FormDescription: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    data-slot="form-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

FormDescription.displayName = "FormDescription";

export const FormAction: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    data-slot="form-action"
    className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
    {...props}
  />
);

FormAction.displayName = "FormAction";

export const FormFooter: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    data-slot="form-footer"
    className={cn(
      "flex items-center rounded-b-4xl mt-(--form-spacing) px-(--form-spacing) py-[calc(var(--form-spacing)/2)] [.border-t]:pt-(--form-spacing)",
      className,
    )}
    {...props}
  />
);

FormFooter.displayName = "FormFooter";

// ===========================================================================
// Adaptive Layout Primitives
// ===========================================================================
export const FormContent: React.FC<React.ComponentProps<"div">> = ({
  className,
  children,
  ...props
}) => {
  const { type, emblaRef } = useMagicFormContext();

  return (
    <div
      data-slot="form-content"
      className={cn("mt-(--form-spacing) px-(--form-spacing)", className)}
      {...props}
    >
      {type === "multi" ? (
        <div ref={emblaRef} className="overflow-hidden w-full">
          <div className="flex w-full touch-pan-y">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

FormContent.displayName = "FormContent";

export const FormFieldGroup: React.FC<React.ComponentProps<typeof FieldSet>> = ({
  children,
  className,
  ...props
}) => {
  const { type } = useMagicFormContext();

  if (type === "multi") {
    return (
      <div className={cn("min-w-0 flex-[0_0_100%] w-full", className)}>
        <FieldSet {...props}>{children}</FieldSet>
      </div>
    );
  }

  return (
    <FieldSet className={className} {...props}>
      {children}
    </FieldSet>
  );
};

FormFieldGroup.displayName = "FormFieldGroup";

// ===========================================================================
// Adaptive Action Buttons
// ===========================================================================
type FormButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick">;

export const FormPreviousButton: React.FC<FormButtonProps> = ({
  children = "Previous",
  className,
  disabled,
  ...props
}) => {
  const { type, scrollPrev, canScrollPrev } = useMagicFormContext();

  if (type === "single") return null;

  return (
    <Button
      type="button"
      onClick={scrollPrev}
      disabled={disabled || !canScrollPrev}
      className={cn("px-3 py-2", className)}
      {...props}
    >
      {children}
    </Button>
  );
};

FormPreviousButton.displayName = "FormPreviousButton";

interface FormNextButtonProps extends FormButtonProps {
  /**
   * Field names on the current step to validate before advancing —
   * uses RHF's own `trigger()`, no separate validation path. Omit to
   * advance without gating.
   */
  fields?: Path<FieldValues>[];
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const FormNextButton: React.FC<FormNextButtonProps> = ({
  children = "Next",
  className,
  fields,
  onClick,
  ...props
}) => {
  const { type, scrollNext, canScrollNext } = useMagicFormContext();
  const methods = useMagicFormMethods();

  if (type === "single") return null;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
    if (fields?.length) {
      const valid = await methods.trigger(fields);
      if (!valid) return;
    }
    onClick?.(event);
    scrollNext();
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      className={cn("px-3 py-2", { hidden: !canScrollNext }, className)}
      {...props}
    >
      {children}
    </Button>
  );
};

FormNextButton.displayName = "FormNextButton";

export const FormSubmitButton: React.FC<FormButtonProps> = ({
  children = "Submit",
  className,
  ...props
}) => {
  const { type, canScrollNext } = useMagicFormContext();

  return (
    <Button
      type="submit"
      className={cn(
        "px-3 py-2",
        { hidden: type === "multi" && canScrollNext },
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

FormSubmitButton.displayName = "FormSubmitButton";

export interface FormErrorProps extends React.ComponentProps<"p"> {
  /**
   * Field name to display the error for. Uses form context to grab the error.
   * Can be omitted to display global form errors via "root".
   */
  name?: string;
}

/**
 * FormError - displays error message for a specific field or globally
 * Uses form context to fetch error state
 */
export const FormError: React.FC<FormErrorProps> = ({ name, className, ...props }) => {
  const methods = useMagicFormMethods();
  const fieldName = name || "root";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (methods.formState.errors as any)?.[fieldName]?.message;

  if (!error) return null;

  return (
    <p className={cn("mt-1 text-sm text-destructive", className)} {...props}>
      {error}
    </p>
  );
};

FormError.displayName = "FormError";

// ===========================================================================
// Server Action Extension
// ===========================================================================
interface ActionFormSuccessCallback<
  TAction extends AnyFunctionCoercedServerAction,
> {
  (data: InferFunctionCoercedServerActionResultData<TAction>): Promise<void> | void;
}

interface ActionFormFailureCallback {
  (failureResult: ActionFailure): Promise<void> | void;
}

export interface ActionFormExtensionProps<
  TAction extends AnyFunctionCoercedServerAction,
> {
  action: TAction;
  onSuccess?: ActionFormSuccessCallback<TAction>;
  onFailure?: ActionFormFailureCallback;
}

export const ActionFormExtension: React.FC<
  ActionFormExtensionProps<AnyFunctionCoercedServerAction>
> = <
  TAction extends AnyFunctionCoercedServerAction,
>({
  action,
  onSuccess,
  onFailure,
}: ActionFormExtensionProps<TAction>) => {
  const { registerSubmitInterceptor } = useFormExtensionApi();
  const { execute } = useServerAction({ action });

  useEffect(() => {
    const unregister = registerSubmitInterceptor(async (data, methods) => {
      const result = await execute(data as Parameters<TAction>[0]);

      if (result.success) {
        await onSuccess?.(result.data);
        return;
      }

      if (result.type === "validation") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          const message = messages?.[0];
          if (message) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            methods.setError(field as any, { type: "server", message });
          }
        }
      } else {
        // "insensitive" and "sensitive" both surface as a single root-level
        // error — the only difference is whether the server-provided
        // message is safe to show, or we fall back to a generic one.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        methods.setError("root" as any, {
          type: "server",
          message:
            result.type === "insensitive" && result.message
              ? result.message
              : "Something went wrong. Please try again.",
        });
      }

      await onFailure?.(result);

      return { halt: true };
    });

    return unregister;
  }, [execute, onFailure, onSuccess, registerSubmitInterceptor]);

  return null;
};

ActionFormExtension.displayName = "ActionFormExtension";