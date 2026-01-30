const DEFAULT_INTERVAL = 'week'
const DEFAULT_RANGE = '30d'
const ALLOWED_INTERVALS = ['day', DEFAULT_INTERVAL, 'month']
const ALLOWED_RANGES = ['7d', DEFAULT_RANGE, '90d', '180d', '365d']

export function parseChartQuery(query) {
  const { interval = DEFAULT_INTERVAL, range = DEFAULT_RANGE, skipDays = '' } = query

  if (!ALLOWED_INTERVALS.includes(interval)) {
    throw new Error(
      `Invalid interval: ${interval}. Must be one of: ${ALLOWED_INTERVALS.join(', ')}`,
    )
  }

  if (!ALLOWED_RANGES.includes(range)) {
    throw new Error(`Invalid range. Must be one of: ${ALLOWED_RANGES.join(', ')}`)
  }

  if (typeof skipDays != 'string') {
    throw new Error(`skipDays must be a single digit number string`)
  }

  return {
    interval,
    range,
    skipDays,
  }
}
