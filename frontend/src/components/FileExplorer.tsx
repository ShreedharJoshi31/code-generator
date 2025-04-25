import { useState } from "react"
import { ChevronRight, ChevronDown, FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react"
import type { FileItem } from "../types"
import { cn } from "../lib/utils"
import { ScrollArea } from "../components/ui/scroll-area"

interface FileExplorerProps {
  files: FileItem[]
  onFileSelect: (file: FileItem) => void
  selectedFile?: FileItem | null
}

interface FileNodeProps {
  item: FileItem
  depth: number
  onFileClick: (file: FileItem) => void
  isSelected: boolean
}

function FileNode({ item, depth, onFileClick, isSelected }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleClick = () => {
    if (item.type === "folder") {
      setIsExpanded(!isExpanded)
    } else {
      onFileClick(item)
    }
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm",
          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50",
        )}
        style={{ paddingLeft: `${depth * 0.75 + 0.5}rem` }}
        onClick={handleClick}
      >
        {item.type === "folder" && (
          <span className="text-muted-foreground">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        )}
        {item.type === "folder" ? (
          isExpanded ? (
            <FolderOpenIcon className="w-4 h-4 text-blue-400" />
          ) : (
            <FolderIcon className="w-4 h-4 text-blue-400" />
          )
        ) : (
          <FileIcon className="w-4 h-4 text-muted-foreground" />
        )}
        <span className={cn(isSelected && item.type === "file" ? "font-medium" : "")}>{item.name}</span>
      </div>
      {item.type === "folder" && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileNode
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              isSelected={isSelected && child.path === item.path}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileExplorer({ files, onFileSelect, selectedFile }: FileExplorerProps) {
  return (
    <div className="h-full flex flex-col bg-card/50 rounded-lg border overflow-hidden">
      <div className="py-2 px-3 border-b flex items-center gap-2">
        <FolderIcon className="w-4 h-4" />
        <h2 className="text-sm font-medium">Files</h2>
      </div>
      <ScrollArea className="h-[calc(100%-37px)]">
        <div className="space-y-1 p-2">
          {files.map((file, index) => (
            <FileNode
              key={`${file.path}-${index}`}
              item={file}
              depth={0}
              onFileClick={onFileSelect}
              isSelected={selectedFile?.path === file.path}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

