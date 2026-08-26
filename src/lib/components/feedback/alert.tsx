import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import cn from "@/lib/utilities/cn"
import {
  throwIfUsingRenderProp,
  type PolymorphicComponentProps,
} from "@/lib/components/component-polymorphism"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-2xl border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert<TAs extends React.ElementType = "div">({
  className,
  variant,
  as,
  render,
  ...props
}: PolymorphicComponentProps<VariantProps<typeof alertVariants>, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle<TAs extends React.ElementType = "div">({ className, as, render, ...props }: PolymorphicComponentProps<Record<string, never>, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription<TAs extends React.ElementType = "div">({
  className,
  as,
  render,
  ...props
}: PolymorphicComponentProps<Record<string, never>, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction<TAs extends React.ElementType = "div">({ className, as, render, ...props }: PolymorphicComponentProps<Record<string, never>, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
