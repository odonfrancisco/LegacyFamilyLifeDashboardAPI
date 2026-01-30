import { buildTimeSeriesPipeline } from '../aggregations/buildTimeSeriesPipeline.js'
import { fillTimeSeriesGaps } from '../utils/fillTimeSeriesGaps.js'

export async function runTimeSeriesCharts({
  collection,
  match,
  chartRegistry,
  interval,
  startDate,
  endDate,
  skipDays,
}) {
  // 1️⃣ Resolve requested charts
  //   const requestedCharts = chartKeys.map(k => chartRegistry[k])
  const agentChartsArr = Object.entries(chartRegistry)

  // 2️⃣ Expand dependencies
  //   const requiredKeys = new Set(chartKeys)
  //   requestedCharts.forEach(chart => {
  //     chart.dependsOn?.forEach(dep => requiredKeys.add(dep))
  //   })

  //   const resolvedCharts = [...requiredKeys].map(k => chartRegistry[k])

  // 3️⃣ Build & run aggregation
  const pipeline = buildTimeSeriesPipeline({
    match,
    charts: agentChartsArr,
    interval,
    startDate,
    endDate,
  })

  const rawSeries = await collection.aggregate(pipeline).toArray()

  // 4️⃣ Fill gaps
  const filledSeries = fillTimeSeriesGaps({
    series: rawSeries,
    interval,
    skipDays,
    startDate,
    endDate,
  })

  // 5️⃣ Compute derived metrics
  const completeSeries = filledSeries.map(row => {
    const computed = { ...row }

    for (const [chartName, props] of agentChartsArr) {
      if (!props.compute) continue
      computed[chartName] = props.compute(row)
    }
    return computed
  })

  return {
    interval,
    charts: agentChartsArr.map(([chartKey]) => ({
      name: chartKey,
      // series: rawSeries.map(row => ({
      series: completeSeries.map(row => ({
        date: row.date,
        value: row[chartKey] || 0,
      })),
    })),
  }
}
