export function createId(prefix: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().split('-')[0]
      : Math.random().toString(36).slice(2, 10)

  return `${prefix}-${Date.now().toString(36)}-${randomPart}`
}
