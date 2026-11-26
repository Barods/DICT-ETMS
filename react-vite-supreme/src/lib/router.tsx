import { useEffect, useState, type ReactNode } from "react"
import { getAppPathname, getAppUrl } from "@/lib/base"

export function Link({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return <a href={href} {...props} onClick={(event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.history.pushState({}, "", getAppUrl(href))
    window.dispatchEvent(new PopStateEvent("popstate"))
    props.onClick?.(event)
  }}>{children}</a>
}

export function usePathname() {
  const [pathname, setPathname] = useState(() => getAppPathname())
  useEffect(() => {
    const update = () => setPathname(getAppPathname())
    window.addEventListener("popstate", update)
    return () => window.removeEventListener("popstate", update)
  }, [])
  return pathname
}

export function useRouter() {
  return { push: (href: string) => {
    window.history.pushState({}, "", getAppUrl(href))
    window.dispatchEvent(new PopStateEvent("popstate"))
  }, back: () => window.history.back() }
}

export function useParams<T extends Record<string, string>>() {
  const pathname = usePathname()
  const match = pathname.match(/^\/tasks\/([^/]+)\/?$/)
  return { id: match?.[1] ?? "" } as unknown as T
}