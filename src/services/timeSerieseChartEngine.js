import { buildTimeSeriesPipeline } from '../aggregations/buildTimeSeriesPipeline.js'
import { fillTimeSeriesGaps } from '../utils/fillTimeSeriesGaps.js'
import { sortByTotalVolumeDesc } from '../utils/sortByTotalVolumes.js'
import { computeSeries } from '../utils/computeSeries.js'

export async function runTimeSeriesCharts({
  collection,
  match,
  chartRegistry,
  interval,
  startDate,
  endDate,
  skipDays,
  groupBy,
  sort,
}) {
  const pipeline = buildTimeSeriesPipeline({
    match,
    charts: chartRegistry,
    interval,
    startDate,
    endDate,
    groupBy,
  })

  const rawSeries = await collection.aggregate(pipeline).toArray()

  // 4️⃣ Fill gaps
  const filledSeries = fillTimeSeriesGaps({
    charts: rawSeries,
    interval,
    skipDays,
    startDate,
    endDate,
  })

  const completeSeries = computeSeries({ series: filledSeries, charts: chartRegistry })

  const orderedCharts = sort ? sort.fn(completeSeries, sort.opts) : completeSeries

  return {
    interval,
    charts: orderedCharts,
  }
}
