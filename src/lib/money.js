const currency = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
})

export function formatCurrency(amount) {
  return currency.format(amount || 0)
}

export function parseAmount(value) {
  if (value === '' || value == null) return 0
  const number = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

export function hasAmount(value) {
  if (value === '' || value == null) return false
  const number = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(number)
}

export function resolveEstimate(stored, fallback) {
  if (stored === undefined || stored === null) return fallback
  return parseAmount(stored)
}

export function resolveLabel(item, labels = {}) {
  const custom = labels[item.id]
  if (custom == null || String(custom).trim() === '') return item.label
  return custom
}

export function tabLabel(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleString('en-US', {
    month: 'long',
  })
}

export function monthHeading(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function currentYearMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function nextYearMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month, 1)
  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  return `${nextYear}-${nextMonth}`
}

export function compareTone(actual, planned, invert = false) {
  if (!hasAmount(actual)) return ''
  const value = parseAmount(actual)
  if (value === planned) return 'is-even'
  const over = value > planned
  if (invert) return over ? 'is-under' : 'is-over'
  return over ? 'is-over' : 'is-under'
}
