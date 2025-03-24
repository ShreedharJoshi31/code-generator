"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Wand2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"

export function Home() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      setIsLoading(true)
      // Simulate loading for better UX
      setTimeout(() => {
        navigate("/builder", { state: { prompt } })
        setIsLoading(false)
      }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Wand2 className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Website Builder AI</h1>
          <p className="text-lg text-muted-foreground">
            Describe your dream website, and we'll help you build it step by step
          </p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle>Create Your Website</CardTitle>
            <CardDescription>Describe what you want to build and our AI will generate a plan for you</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="I want a personal portfolio website with a dark theme, featuring a hero section, about me, projects, and contact form..."
                className="min-h-[120px] resize-none"
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!prompt.trim() || isLoading}>
                {isLoading ? <>Generating Plan...</> : <>Generate Website Plan</>}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

