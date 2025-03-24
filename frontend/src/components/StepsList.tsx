"use client"
import { CheckCircle, Circle, Clock } from "lucide-react"
import type { Step } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ScrollArea } from "../components/ui/scroll-area"
import { cn } from "../lib/utils"

interface StepsListProps {
  steps: Step[]
  currentStep: number
  onStepClick: (stepId: number) => void
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <Card className="h-full border-0 shadow-none bg-card/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">Build Steps</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-56px)]">
        <ScrollArea className="h-full px-2">
          <div className="space-y-2 pb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-colors",
                  currentStep === step.id ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                )}
                onClick={() => onStepClick(step.id)}
              >
                <div className="flex items-center gap-2">
                  {step.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : step.status === "in-progress" ? (
                    <Clock className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <h3 className="font-medium">{step.title}</h3>
                </div>
                {step.description && <p className="text-sm text-muted-foreground mt-1">{step.description}</p>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

