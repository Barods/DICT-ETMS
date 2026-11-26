import { useState, type FormEvent } from "react"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient, getApiErrorData, hasApiResponse } from "@/lib/http"

export function ResetPasswordPage({ uid, token }: { uid: string; token: string }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setNotice("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      await apiClient.post("/auth/users/reset_password_confirm/", { uid, token, new_password: password, re_new_password: confirmPassword })
      setNotice("Your password has been reset. You can now sign in.")
      setPassword("")
      setConfirmPassword("")
    } catch (requestError) {
      if (hasApiResponse(requestError)) {
        const data = getApiErrorData(requestError)
        const message = data?.detail
          ?? data?.new_password?.[0]
          ?? data?.re_new_password?.[0]
          ?? data?.token?.[0]
          ?? data?.uid?.[0]
          ?? data?.non_field_errors?.[0]
          ?? "This reset link is invalid or has expired."
        setError(message)
        return
      }
      setError("Unable to connect to the server. Please try again.")
    }
  }

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef0fb] px-5 py-8 text-[#263653] sm:px-10">
    <div className="pointer-events-none absolute -left-20 top-20 size-72 rounded-full bg-[#dbe6ff] opacity-90" />
    <div className="pointer-events-none absolute -right-24 bottom-8 size-80 rounded-full bg-[#d5e1fa] opacity-80" />
    <section className="relative w-full max-w-sm rounded-xl bg-white px-7 py-8 shadow-[0_18px_45px_rgba(62,79,140,0.12)] sm:px-9 sm:py-9">
      <div className="mx-auto w-full max-w-[290px]">
        <div className="flex justify-center"><img src="/images/etms-logo.png" alt="eTMS logo" className="h-9 w-24 object-contain" /></div>
        <div className="mt-4 flex justify-center text-[#2d67e8]"><ShieldCheck className="size-8" /></div>
        <h1 className="mt-3 text-center text-xl font-bold tracking-tight text-[#263653]">Set a new password</h1>
        <p className="mt-1 text-center text-[10px] text-[#78849c]">Choose a new password for your account</p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <Input type="password" className="h-8 rounded-md border-[#e7eaf2] px-3 text-[10px] shadow-none" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" autoComplete="new-password" required />
          <Input type="password" className="h-8 rounded-md border-[#e7eaf2] px-3 text-[10px] shadow-none" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" autoComplete="new-password" required />
          {error && <p role="alert" className="text-[10px] font-medium text-destructive">{error}</p>}
          {notice && <p role="status" className="text-[10px] font-medium text-emerald-600">{notice}</p>}
          <Button type="submit" className="mt-1 h-8 rounded-md bg-[#2d67e8] text-[10px] shadow-none hover:bg-[#2459d2]">Reset password</Button>
        </form>

        <button type="button" onClick={() => { window.history.pushState({}, "", "/login"); window.dispatchEvent(new PopStateEvent("popstate")) }} className="mx-auto mt-7 flex items-center gap-1 text-[9px] font-semibold text-[#2d67e8] hover:underline"><ArrowLeft className="size-3" /> Back to sign in</button>
      </div>
    </section>
  </main>
}
