import * as React from "react"

import cn from "@/lib/client/utilities/cn"
import {
  AnyComponentProps,
  throwIfUsingRenderProp,
  type PolymorphicComponentProps,
} from "@/lib/client/components/component-polymorphism"

function Card<TAs extends React.ElementType = "div">({
  className,
  size = "default",
  as,
  render,
  ...props
}: PolymorphicComponentProps<{ size?: "default" | "sm" }, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-4xl bg-card py-(--card-spacing) text-sm text-card-foreground shadow-md ring-1 ring-foreground/5 [--card-spacing:--spacing(6)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] dark:ring-foreground/10 *:[img:first-child]:rounded-t-4xl *:[img:last-child]:rounded-b-4xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader<TAs extends React.ElementType = "div">({ className, as, render, ...props }: PolymorphicComponentProps<AnyComponentProps, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-4xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle<TAs extends React.ElementType = "div">({ className, as, render, ...props }: PolymorphicComponentProps<AnyComponentProps, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="card-title"
      className={cn("font-heading text-base font-medium", className)}
      {...props}
    />
  )
}

function CardDescription<TAs extends React.ElementType = "div">({ className, as, render, ...props }: PolymorphicComponentProps<AnyComponentProps, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction<TAs extends React.ElementType = "div">({ className, as, render, ...props }: PolymorphicComponentProps<AnyComponentProps, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent<TAs extends React.ElementType = "div">({ className, as, render, ...props }: PolymorphicComponentProps<AnyComponentProps, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter<TAs extends React.ElementType = "div">({ className, as, render, ...props }: PolymorphicComponentProps<AnyComponentProps, TAs>) {
  throwIfUsingRenderProp({ render })
  const Component = as ?? "div"
  return (
    <Component
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-4xl px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
