"use client";

import React, {
  createContext,
  useContext,
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
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
import { cva, type VariantProps } from "class-variance-authority";
import { OTPInput, OTPInputContext } from "input-otp";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XIcon,
  MinusIcon,
} from "lucide-react";

import { cn } from "@/lib/client";
import { useHasPointer } from "@/lib/hooks";
import { useServerAction } from "@/lib/action/client";
import type {
  AnyFunctionCoercedServerAction,
  InferFunctionCoercedServerActionResultData,
} from "@/lib/action/server";
import type { ActionFailure } from "@/lib/common-server-action-protocol";
import { Button, buttonVariants } from "@/lib/components/actions/button";
import { Card } from "@/lib/components/display/card";
import { Separator } from "@/lib/components/layout/separator";

// ===========================================================================
// Native primitives
// ===========================================================================

type NativeInputProps = React.ComponentProps<"input">;

const NativeInput: React.FC<NativeInputProps & React.RefAttributes<HTMLInputElement>> =
  React.forwardRef<HTMLInputElement, NativeInputProps>((props, forwardedRef) => {
  const { className, type, ...rest } = props;
  return (
    <InputPrimitive
      ref={forwardedRef}
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...rest}
    />
  );
}) as React.FC<NativeInputProps & React.RefAttributes<HTMLInputElement>>;

NativeInput.displayName = "native.Input";

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
};

const NativeSelect: React.FC<NativeSelectProps> = ({
  className,
  size = "default",
  ...props
}) => (
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

NativeSelect.displayName = "native.Select";

const NativeSelectOption: React.FC<React.ComponentProps<"option">> = ({
  className,
  ...props
}) => (
  <option
    data-slot="native-select-option"
    className={cn("bg-[Canvas] text-[CanvasText]", className)}
    {...props}
  />
);

NativeSelectOption.displayName = "native.SelectOption";

const NativeSelectOptGroup: React.FC<React.ComponentProps<"optgroup">> = ({
  className,
  ...props
}) => (
  <optgroup
    data-slot="native-select-optgroup"
    className={cn("bg-[Canvas] text-[CanvasText]", className)}
    {...props}
  />
);

NativeSelectOptGroup.displayName = "native.SelectOptGroup";

// models the public api
export interface NativeComponents {
  Input: typeof NativeInput;
  Select: typeof NativeSelect;
  SelectOptGroup: typeof NativeSelectOptGroup;
  SelectOption: typeof NativeSelectOption;
}

const native = {} as NativeComponents;

native.Input = NativeInput;
native.Select = NativeSelect;
native.SelectOptGroup = NativeSelectOptGroup;
native.SelectOption = NativeSelectOption;

export { native };

// ===========================================================================
// Input Group
// ===========================================================================

const InputGroup: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    data-slot="input-group"
    role="group"
    className={cn(
      "group/input-group relative flex h-9 w-full min-w-0 items-center rounded-4xl border border-transparent bg-input/50 transition-[color,box-shadow,background-color] outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-data-[align=block-end]:rounded-3xl has-data-[align=block-start]:rounded-3xl has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/30 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[textarea]:rounded-2xl has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
      className,
    )}
    {...props}
  />
);

InputGroup.displayName = "inputGroup.Root";

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 **:data-[slot=kbd]:rounded-3xl **:data-[slot=kbd]:bg-muted-foreground/10 **:data-[slot=kbd]:px-1.5 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:-ml-1 has-[>kbd]:-ml-1",
        "inline-end": "order-last pr-3 has-[>button]:-mr-1 has-[>kbd]:-mr-1",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-3.5 [.border-b]:pb-3.5",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-3.5 [.border-t]:pt-3.5",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

const InputGroupAddon: React.FC<React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>> = ({
  className,
  align = "inline-start",
  ...props
}) => (
  <div
    role="group"
    data-slot="input-group-addon"
    data-align={align}
    className={cn(inputGroupAddonVariants({ align }), className)}
    onClick={(e) => {
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }
      e.currentTarget.parentElement?.querySelector("input")?.focus();
    }}
    {...props}
  />
);

InputGroupAddon.displayName = "inputGroup.Addon";

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 rounded-4xl text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-xl px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs": "size-6 rounded-xl p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

const InputGroupButton: React.FC<Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset";
  }> = ({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}) => (
  <Button
    type={type}
    data-size={size}
    variant={variant}
    className={cn(inputGroupButtonVariants({ size }), className)}
    {...props}
  />
);

InputGroupButton.displayName = "inputGroup.Button";

const InputGroupText: React.FC<React.ComponentProps<"span">> = ({
  className,
  ...props
}) => (
  <span
    className={cn(
      "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
      className,
    )}
    {...props}
  />
);

InputGroupText.displayName = "inputGroup.Text";

const InputGroupInput: React.FC<React.ComponentProps<"input">> = ({
  className,
  ...props
}) => (
  <NativeInput
    data-slot="input-group-control"
    className={cn(
      "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
      className,
    )}
    {...props}
  />
);

InputGroupInput.displayName = "inputGroup.Input";

