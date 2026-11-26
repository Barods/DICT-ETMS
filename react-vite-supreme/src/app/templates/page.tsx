"use client"

import { useEffect, useState } from "react"
import { Pencil, Plus, RotateCcw, Save, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/layout/page-header"
import { getTaskTemplates, saveTaskTemplates, type TaskTemplate, type TemplateSubtask } from "@/lib/task-templates"
import { TASK_CATEGORIES } from "@/lib/types"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [category, setCategory] = useState(TASK_CATEGORIES[0])
  const [description, setDescription] = useState("")
  const [subtaskTitle, setSubtaskTitle] = useState("")
  const [subtaskDescription, setSubtaskDescription] = useState("")
  const [subtasks, setSubtasks] = useState<TemplateSubtask[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    setTemplates(getTaskTemplates())
  }, [])

  const updateTemplates = (next: TaskTemplate[]) => {
    setTemplates(next)
    saveTaskTemplates(next)
  }

  const clearForm = () => {
    setCategory(TASK_CATEGORIES[0])
    setDescription("")
    setSubtaskTitle("")
    setSubtaskDescription("")
    setSubtasks([])
    setEditing(null)
  }

  const saveTemplate = () => {
    const nextSubtasks = [...subtasks]
    if (subtaskTitle.trim()) nextSubtasks.push({ title: subtaskTitle.trim(), description: subtaskDescription.trim() })
    const template: TaskTemplate = { id: editing ?? `category-${category}`, name: category, category, description: description.trim(), subtasks: nextSubtasks }
    const existing = templates.find((item) => item.category === category && item.id !== editing)
    if (existing) {
      updateTemplates(templates.map((item) => item.id === existing.id ? { ...template, id: existing.id } : item))
    } else if (editing) {
      updateTemplates(templates.map((item) => item.id === editing ? template : item))
    } else {
      updateTemplates([...templates, template])
    }
    clearForm()
    setError("")
  }

  const startEditing = (template: TaskTemplate) => {
    setEditing(template.id)
    setCategory(template.category)
    setDescription(template.description)
    setSubtasks(template.subtasks)
    setSubtaskTitle("")
    setSubtaskDescription("")
    setError("")
  }

  const removeTemplate = (id: string) => {
    updateTemplates(templates.filter((template) => template.id !== id))
    if (editing === id) clearForm()
    setError("")
  }

  const addSubtask = () => {
    if (!subtaskTitle.trim()) return setError("Enter a subtask title.")
    setSubtasks((current) => [...current, { title: subtaskTitle.trim(), description: subtaskDescription.trim() }])
    setSubtaskTitle("")
    setSubtaskDescription("")
    setError("")
  }

  const restoreDefaults = () => {
    updateTemplates([])
    clearForm()
  }

  return <>
    <PageHeader title="Templates" description="Create reusable task details for faster task creation." />
    <div className="w-full max-w-6xl">
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Task templates</CardTitle>
              <CardDescription className="mt-1 text-xs">Configure a category with a description and as many subtasks as needed for Create Task.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={restoreDefaults}><RotateCcw className="size-3.5" />Restore defaults</Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm lg:col-span-1">
              {TASK_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="h-9 text-sm sm:col-span-2 lg:col-span-2" />
            <Input value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} placeholder="Subtask title" className="h-9 text-sm lg:col-span-1" />
            <Input value={subtaskDescription} onChange={(event) => setSubtaskDescription(event.target.value)} placeholder="Details or remarks" className="h-9 text-sm sm:col-span-1 lg:col-span-2" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="outline" onClick={addSubtask} className="h-9"><Plus className="size-4" />Add subtask</Button>
            <Button type="button" onClick={saveTemplate} className="h-9"><Save className="size-4" />{editing ? "Save template" : "Add template"}</Button>
            {editing && <Button type="button" variant="outline" onClick={clearForm} className="h-9"><X className="size-4" />Cancel</Button>}
          </div>
          {subtasks.length > 0 && <ul className="mt-3 divide-y rounded-md border">
            {subtasks.map((subtask, index) => <li key={`${subtask.title}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0"><p className="truncate text-sm font-medium">{subtask.title}</p><p className="truncate text-xs text-muted-foreground">{subtask.description || "No details provided."} · Unassigned</p></div>
              <Button type="button" size="icon-sm" variant="ghost" onClick={() => setSubtasks((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${subtask.title}`} title="Remove"><Trash2 className="size-4 text-destructive" /></Button>
            </li>)}
          </ul>}
          {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}

          <div className="mt-5 divide-y divide-border rounded-lg border border-border">
            {templates.map((template) => (
              <div key={template.id} className="flex min-h-20 items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{template.category}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{template.category} · {template.description || "No description"} · {template.subtasks.length} subtask{template.subtasks.length === 1 ? "" : "s"}</p>
                </div>
                <div className="flex gap-1">
                  <Button type="button" size="icon-sm" variant="ghost" onClick={() => startEditing(template)} aria-label={`Edit ${template.name}`} title="Edit"><Pencil className="size-4" /></Button>
                  <Button type="button" size="icon-sm" variant="ghost" onClick={() => removeTemplate(template.id)} aria-label={`Delete ${template.name}`} title="Delete"><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </>
}