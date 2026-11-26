import { addDays, formatISO, subDays } from "date-fns"
import type { ActivityEntry, Notification, Task, TaskPriority, TaskStatus, User } from "./types"

const today = new Date(2026, 8, 7, 9, 0, 0)
const iso = (d: Date) => formatISO(d)
const day = (offset: number) => iso(addDays(today, offset))

export const CURRENT_USER_ID = "u1"

export const users: User[] = [
  { id: "u1", name: "Juan Dela Cruz", email: "juan.delacruz@etms.gov.ph", role: "Administrator", department: "Operations", active: true, initials: "JD" },
  { id: "demo-admin", name: "Admin User", email: "admin@gmail.com", role: "Administrator", department: "Operations", active: true, initials: "AU" },
  { id: "u2", name: "Maria Santos", email: "maria.santos@etms.gov.ph", role: "Manager", department: "Engineering", active: true, initials: "MS" },
  { id: "u3", name: "Jose Reyes", email: "jose.reyes@etms.gov.ph", role: "Employee", department: "Engineering", active: true, initials: "JR" },
  { id: "u4", name: "Ana Bautista", email: "ana.bautista@etms.gov.ph", role: "Employee", department: "Design", active: true, initials: "AB" },
  { id: "u5", name: "Carlo Mendoza", email: "carlo.mendoza@etms.gov.ph", role: "Manager", department: "Finance", active: true, initials: "CM" },
  { id: "u6", name: "Liza Garcia", email: "liza.garcia@etms.gov.ph", role: "Employee", department: "Human Resources", active: true, initials: "LG" },
  { id: "u7", name: "Ramon Villanueva", email: "ramon.villanueva@etms.gov.ph", role: "Employee", department: "Marketing", active: false, initials: "RV" },
  { id: "u8", name: "Grace Torres", email: "grace.torres@etms.gov.ph", role: "Employee", department: "Operations", active: true, initials: "GT" },
  { id: "u9", name: "Demo User", email: "demo.user@etms.gov.ph", role: "Employee", department: "Operations", active: true, initials: "DU" },
]

interface Seed {
  title: string
  description: string
  assignedTo: string
  createdBy: string
  priority: TaskPriority
  status: TaskStatus
  start: number
  due: number
  category: string
  progress: number
  attachments?: string[]
  remarks?: string
}

const seeds: Seed[] = [
  { title: "Migrate payroll database to new server", description: "Move the legacy payroll database to the new on-prem cluster with zero downtime. Coordinate with Finance for a maintenance window.", assignedTo: "u3", createdBy: "u2", priority: "High", status: "In Progress", start: -6, due: 1, category: "Development", progress: 65, attachments: ["migration-plan.pdf", "schema-v2.sql"] },
  { title: "Q3 budget variance report", description: "Compile the Q3 variance report comparing actual spend to approved budget across all departments.", assignedTo: "u5", createdBy: "u1", priority: "High", status: "Pending", start: -1, due: 3, category: "Finance", progress: 0 },
  { title: "Redesign employee onboarding portal", description: "Produce high-fidelity mockups for the new onboarding portal including the checklist and document upload flows.", assignedTo: "u4", createdBy: "u2", priority: "Medium", status: "In Progress", start: -10, due: 6, category: "Design", progress: 40, attachments: ["wireframes.fig"] },
  { title: "Annual performance review templates", description: "Update the performance review templates to reflect the new competency framework.", assignedTo: "u6", createdBy: "u1", priority: "Medium", status: "Overdue", start: -14, due: -2, category: "HR", progress: 70, remarks: "Waiting on final approval from the HR director." },
  { title: "Patch production API servers", description: "Apply the September security patches to all production API servers and verify health checks.", assignedTo: "u3", createdBy: "u2", priority: "High", status: "Completed", start: -3, due: 0, category: "Operations", progress: 100 },
  { title: "Social media campaign for open house", description: "Plan and schedule posts for the October open house across all official channels.", assignedTo: "u7", createdBy: "u1", priority: "Low", status: "Cancelled", start: -8, due: 10, category: "Marketing", progress: 10, remarks: "Event postponed to next quarter." },
  { title: "Document task API endpoints", description: "Write OpenAPI documentation for all task management endpoints, including examples.", assignedTo: "u1", createdBy: "u2", priority: "Medium", status: "In Progress", start: -4, due: 2, category: "Documentation", progress: 55 },
  { title: "Inventory audit for regional offices", description: "Complete physical count and reconcile against the asset register for the three regional offices.", assignedTo: "u8", createdBy: "u1", priority: "High", status: "Pending", start: 0, due: 7, category: "Operations", progress: 0 },
  { title: "Fix login timeout bug", description: "Users are logged out after 5 minutes of inactivity instead of 30. Investigate session refresh logic.", assignedTo: "u3", createdBy: "u1", priority: "High", status: "Overdue", start: -7, due: -1, category: "Development", progress: 80, remarks: "Root cause identified; fix under review." },
  { title: "Design system icon refresh", description: "Audit and replace inconsistent icons in the internal design system library.", assignedTo: "u4", createdBy: "u2", priority: "Low", status: "Completed", start: -12, due: -3, category: "Design", progress: 100 },
  { title: "Vendor contract renewals", description: "Review and process renewal for expiring vendor contracts before end of month.", assignedTo: "u5", createdBy: "u1", priority: "High", status: "In Progress", start: -5, due: 4, category: "Finance", progress: 30 },
  { title: "Prepare monthly ops summary", description: "Summarize key operational metrics and incidents for the monthly management meeting.", assignedTo: "u1", createdBy: "u1", priority: "Medium", status: "Pending", start: 0, due: 0, category: "Operations", progress: 0 },
  { title: "New hire orientation schedule", description: "Finalize the orientation agenda and coordinate speakers for the incoming batch.", assignedTo: "u6", createdBy: "u1", priority: "Medium", status: "In Progress", start: -2, due: 5, category: "HR", progress: 45 },
  { title: "Set up staging environment", description: "Provision a staging environment mirroring production for the ETMS rollout.", assignedTo: "u3", createdBy: "u2", priority: "Medium", status: "Completed", start: -9, due: -4, category: "Development", progress: 100 },
  { title: "Update employee handbook", description: "Incorporate the revised leave policy and remote work guidelines into the handbook.", assignedTo: "u1", createdBy: "u5", priority: "Low", status: "In Progress", start: -3, due: 12, category: "Documentation", progress: 20 },
  { title: "Office relocation logistics", description: "Coordinate movers, IT setup, and seating plan for the 4th floor relocation.", assignedTo: "u8", createdBy: "u1", priority: "High", status: "In Progress", start: -1, due: 2, category: "Operations", progress: 35 },
  { title: "Accessibility audit of public site", description: "Run WCAG 2.2 AA audit on the public website and log all findings.", assignedTo: "u4", createdBy: "u1", priority: "High", status: "Pending", start: 1, due: 9, category: "Design", progress: 0 },
  { title: "Reconcile petty cash accounts", description: "Reconcile petty cash for August and file supporting receipts.", assignedTo: "u5", createdBy: "u1", priority: "Medium", status: "Completed", start: -6, due: -1, category: "Finance", progress: 100 },
]

