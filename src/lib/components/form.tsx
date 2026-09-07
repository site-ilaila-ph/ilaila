"use client";

import { cn } from "@/lib/client";
import { ChevronDownIcon } from "lucide-react";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./form/input-group";
import { useHasPointer } from "@/lib/hooks";

// ---------------------------------------------------------------------------
// Generic component-configuration helper
// ---------------------------------------------------------------------------

type ConfiguredComponentOptions = {
  /** Sets displayName on the returned component. */
  displayName?: string;
  /** Wrap render in React.forwardRef. Defaults to true when render takes 2 args. */
  forwardRef?: boolean;
};

/**
 * Wraps a render function into a component, optionally via React.forwardRef,
 * and assigns a displayName. Centralizes the boilerplate that every
 * `React.forwardRef(...); X.displayName = "..."` pair used to repeat.
 *
 *   const Foo = configuredComponent((props, ref) => <input ref={ref} {...props} />, {
 *     displayName: "Foo",
 *   });
 */
function configuredComponent<P extends object, R = unknown>(
  render: (props: React.PropsWithoutRef<P>, ref: React.ForwardedRef<R>) => React.ReactElement | null,
  options: ConfiguredComponentOptions = {},
) {
  const { displayName, forwardRef = true } = options;

  const Component = forwardRef
    ? React.forwardRef(render)
    : ((render as unknown) as React.FC<P>);

  if (displayName) {
    (Component as { displayName?: string }).displayName = displayName;
  }

  return Component as React.ForwardRefExoticComponent<
    P & React.RefAttributes<R>
  >;
}

// ---------------------------------------------------------------------------
// Native primitives
// ---------------------------------------------------------------------------

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
};

const NativeInput = configuredComponent<React.ComponentProps<"input">, HTMLInputElement>(
  ({ className, type, ...props }, ref) => (
    <InputPrimitive
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  ),
  { displayName: "native.Input" },
);

function NativeSelect({ className, size = "default", ...props }: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="h-9 w-full min-w-0 appearance-none rounded-3xl border border-transparent bg-input/50 py-1 pr-8 pl-3 text-sm transition-[color,box-shadow,background-color] outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=sm]:h-8 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export const native = {
  Input: NativeInput,
  Select: NativeSelect,
  SelectOptGroup: NativeSelectOptGroup,
  SelectOption: NativeSelectOption,
};

// ---------------------------------------------------------------------------
// Input variants
// ---------------------------------------------------------------------------

type SpecializedInputProps = Omit<React.ComponentProps<typeof NativeInput>, "type">;

/**
 * Sub-helper on top of configuredComponent for variants that are nothing
 * more than `<NativeInput type="..." {...props} />`.
 */
function simpleInput(
  type: string,
  displayName: string,
  extraProps: Partial<React.ComponentProps<typeof NativeInput>> = {},
) {
  return configuredComponent<SpecializedInputProps, HTMLInputElement>(
    (props, ref) => <NativeInput ref={ref} type={type} {...extraProps} {...props} />,
    { displayName },
  );
}

// --- TIER 1: SIMPLE TEXT-LIKE VARIANTS ---
const TextInput = simpleInput("text", "TextInput");
const EmailInput = simpleInput("email", "EmailInput", { inputMode: "email" });
const NumberInput = simpleInput("number", "NumberInput");
const HiddenInput = simpleInput("hidden", "HiddenInput", { className: "hidden" });

// --- TIER 2: STANDARD TEXT VARIANTS ---
const TelInput = simpleInput("tel", "TelInput", { inputMode: "tel" });
const UrlInput = simpleInput("url", "UrlInput", { inputMode: "url" });
const TimeInput = simpleInput("time", "TimeInput");
const DatetimeLocalInput = simpleInput("datetime-local", "DatetimeLocalInput");
const MonthInput = simpleInput("month", "MonthInput");
const WeekInput = simpleInput("week", "WeekInput");
const CheckboxInput = simpleInput("checkbox", "CheckboxInput");
const RadioInput = simpleInput("radio", "RadioInput");
const RangeInput = simpleInput("range", "RangeInput");
const ColorInput = simpleInput("color", "ColorInput");
const FileInput = simpleInput("file", "FileInput");

// --- CUSTOM VARIANTS (real logic beyond swapping `type`) ---

