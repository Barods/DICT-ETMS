"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Globe2, Link2, Pencil, Plus, Share2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/layout/page-header"
import { useStore } from "@/lib/store"

type SavedLink = { id: string; name: string; url: string; description: string }

const storageKey = "etms-links"
const defaultLinks: SavedLink[] = [
  { id: "dict", name: "DICT", url: "https://dict.gov.ph", description: "Department of Information and Communications Technology" },
  { id: "facebook", name: "Facebook", url: "https://www.facebook.com", description: "Official Facebook platform" },
]

const emptyForm = { name: "", url: "", description: "" }

export default function LinksPage() {
  const { currentUser } = useStore()
  const isAdmin = currentUser.role === "Administrator"
  const [links, setLinks] = useState<SavedLink[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState("")

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    setLinks(saved ? JSON.parse(saved) : defaultLinks)
  }, [])

  const updateLinks = (next: SavedLink[]) => {
    setLinks(next)
    window.localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const openCreateDialog = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setOpen(true)
  }

  const openEditDialog = (link: SavedLink) => {
    setEditingId(link.id)
    setForm({ name: link.name, url: link.url, description: link.description })
    setError("")
    setOpen(true)
  }

  const saveLink = () => {
    const name = form.name.trim()
    const url = form.url.trim()
    if (!name || !url) return setError("URL Name and URL are required.")
    try {
      const parsedUrl = new URL(url)
      if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error()
    } catch {
      return setError("Enter a valid URL beginning with https:// or http://.")
    }

    const link = { id: editingId ?? `link-${Date.now()}`, name, url, description: form.description.trim() }
    updateLinks(editingId ? links.map((item) => item.id === editingId ? link : item) : [...links, link])
    setOpen(false)
  }

  const removeLink = (id: string) => updateLinks(links.filter((link) => link.id !== id))

  const linkStats = [
    { label: "Total Links", value: links.length, icon: Link2, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300" },
    { label: "Official Sites", value: links.filter((link) => link.url.includes(".gov.")).length, icon: Globe2, tone: "text-violet-600 bg-violet-50 dark:bg-violet-950/50 dark:text-violet-300" },
    { label: "Social Platforms", value: links.filter((link) => /facebook|linkedin|twitter|instagram/i.test(link.url)).length, icon: Share2, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300" },
    { label: "Other Links", value: links.filter((link) => !link.url.includes(".gov.") && !/facebook|linkedin|twitter|instagram/i.test(link.url)).length, icon: ExternalLink, tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300" },
  ]

  return <>
    <PageHeader
      title={isAdmin ? "Links" : "Quick Links"}
      description={isAdmin ? "Manage frequently used websites and platforms." : "Access frequently used websites and platforms."}
      actions={<Button onClick={openCreateDialog}><Plus className="size-4" />Create Link</Button>}
    />

    <section aria-labelledby="links-overview-heading" className="flex flex-col gap-3">
      <h2 id="links-overview-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {linkStats.map((stat) => (
          <Card key={stat.label} className="gap-0 rounded-xl border-border/60 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold tabular-nums tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">View details</p>
              </div>
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
                <stat.icon className="size-5" aria-hidden />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>

    <Card className="max-w-4xl rounded-xl border-border/60 shadow-sm">
      <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
        <CardTitle className="text-base">Saved links</CardTitle>
        <CardDescription>Open a link in a new tab or manage your saved links.</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-6">
        {links.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No links yet. Create your first link.</div>
        ) : (
          <div className="divide-y rounded-lg border border-border">
            {links.map((link) => (
              <div key={link.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1559df] dark:bg-blue-950/40"><Link2 className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{link.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{link.description || link.url}</p>
                  <a className="block truncate text-xs text-[#1559df] hover:underline" href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button type="button" size="icon-sm" variant="ghost" render={<a href={link.url} target="_blank" rel="noreferrer" />} aria-label={`Open ${link.name}`} title="Open link"><ExternalLink className="size-4" /></Button>
                  <Button type="button" size="icon-sm" variant="ghost" onClick={() => openEditDialog(link)} aria-label={`Edit ${link.name}`} title="Edit"><Pencil className="size-4" /></Button>
                  <Button type="button" size="icon-sm" variant="ghost" onClick={() => removeLink(link.id)} aria-label={`Delete ${link.name}`} title="Delete"><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Link" : "Create Link"}</DialogTitle>
          <DialogDescription>Add a website or platform link for quick access.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <label className="grid gap-2 text-sm font-medium">URL Name<Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. DICT Website" /></label>
          <label className="grid gap-2 text-sm font-medium">URL<Input type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://example.com" /></label>
          <label className="grid gap-2 text-sm font-medium">Description<Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What is this link for?" rows={3} /></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={saveLink}>{editingId ? "Save Changes" : "Create Link"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
}