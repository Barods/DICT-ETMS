import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { StatCards } from "@/components/dashboard/stat-cards"
import { RecentTasks } from "@/components/dashboard/recent-tasks"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner />

      <section aria-labelledby="overview-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="overview-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overview</h2>
        </div>
        <StatCards />
      </section>

      <section>
        <RecentTasks />
      </section>
    </div>
  )
}
