import axios from "axios"
import { getAppUrl } from "@/lib/base"

const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "/api/v1" : "http://localhost:8000/api/v1")
const sessionKey = "etms-session"

export type ApiErrorResponse = {
  detail?: string
  email?: string[]
  username?: string[]
  password?: string[]
  new_password?: string[]
  re_new_password?: string[]
  token?: string[]
  uid?: string[]
  non_field_errors?: string[]
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
})

function redirectToLogin() {
  localStorage.removeItem(sessionKey)
  if (typeof window === "undefined" || window.location.pathname.endsWith("/login")) return
  window.history.pushState({}, "", getAppUrl("/login"))
  window.dispatchEvent(new PopStateEvent("popstate"))
}

apiClient.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem(sessionKey) ?? "null") as { accessToken?: string } | null
    if (session?.accessToken && session.accessToken !== "demo-access-token") {
      config.headers.set("Authorization", `Bearer ${session.accessToken}`)
    }
  } catch {
    // Requests can proceed without a saved session.
  }
  return config
})

apiClient.interceptors.response.use(undefined, (error) => {
  const requestUrl = error.config?.url ?? ""
  const isAuthRequest = requestUrl.includes("/auth/login/") || requestUrl.includes("/auth/jwt/refresh/")
  if (error.response?.status === 401 && !isAuthRequest) redirectToLogin()
  return Promise.reject(error)
})

export function getApiErrorData(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError<ApiErrorResponse>(error)) return error.response?.data ?? {}
  return {}
}

export function hasApiResponse(error: unknown) {
  return axios.isAxiosError(error) && Boolean(error.response)
}
