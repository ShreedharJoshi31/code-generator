"use client"

import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { StepsList } from "../components/StepsList"
import { FileExplorer } from "../components/FileExplorer"
import { TabView } from "../components/TabView"
import { CodeEditor } from "../components/CodeEditor"
import { PreviewFrame } from "../components/PreviewFrame"
import { type Step, type FileItem, StepType } from "../types"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { parseXml } from "../steps"
import { useWebContainer } from "../hooks/useWebContainer"
import { Loader } from "../components/Loader"
import { PromptInput } from "../components/PromptInput"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable"
import { Button } from "../components/ui/button"
import { ArrowLeft, Code, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import JSZip from 'jszip'

export function Builder() {
  const location = useLocation()
  const { prompt } = location.state as { prompt: string }
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [templateSet, setTemplateSet] = useState(false)
  const webcontainer = useWebContainer()

  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)

  const [steps, setSteps] = useState<Step[]>([])
  const [files, setFiles] = useState<FileItem[]>([])

  useEffect(() => {
    let originalFiles = [...files]
    let updateHappened = false
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [] // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles] // {}
          const finalAnswerRef = currentFileStructure

          let currentFolder = ""
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`
            const currentFolderName = parsedPath[0]
            parsedPath = parsedPath.slice(1)

            if (!parsedPath.length) {
              // final file
              const file = currentFileStructure.find((x) => x.path === currentFolder)
              if (!file) {
                currentFileStructure.push({
                  id: crypto.randomUUID(), // Add a unique ID here
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                })
              } else {
                file.content = step.code
              }
            } else {
              /// in a folder
              const folder = currentFileStructure.find((x) => x.path === currentFolder)
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  id: crypto.randomUUID(), // Add a unique ID here
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                })
              }

              currentFileStructure = currentFileStructure.find((x) => x.path === currentFolder)!.children!
            }
          }
          originalFiles = finalAnswerRef
        }
      })

    if (updateHappened) {
      setFiles(originalFiles)
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          }
        }),
      )
    }
  }, [steps, files])

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
		const mountStructure: Record<string, any> = {}
	  
		const processFile = (file: FileItem, isRootFolder: boolean, path: string = '') => {
		  // Create a unique key using the path
		  const uniqueKey = path ? `${path}/${file.name}` : file.name
	  
		  if (file.type === "folder") {
			// For folders, create a directory entry
			mountStructure[uniqueKey] = {
			  directory: file.children
				? Object.fromEntries(
					file.children.map((child) => {
					  const childKey = `${uniqueKey}/${child.name}`
					  return [child.name, processFile(child, false, uniqueKey)]
					})
				  )
				: {},
			}
		  } else if (file.type === "file") {
			if (isRootFolder) {
			  mountStructure[uniqueKey] = {
				file: {
				  contents: file.content || "",
				},
			  }
			} else {
			  // For files, create a file entry with contents
			  return {
				file: {
				  contents: file.content || "",
				},
			  }
			}
		  }
	  
		  return mountStructure[uniqueKey]
		}
	  
		// Process each top-level file/folder
		files.forEach((file) => processFile(file, true))
	  
		return mountStructure
	  }

    const mountStructure = createMountStructure(files)

    // Mount the structure if WebContainer is available
	if (mountStructure) webcontainer?.mount(mountStructure)
  }, [files, webcontainer])

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim(),
    })
    setTemplateSet(true)

    const { prompts, uiPrompts } = response.data

    setSteps(
      parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending",
      })),
    )

    setLoading(true)
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    })

    setLoading(false)

    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response).map((x) => ({
        ...x,
        status: "pending" as const,
      })),
    ])

    setLlmMessages(
      [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    )

    setLlmMessages((x) => [...x, { role: "assistant", content: stepsResponse.data.response }])
  }

  useEffect(() => {
    init()
  }, [])

  const handlePromptSubmit = async (userPrompt: string) => {
    const newMessage = {
      role: "user" as const,
      content: userPrompt,
    }

    setLoading(true)
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...llmMessages, newMessage],
    })
    setLoading(false)

    setLlmMessages((x) => [...x, newMessage])
    setLlmMessages((x) => [
      ...x,
      {
        role: "assistant",
        content: stepsResponse.data.response,
      },
    ])

    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response).map((x) => ({
        ...x,
        status: "pending" as const,
      })),
    ])
  }

  // In the Builder.tsx file, add this function before the return statement
  
const handleFileContentChange = (newContent: string) => {
    if (!selectedFile) return;
    
    setFiles(prevFiles => {
      // Create a deep copy of the files array to avoid direct state mutation
      const updatedFiles = JSON.parse(JSON.stringify(prevFiles));
      
      // Find and update the file with matching path
      const updateFileContent = (fileItems: FileItem[]) => {
        for (let i = 0; i < fileItems.length; i++) {
          const file = fileItems[i];
          if (file.path === selectedFile.path) {
            file.content = newContent;
            return true;
          }
          
          if (file.type === 'folder' && file.children) {
            if (updateFileContent(file.children)) {
              return true;
            }
          }
        }
        return false;
      };
      
      updateFileContent(updatedFiles);
      return updatedFiles;
    });
  };

  const exportCode = async () => {
    try {
      const zip = new JSZip()

      // Function to recursively add files to the zip
      const addFilesToZip = (items: FileItem[], currentPath = "") => {
        items.forEach((item) => {
          const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name

          if (item.type === "file") {
            zip.file(itemPath, item.content || "")
          } else if (item.type === "folder" && item.children) {
            // Create folder and add its children
            addFilesToZip(item.children, itemPath)
          }
        })
      }

      // Add all files to the zip
      addFilesToZip(files)

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" })

      // Create a download link and trigger the download
      const url = URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = "website-project.zip"
      document.body.appendChild(link)
      link.click()

      // Clean up
      URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting code:", error)
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Home</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Website Builder</h1>
            <p className="text-sm text-muted-foreground">Prompt: {prompt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCode}>
            <Code className="h-4 w-4" />
            Export Code
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={20} maxSize={40}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70} minSize={30}>
                <StepsList steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full flex flex-col p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">AI Assistant</h3>
                  </div>

                {loading || !templateSet ? (
                  <div className="flex-1 overflow-auto mb-4 border rounded-md p-2 bg-muted/30 text-sm">
                      <Loader />
                  </div>
                ) : null
                }

                  <PromptInput
                    onSubmit={handlePromptSubmit}
                    isLoading={loading || !templateSet}
                    placeholder="Ask for changes or new features..."
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={80}>
            <div className="h-full p-4">
              <TabView activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="h-[calc(100%-48px)]">
                {activeTab === "code" ? (
                  <div className="grid grid-cols-[260px_1fr] h-full gap-4">
                    <div className="h-full overflow-hidden">
                      <FileExplorer files={files} onFileSelect={setSelectedFile} selectedFile={selectedFile} />
                    </div>
                    <div className="h-full overflow-auto">
                      <CodeEditor file={selectedFile} onChange={handleFileContentChange} />
                    </div>
                  </div>
                ) : (
                  <PreviewFrame webContainer={webcontainer} files={files} />
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