const InputGroupTextarea: React.FC<React.ComponentProps<"textarea">> = ({
  className,
  ...props
}) => (
  <Textarea
    data-slot="input-group-control"
    className={cn(
      "flex-1 resize-none rounded-none border-0 bg-transparent py-2.5 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
      className,
    )}
    {...props}
  />
);

InputGroupTextarea.displayName = "inputGroup.Textarea";

// models the public api
export interface InputGroupComponents {
  Root: typeof InputGroup;
  Addon: typeof InputGroupAddon;
  Button: typeof InputGroupButton;
  Text: typeof InputGroupText;
  Input: typeof InputGroupInput;
  Textarea: typeof InputGroupTextarea;
}

const inputGroup = {} as InputGroupComponents;

// component implementation of InputGroup
inputGroup.Root = InputGroup;
// component implementation of InputGroupAddon
inputGroup.Addon = InputGroupAddon;
// component implementation of InputGroupButton
inputGroup.Button = InputGroupButton;
// component implementation of InputGroupText
inputGroup.Text = InputGroupText;
// component implementation of InputGroupInput
inputGroup.Input = InputGroupInput;
// component implementation of InputGroupTextarea
inputGroup.Textarea = InputGroupTextarea;

export { inputGroup };

// ===========================================================================
// Input OTP
// ===========================================================================

const InputOTP: React.FC<React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}> = ({
  className,
  containerClassName,
  ...props
}) => (
  <OTPInput
    data-slot="input-otp"
    containerClassName={cn(
      "cn-input-otp flex items-center has-disabled:opacity-50",
      containerClassName,
    )}
    spellCheck={false}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
);

InputOTP.displayName = "inputOtp.Root";

const InputOTPGroup: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    data-slot="input-otp-group"
    className={cn(
      "flex items-center rounded-3xl has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
      className,
    )}
    {...props}
  />
);

InputOTPGroup.displayName = "inputOtp.Group";

const InputOTPSlot: React.FC<React.ComponentProps<"div"> & {
  index: number;
}> = ({
  index,
  className,
  ...props
}) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex size-9 items-center justify-center border-y border-r border-input bg-input/50 text-sm transition-all outline-none first:rounded-l-3xl first:border-l last:rounded-r-3xl aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/30 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
};

InputOTPSlot.displayName = "inputOtp.Slot";

const InputOTPSeparator: React.FC<React.ComponentProps<"div">> = ({ ...props }) => (
  <div
    data-slot="input-otp-separator"
    className="flex items-center [&_svg:not([class*='size-'])]:size-4"
    role="separator"
    {...props}
  >
    <MinusIcon />
  </div>
);

InputOTPSeparator.displayName = "inputOtp.Separator";

// models the public api
export interface InputOTPComponents {
  Root: typeof InputOTP;
  Group: typeof InputOTPGroup;
  Slot: typeof InputOTPSlot;
  Separator: typeof InputOTPSeparator;
}

const inputOtp = {} as InputOTPComponents;

// component implementation of InputOTP
inputOtp.Root = InputOTP;
// component implementation of InputOTPGroup
inputOtp.Group = InputOTPGroup;
// component implementation of InputOTPSlot
inputOtp.Slot = InputOTPSlot;
// component implementation of InputOTPSeparator
inputOtp.Separator = InputOTPSeparator;

export { inputOtp };

// ===========================================================================
// Checkbox
// ===========================================================================

