import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { useHasPointer } from "@/hooks/use-has-pointer";
import { InputProps } from "@base-ui/react";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "../input-group";

type SpecializedInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

/**
 * Factory for input variants that are nothing more than
 * `<Input type="..." {...props} />`. Keeps displayName wiring
 * and forwardRef boilerplate in one place instead of repeated per type.
 */
const createSimpleInput = (
  type: string,
  displayName: string,
  extraProps: Partial<React.ComponentProps<typeof Input>> = {},
): React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> => {
  const Component = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
    (props, ref) => (
      <Input ref={ref} type={type} {...extraProps} {...props} />
    ),
  );
  Component.displayName = displayName;
  return Component as React.FC<
    SpecializedInputProps & React.RefAttributes<HTMLInputElement>
  >;
};

// --- TIER 1: SIMPLE TEXT-LIKE VARIANTS ---
const TextInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("text", "TextInput");
const EmailInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("email", "EmailInput", {
  inputMode: "email",
});
const NumberInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("number", "NumberInput");
const HiddenInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("hidden", "HiddenInput", {
  className: "hidden",
}) as React.FC<InputProps & React.RefAttributes<HTMLInputElement>>;

// --- TIER 2: STANDARD TEXT VARIANTS ---
const TelInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("tel", "TelInput", {
  inputMode: "tel",
}) as React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>>;
const UrlInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("url", "UrlInput", {
  inputMode: "url",
}) as React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>>;
const TimeInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("time", "TimeInput");
const DatetimeLocalInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput(
  "datetime-local",
  "DatetimeLocalInput",
);
const MonthInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("month", "MonthInput");
const WeekInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("week", "WeekInput");
const CheckboxInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("checkbox", "CheckboxInput");
const RadioInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("radio", "RadioInput");
const RangeInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("range", "RangeInput");
const ColorInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("color", "ColorInput");
const FileInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("file", "FileInput");

// --- CUSTOM VARIANTS (real logic beyond swapping `type`) ---

const PasswordInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
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
  }















,
);
PasswordInput.displayName = "PasswordInput";

const SearchInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => {
    return (
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
    );
  },
);
SearchInput.displayName = "SearchInput";

const DateInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
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
        <Input
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
    return <Input ref={ref} type="date" {...props} />;
  },
);
DateInput.displayName = "DateInput";

export type { SpecializedInputProps };

export {
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
};