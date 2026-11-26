import { StrictMode, useEffect, useState } from "react"
import ReactDOM from "react-dom/client"
import { AuthPage, hasAuthSession } from "@/components/auth/auth-page"
import { ThemeProvider } from "@/components/theme-provider"
import { ResetPasswordPage } from "@/components/auth/reset-password-page"
import { StoreProvider, useStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import DashboardPage from "@/app/page"
import AdminDashboardPage from "@/app/admin/page"
import CalendarPage from "@/app/calendar/page"
import MyTasksPage from "@/app/my-tasks/page"
import NotificationsPage from "@/app/notifications/page"
import ReportsPage from "@/app/reports/page"
import SettingsPage from "@/app/settings/page"
import TasksPage from "@/app/tasks/page"
import NewTaskPage from "@/app/tasks/new/page"
import TaskDetailPage from "@/app/tasks/[id]/page"
import UsersPage from "@/app/users/page"
import TemplatesPage from "@/app/templates/page"
import LinksPage from "@/app/links/page"
import "@/app/globals.css"
import { getAppPathname } from "@/lib/base"

function RouterView() {
  const { currentUser } = useStore()
  const [pathname, setPathname] = useState(() => getAppPathname())
  const [authenticated, setAuthenticated] = useState(() => hasAuthSession())
  useEffect(() => {
    const update = () => {
      setPathname(getAppPathname())
      setAuthenticated(hasAuthSession())
    }
    window.addEventListener("popstate", update)
    return () => window.removeEventListener("popstate", update)
  }, [])

  const resetMatch = pathname.match(/^\/dts\/reset-password\/([^/]+)\/([^/]+)\/?$/)
  if (resetMatch) return <ResetPasswordPage uid={decodeURIComponent(resetMatch[1])} token={decodeURIComponent(resetMatch[2])} />

  if (pathname === "/login") return <AuthPage initialMode="login" />
  if (pathname === "/signup") return <AuthPage initialMode="signup" />
  if (!authenticated) return <AuthPage />

  const Page = pathname === "/" ? (currentUser.role === "Administrator" ? AdminDashboardPage : DashboardPage)
    : pathname === "/calendar" ? CalendarPage
    : pathname === "/my-tasks" ? MyTasksPage
    : pathname === "/notifications" ? NotificationsPage
    : pathname === "/reports" ? ReportsPage
    : pathname === "/settings" ? SettingsPage
    : pathname === "/links" ? (currentUser.role === "Administrator" ? LinksPage : DashboardPage)
    : pathname === "/tasks" ? TasksPage
    : pathname === "/tasks/new" ? NewTaskPage
    : pathname === "/templates" ? (currentUser.role === "Administrator" ? TemplatesPage : DashboardPage)
    : pathname === "/users" ? (currentUser.role === "Administrator" ? UsersPage : DashboardPage)
    : pathname.startsWith("/tasks/") ? TaskDetailPage
    : DashboardPage

  return <AppShell><Page /></AppShell>
}

function App() {
  return <ThemeProvider>
    <StoreProvider><RouterView /></StoreProvider>
  </ThemeProvider>
}

document.documentElement.classList.add("bg-background")
document.body.className = "font-sans antialiased"
ReactDOM.createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>)