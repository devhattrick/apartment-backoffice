import dayjs from 'dayjs'

export function nowIso(): string {
  return dayjs().toISOString()
}

export function todayIsoDate(): string {
  return dayjs().format('YYYY-MM-DD')
}

export function monthKey(value: string | Date = new Date()): string {
  return dayjs(value).format('YYYY-MM')
}

export function formatDate(value: string): string {
  if (!value) {
    return '-'
  }

  return dayjs(value).format('DD MMM YYYY')
}

export function formatDateTime(value: string): string {
  if (!value) {
    return '-'
  }

  return dayjs(value).format('DD MMM YYYY HH:mm')
}

export function addMonths(date: string, months: number): string {
  return dayjs(date).add(months, 'month').format('YYYY-MM-DD')
}

export function addYears(date: string, years: number): string {
  return dayjs(date).add(years, 'year').format('YYYY-MM-DD')
}
