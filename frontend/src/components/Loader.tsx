import { Loader2 } from "lucide-react"

export function Loader() {
  return (
    <div role="status" className="flex justify-center w-full pt-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

