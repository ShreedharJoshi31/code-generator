"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { SendIcon } from "lucide-react"

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  isLoading: boolean
  placeholder?: string
}

export function PromptInput({ onSubmit, isLoading, placeholder = "Type your instructions..." }: PromptInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isLoading) {
      onSubmit(value)
      setValue("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-none"
        disabled={isLoading}
      />
      <Button type="submit" size="icon" disabled={isLoading || !value.trim()} className="h-10 w-10 shrink-0 self-end">
        <SendIcon className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  )
}