const Checkbox: React.FC<CheckboxPrimitive.Root.Props> = ({ className, ...props }) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    className={cn(
      "peer relative flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-transparent bg-input/90 transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
    >
      <CheckIcon />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

Checkbox.displayName = "Checkbox";

export { Checkbox };

// ===========================================================================
// Radio Group
// ===========================================================================

const RadioGroup: React.FC<RadioGroupPrimitive.Props> = ({
  className,
  ...props
}) => (
  <RadioGroupPrimitive
    data-slot="radio-group"
    className={cn("grid w-full gap-3", className)}
    {...props}
  />
);

RadioGroup.displayName = "radioGroup.Root";

const RadioGroupItem: React.FC<RadioPrimitive.Root.Props> = ({
  className,
  ...props
}) => (
  <RadioPrimitive.Root
    data-slot="radio-group-item"
    className={cn(
      "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-transparent bg-input/90 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
      className,
    )}
    {...props}
  >
    <RadioPrimitive.Indicator
      data-slot="radio-group-indicator"
      className="flex size-4 items-center justify-center"
    >
      <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground dark:size-2.5" />
    </RadioPrimitive.Indicator>
  </RadioPrimitive.Root>
);

RadioGroupItem.displayName = "radioGroup.Item";

// models the public api
export interface RadioGroupComponents {
  Root: typeof RadioGroup;
  Item: typeof RadioGroupItem;
}

const radioGroup = {} as RadioGroupComponents;

// component implementation of RadioGroup
radioGroup.Root = RadioGroup;
// component implementation of RadioGroupItem
radioGroup.Item = RadioGroupItem;

export { radioGroup };

// ===========================================================================
// Switch
// ===========================================================================

const Switch: React.FC<SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}> = ({
  className,
  size = "default",
  ...props
}) => (
  <SwitchPrimitive.Root
    data-slot="switch"
    data-size={size}
    className={cn(
      "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-5 data-[size=default]:w-11 data-[size=sm]:h-4 data-[size=sm]:w-7 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-unchecked:border-transparent data-unchecked:bg-input/90 data-disabled:cursor-not-allowed data-disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className="pointer-events-none block rounded-full bg-background shadow-sm ring-0 transition-transform not-dark:bg-clip-padding group-data-[size=default]/switch:h-4 group-data-[size=default]/switch:w-6 group-data-[size=sm]/switch:h-3 group-data-[size=sm]/switch:w-4 data-checked:translate-x-[calc(100%-8px)] dark:data-checked:bg-primary-foreground data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
    />
  </SwitchPrimitive.Root>
);

Switch.displayName = "Switch";

export { Switch };

// ===========================================================================
// Toggle / Toggle Group
// ===========================================================================

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-3xl text-sm font-medium whitespace-nowrap transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-muted",
      },
      size: {
        default:
          "h-9 min-w-9 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        sm: "h-8 min-w-8 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 min-w-10 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle: React.FC<TogglePrimitive.Props & VariantProps<typeof toggleVariants>> = ({
  className,
  variant = "default",
  size = "default",
  ...props
}) => (
  <TogglePrimitive
    data-slot="toggle"
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
);

Toggle.displayName = "toggle.Root";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

const ToggleGroup: React.FC<ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }> = ({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}) => (
  <ToggleGroupPrimitive
    data-slot="toggle-group"
    data-variant={variant}
    data-size={size}
    data-spacing={spacing}
    data-orientation={orientation}
    style={{ "--gap": spacing } as React.CSSProperties}
    className={cn(
      "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-[spacing=0]:data-[variant=outline]:rounded-3xl data-vertical:flex-col data-vertical:items-stretch",
      className,
    )}
    {...props}
  >
    <ToggleGroupContext.Provider
      value={{ variant, size, spacing, orientation }}
    >
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive>
);

ToggleGroup.displayName = "toggle.Group";

const ToggleGroupItem: React.FC<TogglePrimitive.Props & VariantProps<typeof toggleVariants>> = ({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-3 group-data-[spacing=0]/toggle-group:shadow-none focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-2.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-2.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-3xl group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-3xl group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-3xl group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-3xl data-[state=on]:bg-muted group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
};

ToggleGroupItem.displayName = "toggle.GroupItem";

// models the public api
export interface ToggleComponents {
  Root: typeof Toggle;
  Group: typeof ToggleGroup;
  GroupItem: typeof ToggleGroupItem;
}

const toggle = {} as ToggleComponents;

// component implementation of Toggle
toggle.Root = Toggle;
// component implementation of ToggleGroup
toggle.Group = ToggleGroup;
// component implementation of ToggleGroupItem
toggle.GroupItem = ToggleGroupItem;

export { toggle, toggleVariants };

// ===========================================================================
// Slider
// ===========================================================================

const Slider: React.FC<SliderPrimitive.Root.Props> = ({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) => {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-input/90 select-none data-horizontal:h-2 data-horizontal:w-full data-vertical:h-full data-vertical:w-2"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="block h-4 w-6 shrink-0 rounded-full bg-white shadow-md ring-1 ring-black/10 transition-[color,box-shadow,background-color] select-none not-dark:bg-clip-padding hover:ring-4 hover:ring-ring/30 focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-vertical:h-6 data-vertical:w-4"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
};

Slider.displayName = "Slider";

export { Slider };

// ===========================================================================
// Select
// ===========================================================================

const Select = function<TVal, TMul extends boolean>(props: SelectPrimitive.Root.Props<TVal, TMul>) { return <SelectPrimitive.Root {...props} /> };

const SelectGroup: React.FC<SelectPrimitive.Group.Props> = ({ className, ...props }) => (
  <SelectPrimitive.Group
    data-slot="select-group"
    className={cn("scroll-my-1.5 p-1.5", className)}
    {...props}
  />
);

Select.displayName = "select.Root";

SelectGroup.displayName = "select.Group";

const SelectValue: React.FC<SelectPrimitive.Value.Props> = ({ className, ...props }) => (
  <SelectPrimitive.Value
    data-slot="select-value"
    className={cn("flex flex-1 text-left", className)}
    {...props}
  />
);

SelectValue.displayName = "select.Value";

const SelectTrigger: React.FC<SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default";
}> = ({
  className,
  size = "default",
  children,
  ...props
}) => (
  <SelectPrimitive.Trigger
    data-slot="select-trigger"
    data-size={size}
    className={cn(
      "flex w-fit items-center justify-between gap-1.5 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon
      render={
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      }
    />
  </SelectPrimitive.Trigger>
);

SelectTrigger.displayName = "select.Trigger";

const SelectContent: React.FC<SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >> = ({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger}
      className="isolate z-50"
    >
      <SelectPrimitive.Popup
        data-slot="select-content"
        data-align-trigger={alignItemWithTrigger}
        className={cn(
          "isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-3xl text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 animate-none! relative bg-popover/70 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150 **:data-[slot$=-item]:focus:bg-foreground/10 **:data-[slot$=-item]:data-highlighted:bg-foreground/10 **:data-[slot$=-separator]:bg-foreground/5 **:data-[slot$=-trigger]:focus:bg-foreground/10 **:data-[slot$=-trigger]:aria-expanded:bg-foreground/10! **:data-[variant=destructive]:focus:bg-foreground/10! **:data-[variant=destructive]:text-accent-foreground! **:data-[variant=destructive]:**:text-accent-foreground!",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.List>{children}</SelectPrimitive.List>
        <SelectScrollDownButton />
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
);

SelectContent.displayName = "select.Content";

const SelectLabel: React.FC<SelectPrimitive.GroupLabel.Props> = ({
  className,
  ...props
}) => (
  <SelectPrimitive.GroupLabel
    data-slot="select-label"
    className={cn("px-3 py-2.5 text-xs text-muted-foreground", className)}
    {...props}
  />
);

SelectLabel.displayName = "select.Label";

const SelectItem: React.FC<SelectPrimitive.Item.Props> = ({
  className,
  children,
  ...props
}) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(
      "relative flex w-full cursor-default items-center gap-2.5 rounded-2xl py-2 pr-8 pl-3 text-sm font-medium outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
      {children}
    </SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator
      render={
        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
      }
    >
      <CheckIcon className="pointer-events-none" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
);

SelectItem.displayName = "select.Item";

const SelectSeparator: React.FC<SelectPrimitive.Separator.Props> = ({
  className,
  ...props
}) => (
  <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn("pointer-events-none -mx-1.5 my-1.5 h-px bg-border", className)}
    {...props}
  />
);

SelectSeparator.displayName = "select.Separator";

const SelectScrollUpButton: React.FC<React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>> = ({
  className,
  ...props
}) => (
  <SelectPrimitive.ScrollUpArrow
    data-slot="select-scroll-up-button"
    className={cn(
      "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
      className,
    )}
    {...props}
  >
    <ChevronUpIcon />
  </SelectPrimitive.ScrollUpArrow>
);

SelectScrollUpButton.displayName = "select.ScrollUpButton";

const SelectScrollDownButton: React.FC<React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>> = ({
  className,
  ...props
}) => (
  <SelectPrimitive.ScrollDownArrow
    data-slot="select-scroll-down-button"
    className={cn(
      "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
      className,
    )}
    {...props}
  >
    <ChevronDownIcon />
  </SelectPrimitive.ScrollDownArrow>
);

SelectScrollDownButton.displayName = "select.ScrollDownButton";

// models the public api
export interface SelectComponents {
  Root: typeof Select;
  Content: typeof SelectContent;
  Group: typeof SelectGroup;
  Item: typeof SelectItem;
  Label: typeof SelectLabel;
  ScrollDownButton: typeof SelectScrollDownButton;
  ScrollUpButton: typeof SelectScrollUpButton;
  Separator: typeof SelectSeparator;
  Trigger: typeof SelectTrigger;
  Value: typeof SelectValue;
}

const select = {} as SelectComponents;

// component implementation of Select
select.Root = Select;
// component implementation of SelectContent
select.Content = SelectContent;
// component implementation of SelectGroup
select.Group = SelectGroup;
// component implementation of SelectItem
select.Item = SelectItem;
// component implementation of SelectLabel
select.Label = SelectLabel;
// component implementation of SelectScrollDownButton
select.ScrollDownButton = SelectScrollDownButton;
// component implementation of SelectScrollUpButton
select.ScrollUpButton = SelectScrollUpButton;
// component implementation of SelectSeparator
select.Separator = SelectSeparator;
// component implementation of SelectTrigger
select.Trigger = SelectTrigger;
// component implementation of SelectValue
select.Value = SelectValue;

export { select };

// ===========================================================================
// Combobox
// ===========================================================================

const Combobox = function<TVal, TMul extends boolean> (props: ComboboxPrimitive.Root.Props<TVal, TMul>) { return <ComboboxPrimitive.Root {...props} /> };

const ComboboxValue: React.FC<ComboboxPrimitive.Value.Props> = ({ ...props }) => (
  <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
);

Combobox.displayName = "combobox.Root";

ComboboxValue.displayName = "combobox.Value";

const ComboboxTrigger: React.FC<ComboboxPrimitive.Trigger.Props> = ({
  className,
  children,
  ...props
}) => (
  <ComboboxPrimitive.Trigger
    data-slot="combobox-trigger"
    className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
    {...props}
  >
    {children}
    <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
  </ComboboxPrimitive.Trigger>
);

ComboboxTrigger.displayName = "combobox.Trigger";

const ComboboxClear: React.FC<ComboboxPrimitive.Clear.Props> = ({
  className,
  ...props
}) => (
  <ComboboxPrimitive.Clear
    data-slot="combobox-clear"
    render={<InputGroupButton variant="ghost" size="icon-xs" />}
    className={cn(className)}
    {...props}
  >
    <XIcon className="pointer-events-none" />
  </ComboboxPrimitive.Clear>
);

ComboboxClear.displayName = "combobox.Clear";

const ComboboxInput: React.FC<ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
}> = ({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}) => (
  <InputGroup className={cn("w-auto", className)}>
    <ComboboxPrimitive.Input
      render={<InputGroupInput disabled={disabled} />}
      {...props}
    />
    <InputGroupAddon align="inline-end">
      {showTrigger && (
        <InputGroupButton
          size="icon-xs"
          variant="ghost"
          render={<ComboboxTrigger />}
          data-slot="input-group-button"
          className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
          disabled={disabled}
        />
      )}
      {showClear && <ComboboxClear disabled={disabled} />}
    </InputGroupAddon>
    {children}
  </InputGroup>
);

ComboboxInput.displayName = "combobox.Input";

const ComboboxContent: React.FC<ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >> = ({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}) => (
  <ComboboxPrimitive.Portal>
    <ComboboxPrimitive.Positioner
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      anchor={anchor}
      className="isolate z-50"
    >
      <ComboboxPrimitive.Popup
        data-slot="combobox-content"
        data-chips={!!anchor}
        className={cn(
          "group/combobox-content max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-3xl text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1.5 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/50 *:data-[slot=input-group]:shadow-none dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 animate-none! relative bg-popover/70 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150 **:data-[slot$=-item]:focus:bg-foreground/10 **:data-[slot$=-item]:data-highlighted:bg-foreground/10 **:data-[slot$=-separator]:bg-foreground/5 **:data-[slot$=-trigger]:focus:bg-foreground/10 **:data-[slot$=-trigger]:aria-expanded:bg-foreground/10! **:data-[variant=destructive]:focus:bg-foreground/10! **:data-[variant=destructive]:text-accent-foreground! **:data-[variant=destructive]:**:text-accent-foreground!",
          className,
        )}
        {...props}
      />
    </ComboboxPrimitive.Positioner>
  </ComboboxPrimitive.Portal>
);

ComboboxContent.displayName = "combobox.Content";

const ComboboxList: React.FC<ComboboxPrimitive.List.Props> = ({
  className,
  ...props
}) => (
  <ComboboxPrimitive.List
    data-slot="combobox-list"
    className={cn(
      "no-scrollbar max-h-[min(calc(--spacing(72)-(--spacing(9))),calc(var(--available-height)-(--spacing(9))))] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 data-empty:p-0",
      className,
    )}
    {...props}
  />
);

ComboboxList.displayName = "combobox.List";

const ComboboxItem: React.FC<ComboboxPrimitive.Item.Props> = ({
  className,
  children,
  ...props
}) => (
  <ComboboxPrimitive.Item
    data-slot="combobox-item"
    className={cn(
      "relative flex w-full cursor-default items-center gap-2.5 rounded-2xl py-2 pr-8 pl-3 text-sm font-medium outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className,
    )}
    {...props}
  >
    {children}
    <ComboboxPrimitive.ItemIndicator
      render={
        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
      }
    >
      <CheckIcon className="pointer-events-none" />
    </ComboboxPrimitive.ItemIndicator>
  </ComboboxPrimitive.Item>
);

ComboboxItem.displayName = "combobox.Item";

const ComboboxGroup: React.FC<ComboboxPrimitive.Group.Props> = ({
  className,
  ...props
}) => (
  <ComboboxPrimitive.Group
    data-slot="combobox-group"
    className={cn(className)}
    {...props}
  />
);

ComboboxGroup.displayName = "combobox.Group";

const ComboboxLabel: React.FC<ComboboxPrimitive.GroupLabel.Props> = ({
  className,
  ...props
}) => (
  <ComboboxPrimitive.GroupLabel
    data-slot="combobox-label"
    className={cn("px-3 py-2.5 text-xs text-muted-foreground", className)}
    {...props}
  />
);

ComboboxLabel.displayName = "combobox.Label";

const ComboboxCollection: React.FC<ComboboxPrimitive.Collection.Props> = ({ ...props }) => (
  <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
);

ComboboxCollection.displayName = "combobox.Collection";

const ComboboxEmpty: React.FC<ComboboxPrimitive.Empty.Props> = ({
  className,
  ...props
}) => (
  <ComboboxPrimitive.Empty
    data-slot="combobox-empty"
    className={cn(
      "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex",
      className,
    )}
    {...props}
  />
);

ComboboxEmpty.displayName = "combobox.Empty";

const ComboboxSeparator: React.FC<ComboboxPrimitive.Separator.Props> = ({
  className,
  ...props
}) => (
  <ComboboxPrimitive.Separator
    data-slot="combobox-separator"
    className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
    {...props}
  />
);

ComboboxSeparator.displayName = "combobox.Separator";

const ComboboxChips: React.FC<React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props> = ({
  className,
  ...props
}) => (
  <ComboboxPrimitive.Chips
    data-slot="combobox-chips"
    className={cn(
      "flex min-h-9 flex-wrap items-center gap-1.5 rounded-3xl border border-transparent bg-input/50 bg-clip-padding px-3 py-1.5 text-sm transition-[color,box-shadow,background-color] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1.5 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
      className,
    )}
    {...props}
  />
);

ComboboxChips.displayName = "combobox.Chips";

const ComboboxChip: React.FC<ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}> = ({
  className,
  children,
  showRemove = true,
  ...props
}) => (
  <ComboboxPrimitive.Chip
    data-slot="combobox-chip"
    className={cn(
      "flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-3xl bg-input px-2 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0 dark:bg-input/60",
      className,
    )}
    {...props}
  >
    {children}
    {showRemove && (
      <ComboboxPrimitive.ChipRemove
        render={<Button variant="ghost" size="icon-xs" />}
        className="-ml-1 opacity-50 hover:opacity-100"
        data-slot="combobox-chip-remove"
      >
        <XIcon className="pointer-events-none" />
      </ComboboxPrimitive.ChipRemove>
    )}
  </ComboboxPrimitive.Chip>
);

ComboboxChip.displayName = "combobox.Chip";

const ComboboxChipsInput: React.FC<ComboboxPrimitive.Input.Props> = ({
  className,
  ...props
}) => (
  <ComboboxPrimitive.Input
    data-slot="combobox-chip-input"
    className={cn("min-w-16 flex-1 outline-none", className)}
    {...props}
  />
);

ComboboxChipsInput.displayName = "combobox.ChipsInput";

const useComboboxAnchor = () => React.useRef<HTMLDivElement | null>(null);

// models the public api
export interface ComboboxComponents {
  Root: typeof Combobox;
  Input: typeof ComboboxInput;
  Content: typeof ComboboxContent;
  List: typeof ComboboxList;
  Item: typeof ComboboxItem;
  Group: typeof ComboboxGroup;
  Label: typeof ComboboxLabel;
  Collection: typeof ComboboxCollection;
  Empty: typeof ComboboxEmpty;
  Separator: typeof ComboboxSeparator;
  Chips: typeof ComboboxChips;
  Chip: typeof ComboboxChip;
  ChipsInput: typeof ComboboxChipsInput;
  Trigger: typeof ComboboxTrigger;
  Value: typeof ComboboxValue;
}

const combobox = {} as ComboboxComponents;

// component implementation of Combobox
combobox.Root = Combobox;
// component implementation of ComboboxInput
combobox.Input = ComboboxInput;
// component implementation of ComboboxContent
combobox.Content = ComboboxContent;
// component implementation of ComboboxList
combobox.List = ComboboxList;
// component implementation of ComboboxItem
combobox.Item = ComboboxItem;
// component implementation of ComboboxGroup
combobox.Group = ComboboxGroup;
// component implementation of ComboboxLabel
combobox.Label = ComboboxLabel;
// component implementation of ComboboxCollection
combobox.Collection = ComboboxCollection;
// component implementation of ComboboxEmpty
combobox.Empty = ComboboxEmpty;
// component implementation of ComboboxSeparator
combobox.Separator = ComboboxSeparator;
// component implementation of ComboboxChips
combobox.Chips = ComboboxChips;
// component implementation of ComboboxChip
combobox.Chip = ComboboxChip;
// component implementation of ComboboxChipsInput
combobox.ChipsInput = ComboboxChipsInput;
// component implementation of ComboboxTrigger
combobox.Trigger = ComboboxTrigger;
// component implementation of ComboboxValue
combobox.Value = ComboboxValue;

export { combobox, useComboboxAnchor };

// ===========================================================================
// Calendar
// ===========================================================================

const Calendar: React.FC<React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}> = ({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}) => {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-3 [--cell-radius:var(--radius-4xl)] [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-(--cell-radius)",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label,
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day,
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
          defaultClassNames.range_end,
        ),
        today: cn(
          "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...rest }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(className)}
            {...rest}
          />
        ),
        Chevron: ({ className, orientation, ...rest }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...rest} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...rest} />
            );
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...rest} />
          );
        },
        DayButton: ({ ...rest }) => (
          <CalendarDayButton locale={locale} {...rest} />
        ),
        WeekNumber: ({ children, ...rest }) => (
          <td {...rest}>
            <div className="flex size-(--cell-size) items-center justify-center text-center">
              {children}
            </div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
};

