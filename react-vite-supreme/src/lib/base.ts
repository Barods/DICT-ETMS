export const appBase = (() => {
  const configuredBase = import.meta.env.BASE_URL || "/"
  return configuredBase.endsWith("/") ? configuredBase : `${configuredBase}/`
})()

export function getAppPathname() {
  if (appBase !== "/" && window.location.pathname.startsWith(appBase)) {
    const path = window.location.pathname.slice(appBase.length - 1)
    return path || "/"
  }
  return window.location.pathname
}

export function getAppUrl(path: string) {
  if (appBase === "/") return path
  const normalizedPath = path === "/" ? "" : `/${path.replace(/^\/+/, "")}`
  return `${appBase.slice(0, -1)}${normalizedPath}`
}
