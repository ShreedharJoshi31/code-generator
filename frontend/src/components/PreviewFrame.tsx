"use client"

import type { WebContainer } from "@webcontainer/api"
import { useEffect, useState } from "react"
import { Card } from "../components/ui/card"
import { Loader2 } from "lucide-react"

interface PreviewFrameProps {
  files: any[]
  webContainer: WebContainer
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(true)

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

  return (
    <Card className="h-full overflow-hidden border-0">
      {loading ? (
        <div className="h-full flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Setting up preview environment...</p>
        </div>
      ) : url ? (
        <iframe width="100%" height="100%" src={url} className="border-0" title="Website Preview" />
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load preview</p>
        </div>
      )}
    </Card>
  )
}