Calendar.displayName = "calendar.Root";

const CalendarDayButton: React.FC<React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }> = ({
  className,
  day,
  modifiers,
  locale,
  ...props
}) => {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
};

CalendarDayButton.displayName = "calendar.DayButton";

// models the public api
export interface CalendarComponents {
  Root: typeof Calendar;
  DayButton: typeof CalendarDayButton;
}

const calendar = {} as CalendarComponents;

// component implementation of Calendar
calendar.Root = Calendar;
// component implementation of CalendarDayButton
calendar.DayButton = CalendarDayButton;

export { calendar };

// ===========================================================================
// Field primitives
// ===========================================================================

const FieldSet: React.FC<React.ComponentProps<"fieldset">> = ({ className, ...props }) => (
  <fieldset
    data-slot="field-set"
    className={cn(
      "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
      className,
    )}
    {...props}
  />
);

FieldSet.displayName = "field.Set";

const FieldLegend: React.FC<React.ComponentProps<"legend"> & { variant?: "legend" | "label" }> = ({
  className,
  variant = "legend",
  ...props
}) => (
  <legend
    data-slot="field-legend"
    data-variant={variant}
    className={cn(
      "mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
      className,
    )}
    {...props}
  />
);

FieldLegend.displayName = "field.Legend";

const FieldGroup: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    data-slot="field-group"
    className={cn(
      "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
      className,
    )}
    {...props}
  />
);

