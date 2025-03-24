"use client"
import type { FileItem } from "../types"
import CodeMirror from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { json } from "@codemirror/lang-json"
import { FileIcon } from "lucide-react"

interface CodeEditorProps {
  file: FileItem | null
  onChange?: (value: string) => void
  readOnly?: boolean
}

export function CodeEditor({ file, onChange, readOnly = false }: CodeEditorProps) {
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
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg border">
        <div className="text-center p-6 space-y-2">
          <FileIcon className="w-12 h-12 mx-auto text-muted-foreground/60" />
          <p className="text-muted-foreground">Select a file to view its contents</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-lg border">
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
        <FileIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{file.path}</span>
      </div>
      <CodeMirror
        value={file.content || ""}
        height="100%"
        theme={vscodeDark}
        extensions={[getLanguageExtension(file.path)]}
        onChange={onChange}
        readOnly={readOnly}
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
    </div>
  )
}

