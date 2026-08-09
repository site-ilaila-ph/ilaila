import React, {
  createContext,
  useContext,
  forwardRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import cn from "@/lib/client/utilities/cn";
import { Button } from "../actions/button";
import { FieldSet } from "./field";
import { Card } from "../display/card";

// ==========================================
// Context Setup
// ==========================================
type FormType = "single" | "multi";

type UseEmblaCarouselType = ReturnType<typeof useEmblaCarousel>;

interface MagicFormContextValue {
  type: FormType;
  emblaRef: UseEmblaCarouselType[0];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const MagicFormContext = createContext<MagicFormContextValue | null>(null);

export const useMagicFormContext = () => {
  const context = useContext(MagicFormContext);
  if (!context) {
    throw new Error("Magic Form components must be used within a <Form>");
  }
  return context;
};

// ==========================================
// Base Form Container
// ==========================================
interface FormProps extends React.ComponentPropsWithRef<"form"> {
  type?: FormType;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ type = "single", className, children, ...props }, ref) => {
    // 1. Initialize embla natively. Disable it entirely if form is single-step.
    const [emblaRef, emblaApi] = useEmblaCarousel({ active: type === "multi" });
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    // 2. Wire up navigation callbacks
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
        }}
      >
        <Card
          as="form"
          {...props}
          ref={ref}
          className={cn(
            "px-4 py-2",
            type === "multi" && "flex flex-col", 
            className
          )}
        >
          {children}
        </Card>
      </MagicFormContext.Provider>
    );
  },
);

Form.displayName = "Form";

// ==========================================
// Header & Typography Primitives
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
// Adaptive Layout Primitives
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
        // Embla Viewport (needs overflow-hidden and the ref)
        <div ref={emblaRef} className="overflow-hidden w-full">
          <div className="flex w-full touch-pan-y">
            {children}
          </div>
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
      // Embla Slide (needs flex basis 100% and to not shrink)
      <div className={cn("min-w-0 flex-[0_0_100%] w-full", className)}>
        <FieldSet {...props}>{children}</FieldSet>
      </div>
    );
  }

  return <FieldSet className={className} {...props}>{children}</FieldSet>;
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

export function FormNextButton({
  children = "Next",
  className,
  ...props
}: FormButtonProps) {
  const { type, scrollNext, canScrollNext } = useMagicFormContext();
  
  if (type === "single") return null;

  return (
    <Button
      type="button"
      onClick={scrollNext}
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
        // Hide submit button if we are in multi-step mode and haven't reached the end yet
        { hidden: type === "multi" && canScrollNext },
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}