FieldGroup.displayName = "field.Group";

const fieldVariants = cva(
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

const Field: React.FC<React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>> = ({
  className,
  orientation = "vertical",
  ...props
}) => (
  <div
    role="group"
    data-slot="field"
    data-orientation={orientation}
    className={cn(fieldVariants({ orientation }), className)}
    {...props}
  />
);

Field.displayName = "field.Root";

const FieldContent: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    data-slot="field-content"
    className={cn(
      "group/field-content flex flex-1 flex-col gap-1 leading-snug",
      className,
    )}
    {...props}
  />
);

FieldContent.displayName = "field.Content";

const Label: React.FC<React.ComponentProps<"label">> = ({ className, ...props }) => (
  <label
    data-slot="label"
    className={cn(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

Label.displayName = "field.PrimitiveLabel";

const Textarea: React.FC<React.ComponentProps<"textarea">> = ({ className, ...props }) => (
  <textarea
    data-slot="textarea"
    className={cn(
      "flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-transparent bg-input/50 px-3 py-3 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
      className,
    )}
    {...props}
  />
);

Textarea.displayName = "Textarea";

const FieldLabel: React.FC<React.ComponentProps<typeof Label>> = ({
  className,
  ...props
}) => (
  <Label
    data-slot="field-label"
    className={cn(
      "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:bg-input/30 has-[>[data-slot=field]]:rounded-2xl has-[>[data-slot=field]]:border *:data-[slot=field]:p-4",
      "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
      className,
    )}
    {...props}
  />
);

FieldLabel.displayName = "field.Label";

const FieldTitle: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    data-slot="field-label"
    className={cn(
      "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
      className,
    )}
    {...props}
  />
);

FieldTitle.displayName = "field.Title";

const FieldDescription: React.FC<React.ComponentProps<"p">> = ({
  className,
  ...props
}) => (
  <p
    data-slot="field-description"
    className={cn(
      "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
      "last:mt-0 nth-last-2:-mt-1",
      "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
      className,
    )}
    {...props}
  />
);

FieldDescription.displayName = "field.Description";

const FieldSeparator: React.FC<React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}> = ({
  children,
  className,
  ...props
}) => (
  <div
    data-slot="field-separator"
    data-content={!!children}
    className={cn(
      "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
      className,
    )}
    {...props}
  >
    <Separator className="absolute inset-0 top-1/2" />
    {children && (
      <span
        className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
        data-slot="field-separator-content"
      >
        {children}
      </span>
    )}
  </div>
);

FieldSeparator.displayName = "field.Separator";

const FieldError: React.FC<React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}> = ({
  className,
  children,
  errors,
  ...props
}) => {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
};

