import { useState } from "react"
import type { FileItem } from "../types"
import CodeMirror from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { json } from "@codemirror/lang-json"
import { Card } from "../components/ui/card"
import { FileIcon, FolderIcon, Copy, CopyCheck } from "lucide-react"
import { Button } from "../components/ui/button"
import { ScrollArea } from "../components/ui/scroll-area"

interface CodeEditorProps {
  file: FileItem | null
  onChange?: (value: string) => void
  readOnly?: boolean
}

export function CodeEditor({ file, onChange, readOnly = false }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)

  const getLanguageExtension = (fileName: string) => {
    if (!fileName) return javascript()

    if (
      fileName.endsWith(".js") ||
      fileName.endsWith(".jsx") ||
      fileName.endsWith(".ts") ||
      fileName.endsWith(".tsx")
    ) {
      return javascript()
    } else if (fileName.endsWith(".html")) {
      return html()
    } else if (fileName.endsWith(".css")) {
      return css()
    } else if (fileName.endsWith(".json")) {
      return json()
    }

    return javascript()
  }

  if (!file) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center p-6 space-y-2">
          <FolderIcon className="w-12 h-12 mx-auto text-muted-foreground/60" />
          <p className="text-muted-foreground">Select a file to view its contents</p>
        </div>
      </Card>
    )
  }

  const handleCopyCode = async () => {
    if (file.content) {
      try {
        await navigator.clipboard.writeText(file.content)
        setCopied(true) // Change icon to CopyCheck
        setTimeout(() => setCopied(false), 2000) // Reset after 5 seconds
      } catch (err) {
        console.error("Failed to copy code: ", err)
      }
    }
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden border-0">
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium truncate">{file.path}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={handleCopyCode}>
          {copied ? (
            <CopyCheck className="h-4 w-4 flex-shrink-0 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
        </Button>
      </div>
      {/* <div className="flex-1 overflow-y-scroll"> */}
      <ScrollArea className="flex-1 h-[calc(100%-37px)]">
        <CodeMirror
          value={file.content || ""}
          height="100%"
          theme={vscodeDark}
          extensions={[getLanguageExtension(file.path)]}
          readOnly={readOnly}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
          }}
        />
      </ScrollArea>
      {/* </div> */}
    </Card>
  )
}
