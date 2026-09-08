import { cn } from "@/lib/client"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
<<<<<<< HEAD
    <Loader2Icon data-slot="spinner" role="status" aria-label="Naglo-load" className={cn("size-4 animate-spin", className)} {...props} />
=======
    <Loader2Icon data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
>>>>>>> b378b4f0ac00170818702674e7d768e7e1efb2f8
  )
}

export { Spinner }
