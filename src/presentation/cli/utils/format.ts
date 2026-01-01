export function formatDate(value: Date | string | null | undefined): string {
  if (!value) {
    return 'N/A'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return date.toISOString().slice(0, 16).replace('T', ' ')
}

export function parseNumberOption(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export function ensureDate(value: string, fieldName: string): Date {
  if (!value) {
    throw new Error(`${fieldName} is required`)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}. Use ISO 8601, e.g. 2025-12-31T23:59:59Z`)
  }

  return date
}

export function formatDurationMs(durationMs: number): string {
  if (!Number.isFinite(durationMs)) {
    return 'N/A'
  }

  const minutes = durationMs / 60_000
  if (!Number.isFinite(minutes)) {
    return 'N/A'
  }

  return minutes <= 0 ? 'expired' : minutes.toFixed(2)
}
