import { Button } from "../components/ui/button"
import { Laptop, Maximize, Minimize, Smartphone, Tablet } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { cn } from "../lib/utils"

export type PreviewSize = "mobile" | "tablet" | "desktop" | "full"

interface PreviewControlsProps {
  currentSize: PreviewSize
  onSizeChange: (size: PreviewSize) => void
  isFullScreen: boolean
  onFullScreenToggle: () => void
}

export function PreviewControls({ currentSize, onSizeChange, isFullScreen, onFullScreenToggle }: PreviewControlsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 bg-muted/30 rounded-md mb-3",
        isFullScreen && "fixed top-4 right-4 z-50 bg-background/90 shadow-md",
      )}
    >
      <TooltipProvider>
        <div className="flex items-center border rounded-md overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-none border-r",
                  currentSize === "mobile" && "bg-accent text-accent-foreground",
                )}
                onClick={() => onSizeChange("mobile")}
              >
                <Smartphone className="h-4 w-4" />
                <span className="sr-only">Mobile View</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mobile (320px)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-none border-r",
                  currentSize === "tablet" && "bg-accent text-accent-foreground",
                )}
                onClick={() => onSizeChange("tablet")}
              >
                <Tablet className="h-4 w-4" />
                <span className="sr-only">Tablet View</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tablet (768px)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-none", currentSize === "desktop" && "bg-accent text-accent-foreground")}
                onClick={() => onSizeChange("desktop")}
              >
                <Laptop className="h-4 w-4" />
                <span className="sr-only">Desktop View</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Desktop (100%)</TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onFullScreenToggle}>
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              <span className="sr-only">{isFullScreen ? "Exit Full Screen" : "Full Screen"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isFullScreen ? "Exit Full Screen" : "Full Screen"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

