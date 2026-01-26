// lib/utils/time.ts
export function now() {
  return new Date()
}

export function addMs(date: Date, ms: number) {
  return new Date(date.getTime() + ms)
}

export function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function iso(date: Date) {
  return date.toISOString()
}

export function minutes(n: number) {
  return n * 60 * 1000
}

export function hours(n: number) {
  return n * 60 * 60 * 1000
}

export function days(n: number) {
  return n * 24 * 60 * 60 * 1000
}
