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
import cn from "@/lib/utilities/cn";
import { Button } from "../actions/button";
import { FieldSet } from "./field";
import { Card } from "../display/card";

// ==========================================
// Combined Form Context
//
// Single context carrying both concerns that used to live in two
// separate providers:
//   - carousel/layout state (type, embla ref, scroll controls)
//   - the submit-interceptor registry ("extension" attachment point)
//
// These are conceptually distinct (layout vs. submit pipeline), but
// both are "ambient state descendants of <Form> need," so they're
// merged into one provider to avoid a second context layer. An
// "extension" is any component rendered inside <Form> that, on
// mount, registers a submit interceptor and returns null — it has no
// visual output, it just hooks into the submit pipeline. Form knows
// nothing about what an interceptor does; it only knows how to run
// the list in order and stop early if one halts.
//
// e.g. <ServerActionFormExtension action={signup} onSuccess={...} />
// rendered as a child of <Form>.
// ==========================================
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

export function useMagicFormContext<
  TFieldValues extends FieldValues = FieldValues,
>() {
  const context = useContext(MagicFormContext);
  if (!context) {
    throw new Error("Magic Form components must be used within a <Form>");
  }
  return context as MagicFormContextValue<TFieldValues>;
}

/**
 * Typed re-export of RHF's useFormContext — the internal RHF API
 * (setError, watch, trigger, reset, ...) that field components and
 * extensions both read/write through. Form itself never calls these
 * on anyone's behalf beyond running the schema resolver.
 */
export function useMagicFormMethods<
  TFieldValues extends FieldValues = FieldValues,
>() {
  return useFormContext<TFieldValues>();
}


export function useFormExtensionApi<
  TFieldValues extends FieldValues = FieldValues,
>() {
  const { registerSubmitInterceptor } = useMagicFormContext<TFieldValues>();
  return { registerSubmitInterceptor };
}

// ==========================================
// Base Form Container
// ==========================================
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

function FormInner<TFieldValues extends FieldValues = FieldValues>(
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
) {
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
}

// forwardRef + generics needs a cast — TS can't express a generic
// forwardRef signature natively. Preserves TFieldValues inference at
// call sites (inferred from `schema`).
export const Form = forwardRef(FormInner) as (<
  TFieldValues extends FieldValues = FieldValues,
>(
  props: FormProps<TFieldValues> & {
    ref?: React.ForwardedRef<HTMLFormElement>;
  },
) => React.ReactElement) & { displayName?: string };

(Form as { displayName?: string }).displayName = "Form";

// ==========================================
// Header & Typography Primitives (unchanged)
// ==========================================
export function FormHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-header"
      className={cn(
        "group/form-header @container/form-header grid auto-rows-min items-start gap-1.5 rounded-t-4xl px-(--form-spacing) has-data-[slot=form-action]:grid-cols-[1fr_auto] has-data-[slot=form-description]:grid-rows-[auto_auto] [.border-b]:pb-(--form-spacing)",
        className,
      )}
      {...props}
    />
  );
}

export function FormTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-title"
      className={cn("font-heading text-base font-medium", className)}
      {...props}
    />
  );
}

export function FormDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function FormAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

export function FormFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-footer"
      className={cn(
        "flex items-center rounded-b-4xl mt-(--form-spacing) px-(--form-spacing) py-[calc(var(--form-spacing)/2)] [.border-t]:pt-(--form-spacing)",
        className,
      )}
      {...props}
    />
  );
}

// ==========================================
// Adaptive Layout Primitives (unchanged)
// ==========================================
export function FormContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
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
}

export function FormFieldGroup({
  children,
  className,
  ...props
}: React.ComponentProps<typeof FieldSet>) {
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
}

// ==========================================
// Adaptive Action Buttons
// ==========================================
type FormButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick">;

export function FormPreviousButton({
  children = "Previous",
  className,
  disabled,
  ...props
}: FormButtonProps) {
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
}

interface FormNextButtonProps extends FormButtonProps {
  /**
   * Field names on the current step to validate before advancing —
   * uses RHF's own `trigger()`, no separate validation path. Omit to
   * advance without gating.
   */
  fields?: Path<FieldValues>[];
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function FormNextButton({
  children = "Next",
  className,
  fields,
  onClick,
  ...props
}: FormNextButtonProps) {
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
}

export function FormSubmitButton({
  children = "Submit",
  className,
  ...props
}: FormButtonProps) {
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
}