"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeInput } from "./native-input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";
import { useHasPointer } from "@/lib/hooks";

type SpecializedInputProps = Omit<
  React.ComponentProps<typeof NativeInput>,
  "type"
>;

/**
 * Factory for input variants that are nothing more than
 * `<NativeInput type="..." {...props} />`. Keeps displayName wiring
 * and forwardRef boilerplate in one place instead of repeated per type.
 */
function createSimpleInput(
  type: string,
  displayName: string,
  extraProps: Partial<React.ComponentProps<typeof NativeInput>> = {}
) {
  const Component = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
    (props, ref) => (
      <NativeInput ref={ref} type={type} {...extraProps} {...props} />
    )
  );
  Component.displayName = displayName;
  return Component;
}

// --- TIER 1: SIMPLE TEXT-LIKE VARIANTS ---
export const TextInput = createSimpleInput("text", "TextInput");
export const EmailInput = createSimpleInput("email", "EmailInput", {
  inputMode: "email",
});
export const NumberInput = createSimpleInput("number", "NumberInput");
export const HiddenInput = createSimpleInput("hidden", "HiddenInput", {
  className: "hidden",
});

// --- TIER 2: STANDARD TEXT VARIANTS ---
export const TelInput = createSimpleInput("tel", "TelInput", {
  inputMode: "tel",
});
export const UrlInput = createSimpleInput("url", "UrlInput", {
  inputMode: "url",
});
export const TimeInput = createSimpleInput("time", "TimeInput");
export const DatetimeLocalInput = createSimpleInput(
  "datetime-local",
  "DatetimeLocalInput"
);
export const MonthInput = createSimpleInput("month", "MonthInput");
export const WeekInput = createSimpleInput("week", "WeekInput");
export const CheckboxInput = createSimpleInput("checkbox", "CheckboxInput");
export const RadioInput = createSimpleInput("radio", "RadioInput");
export const RangeInput = createSimpleInput("range", "RangeInput");
export const ColorInput = createSimpleInput("color", "ColorInput");
export const FileInput = createSimpleInput("file", "FileInput"); // was mis-named "ColorInput" in the original

// --- CUSTOM VARIANTS (real logic beyond swapping `type`) ---

export const PasswordInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  function PasswordInput(props, ref) {
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
        { signal: abortController.signal }
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
  }
);
PasswordInput.displayName = "PasswordInput";

export const SearchInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => {
    return (
      <InputGroup>
        <InputGroupAddon align="inline-start" className="pointer-events-none px-3 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </InputGroupAddon>
        {/* standard type="search" automatically adds a native clear button in most browsers */}
        <InputGroupInput ref={ref} type="search" className="pl-10" {...props} />
      </InputGroup>
    );
  }
);
SearchInput.displayName = "SearchInput";

export const DateInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
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
  }
);
DateInput.displayName = "DateInput";

// --- DISPATCHER ---

export type InputProps = React.ComponentProps<typeof NativeInput>;

const INPUT_COMPONENTS: Record<
  string,
  React.ForwardRefExoticComponent<
    SpecializedInputProps & React.RefAttributes<HTMLInputElement>
  >
> = {
  text: TextInput,
  password: PasswordInput,
  email: EmailInput,
  number: NumberInput,
  hidden: HiddenInput,
  tel: TelInput,
  url: UrlInput,
  search: SearchInput,
  date: DateInput,
  time: TimeInput,
  "datetime-local": DatetimeLocalInput,
  month: MonthInput,
  week: WeekInput,
  checkbox: CheckboxInput,
  radio: RadioInput,
  range: RangeInput,
  color: ColorInput,
  file: FileInput,
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", ...props }, ref) => {
    const Component = INPUT_COMPONENTS[type];
    // Escape hatch: fall back to NativeInput for any custom/unrecognized type
    if (!Component) return <NativeInput ref={ref} type={type} {...props} />;
    return <Component ref={ref} {...props} />;
  }
);
Input.displayName = "Input";