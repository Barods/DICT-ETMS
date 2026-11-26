"use client"

import { useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { Bell, FileClock, Moon, Save } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/layout/page-header"
import { useStore } from "@/lib/store"
import { formatDateTime } from "@/lib/task-utils"

const notificationPrefs = [
  { key: "assigned", label: "New task assigned", description: "When a task is assigned to you." },
  { key: "deadline", label: "Approaching deadlines", description: "Reminder 24 hours before a task is due." },
  { key: "overdue", label: "Overdue tasks", description: "When one of your tasks passes its due date." },
  { key: "completed", label: "Task completed", description: "When a task you created is marked complete." },
]

export default function SettingsPage() {
  const { currentUser, getUser, saveUser, tasks } = useStore()
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [password, setPassword] = useState("")
  const [retypePassword, setRetypePassword] = useState("")
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ assigned: true, deadline: true, overdue: true, completed: true })
  const [saved, setSaved] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const activities = tasks
    .flatMap((task) => task.activity.map((entry) => ({ task, entry })))
    .sort((a, b) => +new Date(b.entry.at) - +new Date(a.entry.at))
    .slice(0, 5)

  const saveProfile = () => {
    if (password !== retypePassword) {
      setProfileError("Passwords do not match.")
      setSaved(false)
      return
    }
    saveUser({ ...currentUser, name: name.trim() || currentUser.name, email: email.trim() || currentUser.email })
    setProfileError(null)
    setPassword("")
    setRetypePassword("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, notification preferences, and appearance." />
      <div className="flex max-w-[1100px] flex-col gap-4">
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardContent className="flex items-center gap-4 px-5 py-5 sm:px-6">
            <Avatar className="size-14"><AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground">{currentUser.initials}</AvatarFallback></Avatar>
            <div>
              <p className="text-xl font-semibold tracking-tight">{currentUser.name}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5"><Badge variant="outline" className="text-[10px]">{currentUser.role}</Badge><Badge variant="outline" className="text-[10px]">{currentUser.department}</Badge></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid items-start gap-1 lg:grid-cols-[1.05fr_1fr]">
          <Card className="rounded-xl border-border/60 shadow-sm lg:rounded-r-none">
            <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription className="text-xs">Your account information and role.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5 pb-5 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5"><Label htmlFor="s-name" className="text-xs">Full Name <span className="text-destructive">*</span></Label><Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-xs" /></div>
              <div className="flex flex-col gap-1.5"><Label htmlFor="s-email" className="text-xs">Email Address <span className="text-destructive">*</span></Label><Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-xs" /></div>
              <div className="flex flex-col gap-1.5"><Label htmlFor="s-password" className="text-xs">Password <span className="text-destructive">*</span></Label><Input id="s-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="h-8 text-xs" /></div>
              <div className="flex flex-col gap-1.5"><Label htmlFor="s-retype-password" className="text-xs">Re-type Password <span className="text-destructive">*</span></Label><Input id="s-retype-password" type="password" value={retypePassword} onChange={(e) => setRetypePassword(e.target.value)} autoComplete="new-password" className="h-8 text-xs" /></div>
            </div>
            <div className="flex min-h-8 items-center justify-end gap-3">
              {profileError && <span role="alert" className="text-sm text-destructive">{profileError}</span>}
              {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved</span>}
              <Button size="sm" onClick={saveProfile}><Save className="size-3.5" />Save Profile</Button>
            </div>
          </CardContent>
        </Card>

          <div className="flex flex-col gap-1">
          <Card className="rounded-xl border-border/60 shadow-sm lg:rounded-bl-none">
          <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base"><Moon className="size-4 text-muted-foreground" />Appearance</CardTitle>
            <CardDescription className="text-xs">Switch between light and dark mode.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div><Label htmlFor="dark-mode" className="text-xs font-medium">Dark mode</Label><p className="text-[11px] text-muted-foreground">Reduce eye strain in low-light environment</p></div>
              <Switch id="dark-mode" checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base"><Bell className="size-4 text-muted-foreground" />Notifications</CardTitle>
            <CardDescription className="text-xs">Choose which events send you a notification.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col px-5 pb-5 sm:px-6">
            {notificationPrefs.map((p, i) => (
              <div key={p.key}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor={`pref-${p.key}`} className="text-xs font-medium">{p.label}</Label>
                    <p className="text-[11px] text-muted-foreground">{p.description}</p>
                  </div>
                  <Switch id={`pref-${p.key}`} checked={prefs[p.key]} onCheckedChange={(v) => setPrefs((s) => ({ ...s, [p.key]: v }))} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base"><FileClock className="size-4 text-muted-foreground" />Task Activities</CardTitle>
            <CardDescription className="text-xs">Recently created, completed, and upcoming deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <FileClock className="size-5" aria-hidden />
                <p className="text-sm">No account activity yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[520px]">
                  <div className="grid grid-cols-[1.1fr_1.4fr_1fr] gap-4 border-b border-border/60 pb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Date &amp; Time</span>
                    <span>User</span>
                    <span>Action</span>
                  </div>
                  <ul className="flex flex-col divide-y divide-border/60">
                {activities.map(({ task, entry }) => (
                  <li key={`${task.id}-${entry.id}`} className="grid grid-cols-[1.1fr_1.4fr_1fr] gap-4 py-2.5 first:pt-3 last:pb-0">
                    <span className="text-xs text-muted-foreground">{formatDateTime(entry.at)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{getUser(entry.userId)?.name ?? entry.userId}</p>
                      <p className="truncate text-xs text-muted-foreground">{getUser(entry.userId)?.email ?? "No email address"}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{entry.type === "assigned" ? "Task Assigned" : entry.message}</p>
                      <p className="truncate text-xs text-muted-foreground">{task.title}</p>
                    </div>
                  </li>
                ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </>
  )
}
