export const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
]

export function getPeriodStart(periodKey, now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  if (periodKey === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  if (periodKey === 'month') start.setDate(1)
  return start
}
