import {
  AGENT_CHARTS,
  AGENT_CHART_ORDER,
  COMPANY_CHARTS,
  COMPANY_CHART_ORDER,
} from '../config/charts.js'
// import { buildAgentTimeSeriesPipeline } from '../aggregations/buildTimeSeriesPipeline.js'
// import { fillTimeSeriesGaps } from '../utils/fillTimeSeriesGaps.js'
import { runTimeSeriesCharts } from './timeSerieseChartEngine.js'
import { fetchActiveAgents } from './agents.service.js'
import { agentDataCollection, companyDataCollection } from '../db/collections.js'

import { sortByTotalVolumeDesc } from '../utils/sortByTotalVolumes.js'
import { sortByFixedOrder } from '../utils/sortByFixedOrder.js'

export async function queryAgentCharts(params) {
  return runTimeSeriesCharts({
    collection: agentDataCollection(),
    chartRegistry: AGENT_CHARTS,
    match: { agentId: params.agentId },
    sort: { fn: sortByFixedOrder, opts: AGENT_CHART_ORDER },
    ...params,
  })
}

export async function queryCompanyCharts(params) {
  return runTimeSeriesCharts({
    collection: companyDataCollection(),
    chartRegistry: COMPANY_CHARTS,
    sort: { fn: sortByFixedOrder, opts: AGENT_CHART_ORDER },
    ...params,
  })
}

export async function queryCompareCharts(params) {
  // fetchActiveAgents needs to cache that asap
  const agents = await fetchActiveAgents({})
  return runTimeSeriesCharts({
    collection: agentDataCollection(),
    chartRegistry: { [`${params.chartName}`]: AGENT_CHARTS[params.chartName] },
    groupBy: 'agentId',
    match: { agentId: { $in: agents.map(({ agentId }) => agentId) } },
    sort: { fn: sortByTotalVolumeDesc },
    ...params,
  })
}

// export async function queryAgentCharts({ agentName, interval, startDate, endDate }) {
//   const agentChartsArr = Object.entries(AGENT_CHARTS)

//   const pipeline = buildAgentTimeSeriesPipeline({
//     agentName,
//     charts: agentChartsArr,
//     interval,
//     startDate,
//     endDate,
//   })

//   const rawSeries = await agentDataCollection().aggregate(pipeline).toArray()

//   // Fill gaps once for all metrics
//   const filledSeries = fillTimeSeriesGaps(rawSeries, interval, startDate, endDate)

//   const completeSeries = filledSeries.map(row => {
//     const computed = { ...row }

//     for (const [chartName, props] of agentChartsArr) {
//       if (!props.compute) continue
//       computed[chartName] = props.compute(row)
//     }
//     return computed
//   })

//   // Split series per chart
//   const chartsData = agentChartsArr.map(([chartKey, properties]) => ({
//     name: chartKey,
//     // series: rawSeries.map(row => ({
//     series: completeSeries.map(row => ({
//       date: row.date,
//       value: row[chartKey] || 0,
//     })),
//   }))

//   return chartsData
// }

// getAgentChart({
//   agentId,
//   interval,
//   startDate,
//   endDate,
// })

// getCompanyCharts(...)
// getCompanyChart(...)
