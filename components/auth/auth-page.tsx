import { useState, type FormEvent } from "react"
import { FileCheck2, ShieldCheck, UserRound, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1"

type Mode = "login" | "signup" | "forgot"

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

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setNotice("")

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Please enter your email address.")
        return
      }

      try {
        const response = await fetch(`${API_URL}/auth/users/reset_password/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          setError(data?.detail ?? "Unable to send the reset email.")
          return
        }

        setNotice("If an account exists for that email, a password reset link has been sent.")
      } catch {
        setError("Unable to connect to the server. Please check the database connection.")
      }
      return
    }

    if (mode === "login") {
      try {
        const response = await fetch(`${API_URL}/auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          setError(data?.detail ?? "Invalid email or password.")
          return
        }

        const userName = [data.user?.first_name, data.user?.last_name].filter(Boolean).join(" ") || data.user?.username || email.trim()
        localStorage.setItem(sessionKey, JSON.stringify({
          name: userName,
          email: data.user?.email ?? email.trim(),
          accessToken: data.access,
          refreshToken: data.refresh,
        }))

        window.history.pushState({}, "", "/")
        window.dispatchEvent(new PopStateEvent("popstate"))
        return
      } catch {
        setError("Unable to connect to the server. Please check the database connection.")
        return
      }
    }

    if (!name.trim() || !email.trim()) return setError("Please complete all required fields.")
    if (password.length < 8) return setError("Password must be at least 8 characters.")
    if (password !== confirmPassword) return setError("Passwords do not match.")

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const fullName = name.trim()
      const nameParts = fullName.split(/\s+/).filter(Boolean)
      const firstName = nameParts[0] ?? ""
      const lastName = nameParts.slice(1).join(" ")

      const usernameBase = normalizedEmail.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "") || "user"
      const username = usernameBase.length > 30 ? usernameBase.slice(0, 30) : usernameBase

      const registerResponse = await fetch(`${API_URL}/users/all/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email: normalizedEmail,
          password,
          first_name: firstName,
          last_name: lastName,
          is_active: true,
        }),
      })

      const registerData = await registerResponse.json().catch(() => ({}))
      if (!registerResponse.ok) {
        const serverMessage = registerData?.email?.[0] ?? registerData?.username?.[0] ?? registerData?.password?.[0] ?? registerData?.detail ?? "Unable to create the account."
        setError(serverMessage)
        return
      }

      setNotice("Account created. Signing you in...")

      const loginResponse = await fetch(`${API_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      })

      const loginData = await loginResponse.json().catch(() => ({}))
      if (!loginResponse.ok) {
        setError(loginData?.detail ?? "Account created but sign-in failed. Please try logging in manually.")
        return
      }

      const userName = [loginData.user?.first_name, loginData.user?.last_name].filter(Boolean).join(" ") || loginData.user?.username || fullName
      localStorage.setItem(sessionKey, JSON.stringify({
        name: userName,
        email: loginData.user?.email ?? normalizedEmail,
        accessToken: loginData.access,
        refreshToken: loginData.refresh,
      }))

      window.history.pushState({}, "", "/")
      window.dispatchEvent(new PopStateEvent("popstate"))
    } catch {
      setError("Unable to connect to the server. Please check the database connection.")
    }
  }

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef0fb] px-5 py-8 text-[#263653] sm:px-10">
    <div className="pointer-events-none absolute -left-20 top-20 size-72 rounded-full bg-[#dbe6ff] opacity-90" />
    <div className="pointer-events-none absolute -right-24 bottom-8 size-80 rounded-full bg-[#d5e1fa] opacity-80" />
    <div className={`relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_360px] ${mode === "signup" ? "lg:grid-cols-[0.7fr_360px]" : ""}`}>
      <section className="relative hidden min-h-[560px] items-center justify-center lg:flex">
        <div className="absolute left-1/2 top-1/2 h-[390px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-[42%] bg-[#d9e3fa]" />
        <div className="relative w-[420px]">
          <div className="absolute left-10 top-0 z-10 flex h-28 w-36 items-center justify-center rounded-xl border-4 border-[#1769e8] bg-white shadow-sm">
            <div className="text-center text-[#1769e8]"><div className="text-3xl font-black tracking-tight">DICT</div><div className="text-[8px] font-semibold tracking-[0.2em]">CONNECT • PROTECT</div></div>
          </div>
          <div className="absolute right-6 top-10 z-10 flex size-16 items-center justify-center rounded-lg border-2 border-[#9bbdff] bg-white text-[#1769e8] shadow-sm"><Wifi className="size-8" /></div>
          <div className="relative mx-auto mt-24 h-56 w-64 rounded-[50%] border-[18px] border-[#2f80ed] bg-[#b8d9ff] shadow-inner">
            <div className="absolute -left-12 top-16 h-24 w-24 rounded-full bg-[#1d4ed8]" />
            <div className="absolute -right-8 top-5 h-32 w-24 rotate-12 rounded-[45%] bg-[#e63b5d]" />
            <div className="absolute -bottom-9 left-1/2 h-24 w-28 -translate-x-1/2 rounded-b-[45%] border-x-8 border-b-8 border-[#2563eb] bg-[#9cc8ff]" />
          </div>
          <div className="absolute bottom-2 left-2 flex h-28 w-36 rotate-[-8deg] items-center justify-center rounded-xl border-2 border-[#9bbdff] bg-white shadow-sm"><FileCheck2 className="size-14 text-[#2f80ed]" /></div>
          <div className="absolute bottom-10 right-0 flex size-20 items-center justify-center rounded-xl border-2 border-[#9bbdff] bg-white text-[#2563eb] shadow-sm"><ShieldCheck className="size-10" /></div>
        </div>
      </section>

      <section className="relative rounded-xl bg-white px-7 py-8 shadow-[0_18px_45px_rgba(62,79,140,0.12)] sm:px-9 sm:py-9">
        <div className="mx-auto w-full max-w-[290px]">
          <div className="flex justify-center"><img src="/images/etms-logo.png" alt="eTMS logo" className="h-9 w-24 object-contain" /></div>
          <h1 className="mt-3 text-center text-xl font-bold tracking-tight text-[#263653]">{mode === "login" ? "Sign in" : mode === "forgot" ? "Forgot password" : "Welcome to ETMS"}</h1>
          <p className="mt-1 text-center text-[10px] text-[#78849c]">{mode === "login" ? "Enter your account details to continue" : mode === "forgot" ? "Enter your email to receive a reset link" : "Input details to create your account"}</p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            {mode === "signup" && <div className="grid grid-cols-2 gap-2"><Input className="h-8 rounded-md border-[#e7eaf2] px-3 text-[10px] shadow-none" value={name.split(" ")[0] ?? ""} onChange={(event) => setName(`${event.target.value} ${name.split(" ").slice(1).join(" ")}`.trim())} placeholder="First name" autoComplete="given-name" required /><Input className="h-8 rounded-md border-[#e7eaf2] px-3 text-[10px] shadow-none" value={name.split(" ").slice(1).join(" ")} onChange={(event) => setName(`${name.split(" ")[0] ?? ""} ${event.target.value}`.trim())} placeholder="Last name" autoComplete="family-name" required /></div>}
            <Input type="email" className="h-8 rounded-md border-[#e7eaf2] px-3 text-[10px] shadow-none" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Username or email" autoComplete="email" required />
            {mode !== "forgot" && <Input type="password" className="h-8 rounded-md border-[#e7eaf2] px-3 text-[10px] shadow-none" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} required />}
            {mode === "signup" && <Input type="password" className="h-8 rounded-md border-[#e7eaf2] px-3 text-[10px] shadow-none" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" autoComplete="new-password" required />}
            {error && <p role="alert" className="text-[10px] font-medium text-destructive">{error}</p>}
            {notice && <p role="status" className="text-[10px] font-medium text-emerald-600">{notice}</p>}
            {mode === "login" && <button type="button" onClick={() => switchMode("forgot")} className="self-end text-[9px] font-medium text-[#4778e8] hover:underline">Forgot password?</button>}
            <Button type="submit" className="mt-1 h-8 rounded-md bg-[#2d67e8] text-[10px] shadow-none hover:bg-[#2459d2]">{mode === "login" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Sign up"}</Button>
          </form>

          <div className="mt-7 text-center text-[9px] text-[#8993a7]">{mode === "signup" ? "Already have an account?" : mode === "forgot" ? "Don't have an account?" : "Don't have an account?"}{" "}<button type="button" onClick={() => switchMode(mode === "signup" ? "login" : mode === "forgot" ? "signup" : "signup")} className="font-semibold text-[#2d67e8] hover:underline">{mode === "signup" ? "Login" : mode === "forgot" ? "Create account" : "Sign up"}</button></div>
          <div className="mt-8 flex items-center justify-center gap-1.5 text-[8px] text-[#a0a8b8]"><UserRound className="size-3" /> Electronic Task Management System</div>
        </div>
      </section>
    </div>
  </main>
}