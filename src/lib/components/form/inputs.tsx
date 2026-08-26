"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeInput } from "./native-input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";
import useHasPointer from "../../hooks/use-has-pointer";

type SpecializedInputProps = Omit<
  React.ComponentProps<typeof NativeInput>,
  "type"
>;

export const TextInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, forwardedRef) => <NativeInput ref={forwardedRef} type="text" {...props} />
);
TextInput.displayName = "TextInput";

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

export const EmailInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="email" inputMode="email" {...props} />
);
EmailInput.displayName = "EmailInput";

export const NumberInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="number" {...props} />
);
NumberInput.displayName = "NumberInput";

export const HiddenInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="hidden" {...props} className="hidden" />
);
HiddenInput.displayName = "HiddenInput";


// --- TIER 2: STANDARD TEXT VARIANTS ---

export const TelInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="tel" inputMode="tel" {...props} />
);
TelInput.displayName = "TelInput";

export const UrlInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="url" inputMode="url" {...props} />
);
UrlInput.displayName = "UrlInput";

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

export const TimeInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="time" {...props} />
);
TimeInput.displayName = "TimeInput";

export const DatetimeLocalInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="datetime-local" {...props} />
);
DatetimeLocalInput.displayName = "DatetimeLocalInput";

export const MonthInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="month" {...props} />
);
MonthInput.displayName = "MonthInput";

export const WeekInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="week" {...props} />
);
WeekInput.displayName = "WeekInput";

export const CheckboxInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="checkbox" {...props} />
);
CheckboxInput.displayName = "CheckboxInput";

export const RadioInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="radio" {...props} />
);
RadioInput.displayName = "RadioInput";

export const RangeInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="range" {...props} />
);
RangeInput.displayName = "RangeInput";

export const ColorInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="color" {...props} />
);
ColorInput.displayName = "ColorInput";

export const FileInput = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
  (props, ref) => <NativeInput ref={ref} type="file" {...props} />
);
FileInput.displayName = "ColorInput";


export type InputProps = React.ComponentProps<typeof NativeInput>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", ...props }, ref) => {
    switch (type) {
      case "text":
        return <TextInput ref={ref} {...props} />;
      case "password":
        return <PasswordInput ref={ref} {...props} />;
      case "email":
        return <EmailInput ref={ref} {...props} />;
      case "number":
        return <NumberInput ref={ref} {...props} />;
      case "hidden":
        return <HiddenInput ref={ref} {...props} />;
      case "tel":
        return <TelInput ref={ref} {...props} />;
      case "url":
        return <UrlInput ref={ref} {...props} />;
      case "search":
        return <SearchInput ref={ref} {...props} />;
      case "date":
        return <DateInput ref={ref} {...props} />;
      case "time":
        return <TimeInput ref={ref} {...props} />;
      case "datetime-local":
        return <DatetimeLocalInput ref={ref} {...props} />;
      case "month":
        return <MonthInput ref={ref} {...props} />;
      case "week":
        return <WeekInput ref={ref} {...props} />;
      case "checkbox":
        return <CheckboxInput ref={ref} {...props} />;
      case "radio":
        return <RadioInput ref={ref} {...props} />;
      case "range":
        return <RangeInput ref={ref} {...props} />;
      case "color":
        return <ColorInput ref={ref} {...props} />;
      case "file":
        return <FileInput ref={ref} {...props} />;
      default:
        // Escape hatch: Fallback to NativeInput for any custom or unrecognized input type
        return <NativeInput ref={ref} type={type} {...props} />;
    }
  }
);

Input.displayName = "Input";