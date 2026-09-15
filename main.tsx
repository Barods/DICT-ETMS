import { StrictMode, useEffect, useState } from "react"
import ReactDOM from "react-dom/client"
import { ThemeProvider } from "next-themes"
import { AuthPage, hasAuthSession } from "@/components/auth/auth-page"
import { StoreProvider } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import DashboardPage from "@/app/page"
import CalendarPage from "@/app/calendar/page"
import MyTasksPage from "@/app/my-tasks/page"
import NotificationsPage from "@/app/notifications/page"
import ReportsPage from "@/app/reports/page"
import SettingsPage from "@/app/settings/page"
import TasksPage from "@/app/tasks/page"
import NewTaskPage from "@/app/tasks/new/page"
import TaskDetailPage from "@/app/tasks/[id]/page"
import UsersPage from "@/app/users/page"
import "@/app/globals.css"

function RouterView() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [authenticated, setAuthenticated] = useState(() => hasAuthSession())
  useEffect(() => {
    const update = () => {
      setPathname(window.location.pathname)
      setAuthenticated(hasAuthSession())
    }
    window.addEventListener("popstate", update)
    return () => window.removeEventListener("popstate", update)
  }, [])

  if (pathname === "/login") return <AuthPage initialMode="login" />
  if (pathname === "/signup") return <AuthPage initialMode="signup" />
  if (!authenticated) return <AuthPage />

  const Page = pathname === "/" ? DashboardPage
    : pathname === "/calendar" ? CalendarPage
    : pathname === "/my-tasks" ? MyTasksPage
    : pathname === "/notifications" ? NotificationsPage
    : pathname === "/reports" ? ReportsPage
    : pathname === "/settings" ? SettingsPage
    : pathname === "/tasks" ? TasksPage
    : pathname === "/tasks/new" ? NewTaskPage
    : pathname === "/users" ? UsersPage
    : pathname.startsWith("/tasks/") ? TaskDetailPage
    : DashboardPage

  return <AppShell><Page /></AppShell>
}

function App() {
  return <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
    <StoreProvider><RouterView /></StoreProvider>
  </ThemeProvider>
}

document.documentElement.classList.add("bg-background")
document.body.className = "font-sans antialiased"
ReactDOM.createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>)