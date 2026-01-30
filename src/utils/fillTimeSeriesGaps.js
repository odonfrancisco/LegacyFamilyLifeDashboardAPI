import { addDays, addWeeks, addMonths, formatISO } from 'date-fns'

// import { isSunday } from 'date-fns'
import { alignStartDate } from './alignStartDate.js'
import { isValidSkipDay } from './isValidSkipDay.js'

const INCREMENT = {
  day: d => addDays(d, 1),
  week: d => addWeeks(d, 1),
  month: d => addMonths(d, 1),
}

/**
 * Fill missing dates/weeks/months with zeros for all keys except 'date'.
 * @param {Array} series - array of { date, ...metrics }
 * @param {string} interval - 'day' | 'week' | 'month'
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns filled array
 */
export function fillTimeSeriesGaps({ series, interval, skipDays, startDate, endDate }) {
  const filled = []
  const metricKeys = series.length ? Object.keys(series[0]).filter(k => k !== 'date') : []

  let current = alignStartDate(new Date(startDate), interval)

  const increment = INCREMENT[interval]

  // convert series to map for O(1) lookup
  const seriesMap = series.reduce((acc, row) => {
    acc[row.date] = row
    return acc
  }, {})

  while (current <= endDate) {
    const isoDate = formatISO(current, { representation: 'date' })
    // Skip skipDays if skipDays=false
    if (isValidSkipDay({ date: isoDate, skipDays })) {
      current = increment(current)
      continue
    }

    if (seriesMap[isoDate]) {
      filled.push(seriesMap[isoDate])
    } else {
      const emptyRow = { date: isoDate }
      metricKeys.forEach(k => (emptyRow[k] = 0))
      filled.push(emptyRow)
    }

    current = increment(current)
  }

  return filled
}
