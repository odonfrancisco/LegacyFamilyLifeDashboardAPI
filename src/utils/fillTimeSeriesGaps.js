import { addDays, addWeeks, addMonths, formatISO } from 'date-fns'
import { alignStartDate } from './alignStartDate.js'
import { isValidSkipDay } from './isValidSkipDay.js'

const INCREMENT = {
  day: d => addDays(d, 1),
  week: d => addWeeks(d, 1),
  month: d => addMonths(d, 1),
}

/**
 * Fill missing dates/weeks/months with zeros for chart series
 * @param {Array} charts - [{ name, series: [{ x, y }] }]
 * @param {string} interval - 'day' | 'week' | 'month'
 * @param {boolean} skipDays
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns filled charts
 */
export function fillTimeSeriesGaps({ charts, interval, skipDays, startDate, endDate }) {
  const increment = INCREMENT[interval]

  const alignedStart = alignStartDate(new Date(startDate), interval)
  const end = new Date(endDate)

  return charts.map(chart => {
    const filled = []

    // Map existing points by ISO date string
    const seriesMap = chart.series.reduce((acc, point) => {
      acc[point.x] = point.y
      return acc
    }, {})

    let current = new Date(alignedStart)

    while (current <= end) {
      const isoDate = formatISO(current, { representation: 'date' })

      // Respect skipDays logic exactly like before
      if (isValidSkipDay({ date: isoDate, skipDays, interval })) {
        current = increment(current)
        continue
      }

      filled.push({
        x: isoDate,
        y: seriesMap[isoDate] ?? 0,
      })

      current = increment(current)
    }

    return {
      ...chart,
      series: filled,
    }
  })
}