FieldError.displayName = "field.Error";

// models the public api
export interface FieldComponents {
  Root: typeof Field;
  Label: typeof FieldLabel;
  Description: typeof FieldDescription;
  Error: typeof FieldError;
  Group: typeof FieldGroup;
  Legend: typeof FieldLegend;
  Separator: typeof FieldSeparator;
  Set: typeof FieldSet;
  Content: typeof FieldContent;
  Title: typeof FieldTitle;
  PrimitiveLabel: typeof Label;
}

const field = {} as FieldComponents;

// component implementation of Field
field.Root = Field;
// component implementation of FieldLabel
field.Label = FieldLabel;
// component implementation of FieldDescription
field.Description = FieldDescription;
// component implementation of FieldError
field.Error = FieldError;
// component implementation of FieldGroup
field.Group = FieldGroup;
// component implementation of FieldLegend
field.Legend = FieldLegend;
// component implementation of FieldSeparator
field.Separator = FieldSeparator;
// component implementation of FieldSet
field.Set = FieldSet;
// component implementation of FieldContent
field.Content = FieldContent;
// component implementation of FieldTitle
field.Title = FieldTitle;
// component implementation of Label
field.PrimitiveLabel = Label;

export { field };

// ===========================================================================
// Specialized Inputs
// ===========================================================================

