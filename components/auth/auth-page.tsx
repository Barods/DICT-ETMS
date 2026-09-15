import { useState, type FormEvent } from "react"
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Mode = "login" | "signup"

interface Account {
  name: string
  email: string
  password: string
}

const accountsKey = "etms-accounts"
const sessionKey = "etms-session"
const defaultAccount: Account = { name: "Aslan Barodi", email: "aslan.barodi@etms.gov.ph", password: "password123" }

function getAccounts() {
  try {
    const stored = JSON.parse(localStorage.getItem(accountsKey) ?? "[]") as Account[]
    return [defaultAccount, ...stored.filter((account) => account.email !== defaultAccount.email)]
  } catch {
    return [defaultAccount]
  }
}

export function hasAuthSession() {
  return Boolean(localStorage.getItem(sessionKey))
}

export function signOut() {
  localStorage.removeItem(sessionKey)
  window.history.pushState({}, "", "/login")
  window.dispatchEvent(new PopStateEvent("popstate"))
}

export function AuthPage({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    setError("")
    setNotice("")
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setNotice("")

    if (mode === "login") {
      const account = getAccounts().find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password)
      if (!account) {
        setError("Invalid email or password.")
        return
      }
      localStorage.setItem(sessionKey, JSON.stringify({ name: account.name, email: account.email }))
      window.history.pushState({}, "", "/")
      window.dispatchEvent(new PopStateEvent("popstate"))
      return
    }

    if (!name.trim() || !email.trim()) return setError("Please complete all required fields.")
    if (password.length < 8) return setError("Password must be at least 8 characters.")
    if (password !== confirmPassword) return setError("Passwords do not match.")
    if (getAccounts().some((account) => account.email.toLowerCase() === email.trim().toLowerCase())) return setError("An account with this email already exists.")

    const accounts = JSON.parse(localStorage.getItem(accountsKey) ?? "[]") as Account[]
    const account = { name: name.trim(), email: email.trim(), password }
    localStorage.setItem(accountsKey, JSON.stringify([...accounts, account]))
    localStorage.setItem(sessionKey, JSON.stringify({ name: account.name, email: account.email }))
    setNotice("Account created. Redirecting to your dashboard...")
    window.setTimeout(() => {
      window.history.pushState({}, "", "/")
      window.dispatchEvent(new PopStateEvent("popstate"))
    }, 400)
  }

  return <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#eef3fb] px-4 py-10">
    <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-card shadow-2xl shadow-blue-900/10 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-[#2563eb] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-72 rounded-full border-[36px] border-white/10" />
        <div className="absolute -bottom-28 -left-20 size-72 rounded-full border-[36px] border-white/10" />
        <div>
          <div className="flex h-20 w-48 items-center justify-center rounded-2xl bg-white p-4 shadow-lg"><img src="/images/etms-logo.png" alt="eTMS logo" className="max-h-full w-full object-contain" /></div>
          <p className="mt-16 max-w-sm text-4xl font-bold leading-tight">Work gets clearer when everyone has the same view.</p>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-blue-100">Manage assignments, monitor progress, and keep every team moving with eTMS.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-100"><CheckCircle2 className="size-4" /> Secure workspace access</div>
      </section>

      <section className="flex min-h-[600px] flex-col justify-center p-6 sm:p-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-9 lg:hidden"><img src="/images/etms-logo.png" alt="eTMS logo" className="h-16 w-40 object-contain object-left" /></div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">eTMS workspace</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{mode === "login" ? "Sign in to continue to your task management workspace." : "Set up your account to start managing organizational tasks."}</p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            {mode === "signup" && <label className="flex flex-col gap-2 text-sm font-medium">Full name<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Juan Dela Cruz" autoComplete="name" required /></label>}
            <label className="flex flex-col gap-2 text-sm font-medium">Email address<div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@organization.gov.ph" autoComplete="email" required /></div></label>
            <label className="flex flex-col gap-2 text-sm font-medium">Password<div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} required /></div></label>
            {mode === "signup" && <label className="flex flex-col gap-2 text-sm font-medium">Confirm password<div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" required /></div></label>}
            {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            {notice && <p role="status" className="text-sm font-medium text-emerald-600">{notice}</p>}
            <Button type="submit" className="mt-2 h-10">{mode === "login" ? "Sign in" : "Create account"}<ArrowRight className="size-4" /></Button>
          </form>

          <div className="mt-7 flex items-center justify-center gap-2 text-sm text-muted-foreground">{mode === "login" ? "New to eTMS?" : "Already have an account?"}<button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")} className="font-semibold text-primary hover:underline">{mode === "login" ? "Create an account" : "Sign in"}</button></div>
          {mode === "login" && <p className="mt-6 text-center text-xs text-muted-foreground">Demo account: aslan.barodi@etms.gov.ph / password123</p>}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><UserRound className="size-3.5" /> Electronic Task Management System</div>
        </div>
      </section>
    </div>
  </main>
}