import cn from "@/lib/utilities/cn";
import React from "react";

export function Viewport({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn("h-screen w-screen", className)} {...props} />
}
