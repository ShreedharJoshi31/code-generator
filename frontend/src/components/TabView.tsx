"use client"
import { Code2, Eye } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"

interface TabViewProps {
  activeTab: "code" | "preview"
  onTabChange: (tab: "code" | "preview") => void
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "code" | "preview")} className="mb-4">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="code" className="flex items-center gap-2 px-4 py-2">
          <Code2 className="w-4 h-4" />
          Editor
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center gap-2 px-4 py-2">
          <Eye className="w-4 h-4" />
          Preview
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

