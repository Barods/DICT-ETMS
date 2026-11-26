import { FileCog, Link2, UsersRound } from "lucide-react"
import { Link } from "@/lib/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { StatCards } from "@/components/dashboard/stat-cards"
import { RecentTasks } from "@/components/dashboard/recent-tasks"
import { useStore } from "@/lib/store"

export default function AdminDashboardPage() {
  const { users } = useStore()
  const activeUsers = users.filter((user) => user.active).length
  const managers = users.filter((user) => user.role === "Manager").length
  const employees = users.filter((user) => user.role === "Employee").length

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner />

      <section aria-labelledby="admin-heading" className="flex flex-col gap-3">
        <div>
          <h2 id="admin-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Administration</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage accounts, templates, and shared resources.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/users" />}><UsersRound className="size-4" />Manage users</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/templates" />}><FileCog className="size-4" />Templates</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/links" />}><Link2 className="size-4" />Shared links</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="gap-1 rounded-xl border-border/60 py-4 shadow-sm">
            <CardHeader className="px-4 py-0"><CardDescription>Active accounts</CardDescription><CardTitle className="text-2xl tabular-nums">{activeUsers}</CardTitle></CardHeader>
            <CardContent className="px-4 text-xs text-muted-foreground">of {users.length} total users</CardContent>
          </Card>
          <Card className="gap-1 rounded-xl border-border/60 py-4 shadow-sm">
            <CardHeader className="px-4 py-0"><CardDescription>Managers</CardDescription><CardTitle className="text-2xl tabular-nums">{managers}</CardTitle></CardHeader>
            <CardContent className="px-4 text-xs text-muted-foreground">Across all departments</CardContent>
          </Card>
          <Card className="gap-1 rounded-xl border-border/60 py-4 shadow-sm">
            <CardHeader className="px-4 py-0"><CardDescription>Employees</CardDescription><CardTitle className="text-2xl tabular-nums">{employees}</CardTitle></CardHeader>
            <CardContent className="px-4 text-xs text-muted-foreground">Across all departments</CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="admin-task-overview" className="flex flex-col gap-3">
        <h2 id="admin-task-overview" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization-wide tasks</h2>
        <StatCards />
      </section>

      <RecentTasks />
    </div>
  )
}