const PasswordInput = configuredComponent<SpecializedInputProps, HTMLInputElement>(
  (props, ref) => {
    const [show, setShow] = useState(false);
    const animationIdRef = useRef<number | null>(null);
    const eyeRef = useRef<SVGSVGElement>(null);
    const eyeballRef = useRef<SVGCircleElement>(null);
    const toggleShow = useCallback(() => setShow((s) => !s), []);

    useEffect(() => {
      if (!show) return;
      const abortController = new AbortController();

      window.addEventListener(
        "mousemove",
        (ev) => {
          if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);

          animationIdRef.current = requestAnimationFrame(() => {
            const eyeElement = eyeRef.current;
            const eyeballElement = eyeballRef.current;
            if (!eyeElement || !eyeballElement) return;

            const eyeRect = eyeElement.getBoundingClientRect();
            const eyeCenterX = eyeRect.x + eyeRect.width / 2;
            const eyeCenterY = eyeRect.y + eyeRect.height / 2;
            const deltaX = ev.clientX - eyeCenterX;
            const deltaY = ev.clientY - eyeCenterY;

            const angle = Math.atan2(deltaY, deltaX);
            const distance = Math.hypot(deltaX, deltaY);
            const watchRadius = 5;
            const power = Math.min(distance / watchRadius, 1);
            const potency = 2.5;
            const straightOffset = power * potency;

            const offsetCartesian = [
              straightOffset * Math.cos(angle),
              straightOffset * Math.sin(angle),
            ];

            eyeballElement.style.cx = (12 + offsetCartesian[0]).toString();
            eyeballElement.style.cy = (12 + offsetCartesian[1]).toString();
            animationIdRef.current = null;
          });
        },
        { signal: abortController.signal },
      );

      return () => abortController.abort();
    }, [show]);

    return (
      <InputGroup>
        <InputGroupInput {...props} ref={ref} type={show ? "text" : "password"} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={toggleShow} type="button" tabIndex={-1}>
            <svg
              ref={eyeRef}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-destructive"
            >
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle
                className="data-hide:duration-200 data-hide:transition-all data-hide:[rx:2] data-hide:[ry:0]"
                data-hide={!show ? true : undefined}
                ref={eyeballRef}
                cx="12"
                cy="12"
                fill="currentColor"
                r="2"
              />
            </svg>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  },
  { displayName: "PasswordInput" },
);

const SearchInput = configuredComponent<SpecializedInputProps, HTMLInputElement>(
  (props, ref) => (
    <InputGroup>
      <InputGroupAddon
        align="inline-start"
        className="pointer-events-none px-3 text-muted-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </InputGroupAddon>
      {/* standard type="search" automatically adds a native clear button in most browsers */}
      <InputGroupInput ref={ref} type="search" className="pl-10" {...props} />
    </InputGroup>
  ),
  { displayName: "SearchInput" },
);

const DateInput = configuredComponent<SpecializedInputProps, HTMLInputElement>(
  (props, ref) => {
    const isTouch = useHasPointer();
    const [internalValue, setInternalValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isTouch) {
        // Auto-format MM/DD/YYYY on the fly
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 8);
        let formatted = digitsOnly;

        if (digitsOnly.length > 2 && digitsOnly.length <= 4) {
          formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
        } else if (digitsOnly.length > 4) {
          formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
        }

        // Update both the synthetic event and internal state
        e.target.value = formatted;
        setInternalValue(formatted);
      }
      props.onChange?.(e);
    };

    if (isTouch) {
      return (
        <NativeInput
          ref={ref}
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          maxLength={10}
          {...props}
          // Let controlled forms override internal state
          value={props.value !== undefined ? props.value : internalValue}
          onChange={handleChange}
        />
      );
    }

    // Fallback to native computer calendar picker
    return <NativeInput ref={ref} type="date" {...props} />;
  },
  { displayName: "DateInput" },
);

// Extensions (extends `type`).
const TextareaInput = configuredComponent<
  React.ComponentProps<"textarea">,
  HTMLTextAreaElement
>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-transparent bg-input/50 px-3 py-3 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  ),
  { displayName: "TextareaInput" },
);

// --- GROUPED EXPORT ---
// Access as specialized.TextInput, specialized.PasswordInput, etc.

export const specialized = {
  TextInput,
  EmailInput,
  NumberInput,
  HiddenInput,
  TelInput,
  UrlInput,
  TimeInput,
  DatetimeLocalInput,
  MonthInput,
  WeekInput,
  CheckboxInput,
  RadioInput,
  RangeInput,
  ColorInput,
  FileInput,
  PasswordInput,
  SearchInput,
  DateInput,
  TextareaInput,
};

export const Select = NativeSelect;
export const SelectOptGroup = NativeSelectOptGroup;
export const SelectOption = NativeSelectOption;