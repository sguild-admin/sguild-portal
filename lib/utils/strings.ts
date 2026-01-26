// lib/utils/strings.ts
export function toTitleCase(input: string) {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function clampString(input: string, max: number) {
  const s = input ?? ""
  return s.length > max ? s.slice(0, max) : s
}
