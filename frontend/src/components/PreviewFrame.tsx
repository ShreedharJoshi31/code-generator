"use client"

import type React from "react"

import type { WebContainer } from "@webcontainer/api"
import { useEffect, useState } from "react"
import { Card } from "../components/ui/card"
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Lock, X, Plus, Home } from "lucide-react"
import { PreviewControls, type PreviewSize } from "./PreviewControls"
import { cn } from "../lib/utils"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"

interface PreviewFrameProps {
  files: any[]
  webContainer: WebContainer
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("")
  const [displayUrl, setDisplayUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function main() {
    try {
      setLoading(true)
      const installProcess = await webContainer.spawn("npm", ["install"])

      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data)
          },
        }),
      )

      await webContainer.spawn("npm", ["run", "dev"])

      // Wait for `server-ready` event
      webContainer.on("server-ready", (port, url) => {
        console.log(url)
        console.log(port)
        setUrl(url)
        setDisplayUrl(url)
        setLoading(false)
      })
    } catch (error) {
      console.error("Error in preview:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (webContainer) {
      main()
    }
  }, [webContainer])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const handleRefresh = () => {
    if (!url) return
    setIsRefreshing(true)
    // Simulate refresh by briefly hiding the iframe
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  // Handle escape key to exit full screen
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullScreen) {
        setIsFullScreen(false)
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => {
      window.removeEventListener("keydown", handleEscKey)
    }
  }, [isFullScreen])

  // Prevent body scroll when in full screen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isFullScreen])

  const getPreviewStyles = () => {
    switch (previewSize) {
      case "mobile":
        return {
          width: "320px",
          height: "100%",
          margin: "0 auto",
        }
      case "tablet":
        return {
          width: "768px",
          height: "100%",
          margin: "0 auto",
        }
      case "desktop":
      case "full":
      default:
        return {
          width: "100%",
          height: "100%",
        }
    }
  }

  const BrowserFrame = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col h-full rounded-lg overflow-hidden border border-border bg-background">
        {/* URL bar and controls */}
        <div className="flex items-center gap-2 p-2">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Forward</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRefresh}
                    disabled={loading || isRefreshing}
                  >
                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    <span className="sr-only">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Home</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Home</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex-1 flex items-center bg-muted/30 rounded-full px-3 h-9 border border-border/50">
            <Lock className="h-3 w-3 text-muted-foreground mr-2" />
            <Input
              value={displayUrl}
              onChange={(e) => setDisplayUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setDisplayUrl(displayUrl)}
              className="h-7 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-sm"
              disabled={loading}
            />
          </div>
        </div>

      {/* Browser content */}
      <div className="flex-1 bg-white overflow-hidden">{children}</div>
    </div>
  )

  return (
    <>
      {isFullScreen && (
        <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-hidden">
          <PreviewControls
            currentSize={previewSize}
            onSizeChange={setPreviewSize}
            isFullScreen={isFullScreen}
            onFullScreenToggle={toggleFullScreen}
          />
          <div className="flex-1 overflow-hidden">
            <BrowserFrame>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Setting up preview environment...</p>
                </div>
              ) : url ? (
                <div className={cn("h-full w-full", isRefreshing && "opacity-30 transition-opacity")}>
                  <iframe
                    style={getPreviewStyles()}
                    src={url}
                    className="border-0 bg-white h-full"
                    title="Website Preview"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground flex items-center justify-center h-full">Failed to load preview</p>
              )}
            </BrowserFrame>
          </div>
        </div>
      )}

      <Card className={cn("h-full flex flex-col overflow-hidden border-0", isFullScreen && "invisible")}>
        <div className="flex flex-col h-full">
          <PreviewControls
            currentSize={previewSize}
            onSizeChange={setPreviewSize}
            isFullScreen={isFullScreen}
            onFullScreenToggle={toggleFullScreen}
          />

          <div className="flex-1 overflow-hidden">
            <BrowserFrame>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Setting up preview environment...</p>
                </div>
              ) : url ? (
                <div className={cn("h-full w-full", isRefreshing && "opacity-30 transition-opacity")}>
                  <iframe
                    style={getPreviewStyles()}
                    src={url}
                    className="border-0 bg-white h-full"
                    title="Website Preview"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground flex items-center justify-center h-full">Failed to load preview</p>
              )}
            </BrowserFrame>
          </div>
        </div>
      </Card>
    </>
  )
}