type SpecializedInputProps = Omit<NativeInputProps, "type">;

/**
 * Factory for input variants that are nothing more than
 * `<NativeInput type="..." {...props} />`. Keeps displayName wiring
 * and forwardRef boilerplate in one place instead of repeated per type.
 */
const createSimpleInput = (
  type: string,
  displayName: string,
  extraProps: Partial<React.ComponentProps<typeof NativeInput>> = {},
): React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> => {
  const Component = React.forwardRef<HTMLInputElement, SpecializedInputProps>(
    (props, ref) => (
      <NativeInput ref={ref} type={type} {...extraProps} {...props} />
    ),
  );
  Component.displayName = displayName;
  return Component as React.FC<
    SpecializedInputProps & React.RefAttributes<HTMLInputElement>
  >;
};

// --- TIER 1: SIMPLE TEXT-LIKE VARIANTS ---
const TextInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("text", "TextInput");

TextInput.displayName = "TextInput";
const EmailInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("email", "EmailInput", {
  inputMode: "email",
});

EmailInput.displayName = "EmailInput";
const NumberInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("number", "NumberInput");

NumberInput.displayName = "NumberInput";
const HiddenInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("hidden", "HiddenInput", {
  className: "hidden",
}) as React.FC<InputProps & React.RefAttributes<HTMLInputElement>>;