export const tasks: Task[] = seeds.map((s, i) => {
  const id = `T-${String(1001 + i).padStart(4, "0")}`
  const createdAt = day(s.start - 1)
  const activity: ActivityEntry[] = [
    { id: `${id}-a1`, type: "created", message: "Task created", userId: s.createdBy, at: createdAt },
    { id: `${id}-a2`, type: "assigned", message: `Assigned to ${users.find((u) => u.id === s.assignedTo)?.name}`, userId: s.createdBy, at: createdAt },
  ]
  if (s.status !== "Pending") {
    activity.push({ id: `${id}-a3`, type: "status", message: "Status changed to In Progress", userId: s.assignedTo, at: day(s.start) })
  }
  if (s.status === "Completed") {
    activity.push({ id: `${id}-a4`, type: "completed", message: "Task marked as Completed", userId: s.assignedTo, at: day(s.due) })
  }
  if (s.status === "Cancelled") {
    activity.push({ id: `${id}-a4`, type: "status", message: "Task cancelled", userId: s.createdBy, at: day(s.start + 2) })
  }
  return {
    id,
    title: s.title,
    description: s.description,
    assignedTo: s.assignedTo,
    createdBy: s.createdBy,
    priority: s.priority,
    status: s.status,
    startDate: day(s.start),
    dueDate: day(s.due),
    category: s.category,
    attachments: s.attachments ?? [],
    remarks: s.remarks ?? "",
    progress: s.progress,
    createdAt,
    completedAt: s.status === "Completed" ? day(s.due) : undefined,
    activity,
    subtasks: [],
    people: [],
  }
})

export const notifications: Notification[] = [
  { id: "n1", type: "assigned", title: "New task assigned", message: "Maria Santos assigned you \"Document task API endpoints\"", taskId: "T-1007", at: iso(subDays(today, 0)), read: false },
  { id: "n2", type: "deadline", title: "Deadline approaching", message: "\"Prepare monthly ops summary\" is due today", taskId: "T-1012", at: iso(subDays(today, 0)), read: false },
  { id: "n3", type: "overdue", title: "Task overdue", message: "\"Fix login timeout bug\" passed its due date", taskId: "T-1009", at: iso(subDays(today, 1)), read: false },
  { id: "n4", type: "completed", title: "Task completed", message: "Jose Reyes completed \"Patch production API servers\"", taskId: "T-1005", at: iso(subDays(today, 1)), read: false },
  { id: "n5", type: "overdue", title: "Task overdue", message: "\"Annual performance review templates\" passed its due date", taskId: "T-1004", at: iso(subDays(today, 2)), read: true },
  { id: "n6", type: "completed", title: "Task completed", message: "Carlo Mendoza completed \"Reconcile petty cash accounts\"", taskId: "T-1018", at: iso(subDays(today, 3)), read: true },
]
