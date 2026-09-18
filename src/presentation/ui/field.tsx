import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { Separator } from "react-resizable-panels";

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

FieldSet.displayName = "FieldSet";

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

FieldLegend.displayName = "FieldLegend";

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

FieldGroup.displayName = "FieldGroup";

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

Field.displayName = "Field";

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

FieldContent.displayName = "FieldContent";

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

Label.displayName = "Label";

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

FieldLabel.displayName = "FieldLabel";

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

FieldTitle.displayName = "FieldTitle";

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

FieldDescription.displayName = "FieldDescription";

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

FieldSeparator.displayName = "FieldSeparator";

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

FieldError.displayName = "FieldError";

export {
  Field,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldSeparator,
  FieldError,
  Label,
}
