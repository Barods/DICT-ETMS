"use client"

import { useState, type FormEvent } from "react"
import { Eye, EyeOff, Pencil, Plus, ShieldCheck, Trash2, UserCheck, UserX } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/layout/page-header"
import { useStore } from "@/lib/store"
import { createUserRequest, updateUserPasswordRequest } from "@/lib/api"
import { getApiErrorData } from "@/lib/http"
import { DEPARTMENTS, type User, type UserRole } from "@/lib/types"
import { cn } from "@/lib/utils"

const roleTone: Record<UserRole, string> = {
  Administrator: "bg-primary/10 text-primary border-primary/20",
  Manager: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900",
  Employee: "bg-muted text-muted-foreground border-border",
}

const roleAccess: Record<UserRole, string> = {
  Administrator: "Full access: manage users, all tasks, reports, and settings.",
  Manager: "Create and assign tasks, view team reports, manage own department.",
  Employee: "View assigned tasks, update task status, receive notifications.",
}

function UserDialog({ open, onOpenChange, user }: { open: boolean; onOpenChange: (o: boolean) => void; user?: User }) {
  const { saveUser } = useStore()
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [role, setRole] = useState<UserRole>(user?.role ?? "Employee")
  const [department, setDepartment] = useState(user?.department ?? DEPARTMENTS[0])
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    if (newPassword && newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.")
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const [firstName, ...lastNameParts] = name.trim().split(/\s+/)
    const username = normalizedEmail.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 150) || "user"
    const initials = name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    setSavingPassword(true)
    setPasswordError("")
    try {
      if (user) {
        if (newPassword) await updateUserPasswordRequest(user.id, newPassword)
        saveUser({ ...user, name: name.trim(), email: normalizedEmail, role, department, initials })
      } else {
        const createdUser = await createUserRequest({
          username,
          email: normalizedEmail,
          first_name: firstName ?? "",
          last_name: lastNameParts.join(" "),
          password: newPassword,
          is_active: true,
          is_staff: role === "Administrator",
        })
        saveUser({ ...createdUser, name: name.trim(), email: normalizedEmail, role, department, initials })
      }
      onOpenChange(false)
    } catch (requestError) {
      const data = getApiErrorData(requestError)
      setPasswordError(data.password?.[0] ?? data.email?.[0] ?? data.username?.[0] ?? data.detail ?? "Account could not be saved to the database.")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>{user ? "Update account details and role." : "Create a new account and assign a role."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2"><Label htmlFor="u-name">Full Name</Label><Input id="u-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="flex flex-col gap-2"><Label htmlFor="u-email">Email</Label><Input id="u-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="u-new-password">{user ? "New Password" : "Password"}</Label>
            <div className="relative">
              <Input
                id="u-new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={user ? "Leave blank to keep the current password" : "At least 8 characters"}
                autoComplete="new-password"
                required={!user}
                minLength={8}
                className="pr-10"
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 size-8 -translate-y-1/2" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide new password" : "Show new password"} title={showPassword ? "Hide new password" : "Show new password"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            {passwordError && <p role="alert" className="text-sm text-destructive">{passwordError}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="u-role">Role</Label>
              <Select value={role} onValueChange={(v) => v && setRole(v as UserRole)}>
                <SelectTrigger id="u-role" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{(["Administrator", "Manager", "Employee"] as UserRole[]).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="u-dept">Department</Label>
              <Select value={department} onValueChange={(v) => v && setDepartment(v)}>
                <SelectTrigger id="u-dept" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">{roleAccess[role]}</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={savingPassword}>{savingPassword ? "Saving..." : user ? "Save Changes" : "Add User"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const { users, tasks, deleteUser, toggleUserActive, currentUser } = useStore()
  const [dialog, setDialog] = useState<{ open: boolean; user?: User }>({ open: false })
  const isAdmin = currentUser.role === "Administrator"
  const databaseUsers = users.filter((user) => /^\d+$/.test(user.id))

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage accounts, roles, and access. Only administrators can add or deactivate users."
        actions={isAdmin && <Button onClick={() => setDialog({ open: true })}><Plus className="size-4" />Add User</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {(["Administrator", "Manager", "Employee"] as UserRole[]).map((r) => (
          <Card key={r} className="gap-2 rounded-2xl border-border/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{r}s</p>
              <ShieldCheck className="size-4 text-primary" aria-hidden />
            </div>
            <p className="text-3xl font-bold tabular-nums">{databaseUsers.filter((u) => u.role === r).length}</p>
            <p className="text-xs leading-relaxed text-muted-foreground text-pretty">{roleAccess[r]}</p>
          </Card>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="min-w-56">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Open Tasks</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="w-32 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {databaseUsers.map((u) => {
              const openTasks = tasks.filter((t) => t.assignedTo === u.id && t.status !== "Completed" && t.status !== "Cancelled").length
              return (
                <TableRow key={u.id} className={cn(!u.active && "opacity-60")}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9"><AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{u.initials}</AvatarFallback></Avatar>
                      <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={roleTone[u.role]}>{u.role}</Badge></TableCell>
                  <TableCell className="text-sm">{u.department}</TableCell>
                  <TableCell className="text-right tabular-nums">{openTasks}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center gap-1.5 text-sm", u.active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                      <span className={cn("size-1.5 rounded-full", u.active ? "bg-emerald-500" : "bg-muted-foreground")} aria-hidden />{u.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setDialog({ open: true, user: u })} aria-label={`Edit ${u.name}`}><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => toggleUserActive(u.id)} disabled={u.id === currentUser.id} aria-label={u.active ? `Deactivate ${u.name}` : `Activate ${u.name}`}>
                          {u.active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (u.id !== currentUser.id && window.confirm(`Permanently delete ${u.name}?`)) {
                              void deleteUser(u.id)
                            }
                          }}
                          disabled={u.id === currentUser.id}
                          aria-label={`Delete ${u.name}`}
                          title={`Delete ${u.name}`}
                        ><Trash2 className="size-4" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {dialog.open && <UserDialog key={dialog.user?.id ?? "new"} open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} user={dialog.user} />}
    </>
  )
}
