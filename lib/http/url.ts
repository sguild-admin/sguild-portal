export function getBaseUrl(headers: Headers) {
  const host = headers.get("x-forwarded-host") ?? headers.get("host")
  const protocol = headers.get("x-forwarded-proto") ?? "http"

  if (host) return `${protocol}://${host}`

  const fallback = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL
  if (fallback) return fallback

  throw new Error("Unable to determine base URL")
}