HiddenInput.displayName = "HiddenInput";

// --- TIER 2: STANDARD TEXT VARIANTS ---
const TelInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("tel", "TelInput", {
  inputMode: "tel",
}) as React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>>;

TelInput.displayName = "TelInput";
const UrlInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("url", "UrlInput", {
  inputMode: "url",
}) as React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>>;

UrlInput.displayName = "UrlInput";
const TimeInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("time", "TimeInput");

TimeInput.displayName = "TimeInput";
const DatetimeLocalInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput(
  "datetime-local",
  "DatetimeLocalInput",
);

DatetimeLocalInput.displayName = "DatetimeLocalInput";
const MonthInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("month", "MonthInput");

MonthInput.displayName = "MonthInput";
const WeekInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("week", "WeekInput");

WeekInput.displayName = "WeekInput";
const CheckboxInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("checkbox", "CheckboxInput");

CheckboxInput.displayName = "CheckboxInput";
const RadioInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("radio", "RadioInput");

RadioInput.displayName = "RadioInput";
const RangeInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("range", "RangeInput");

RangeInput.displayName = "RangeInput";
const ColorInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("color", "ColorInput");

ColorInput.displayName = "ColorInput";
const FileInput: React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>> = createSimpleInput("file", "FileInput");

FileInput.displayName = "FileInput";

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
);
DateInput.displayName = "DateInput";

// --- DISPATCHER ---

export type InputProps = NativeInputProps;

const INPUT_COMPONENTS: Record<
  string,
  React.FC<SpecializedInputProps & React.RefAttributes<HTMLInputElement>>
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

// Kept as private component bindings above (INPUT_COMPONENTS needs the bare
// references); the public surface for these variants is the `input`
// namespace exported below, not individual named exports.

const Input: React.FC<InputProps & React.RefAttributes<HTMLInputElement>> = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", ...props }, ref) => {
    const Component = INPUT_COMPONENTS[type];
    // Escape hatch: fall back to NativeInput for any custom/unrecognized type
    if (!Component) return <NativeInput ref={ref} type={type} {...props} />;
    return <Component ref={ref} {...props} />;
  },
);
Input.displayName = "Input";

// models the public api
export interface InputComponents {
  Text: typeof TextInput;
  Email: typeof EmailInput;
  Number: typeof NumberInput;
  Hidden: typeof HiddenInput;
  Telephone: typeof TelInput;
  Url: typeof UrlInput;
  Time: typeof TimeInput;
  DatetimeLocal: typeof DatetimeLocalInput;
  Month: typeof MonthInput;
  Week: typeof WeekInput;
  Checkbox: typeof CheckboxInput;
  Radio: typeof RadioInput;
  Range: typeof RangeInput;
  Color: typeof ColorInput;
  File: typeof FileInput;
  Password: typeof PasswordInput;
  Search: typeof SearchInput;
  Date: typeof DateInput;
  Textarea: typeof Textarea;
}

const input = {} as InputComponents;

// component implementation of TextInput
input.Text = TextInput;
// component implementation of EmailInput
input.Email = EmailInput;
// component implementation of NumberInput
input.Number = NumberInput;
// component implementation of HiddenInput
input.Hidden = HiddenInput;
// component implementation of TelInput
input.Telephone = TelInput;
// component implementation of UrlInput
input.Url = UrlInput;
// component implementation of TimeInput
input.Time = TimeInput;
// component implementation of DatetimeLocalInput
input.DatetimeLocal = DatetimeLocalInput;
// component implementation of MonthInput
input.Month = MonthInput;
// component implementation of WeekInput
input.Week = WeekInput;
// component implementation of CheckboxInput
input.Checkbox = CheckboxInput;
// component implementation of RadioInput
input.Radio = RadioInput;
// component implementation of RangeInput
input.Range = RangeInput;
// component implementation of ColorInput
input.Color = ColorInput;
// component implementation of FileInput
input.File = FileInput;
// component implementation of PasswordInput
input.Password = PasswordInput;
// component implementation of SearchInput
input.Search = SearchInput;
// component implementation of DateInput
input.Date = DateInput;
// component implementation of Textarea
input.Textarea = Textarea;

export { input };

export { Input };

// ===========================================================================
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
// e.g. <ActionFormExtension action={signup} onSuccess={...} />
// rendered as a child of <Form>.
// ===========================================================================
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

      if (result.type === "validation" || result.type === "constraint") {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          const message = messages?.[0];
          if (message) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            methods.setError(field as any, { type: "server", message });
          }
        }
      }

      if (result.type === "constraint" && result.globalErrors.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        methods.setError("root" as any, {
          type: "server",
          message: result.globalErrors[0],
        });
      }

      if (result.type === "insensitive" || result.type === "sensitive") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        methods.setError("root" as any, {
          type: "server",
          message: result.type === "insensitive" && result.message
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
