import { formatChartResponse } from '../utils/formatChartResponse.js'
import { parseChartQuery } from '../utils/parseChartQuery.js'
import { computeDateRange } from '../utils/dateRange.js'
import { AGENT_CHARTS } from '../config/charts.js'

import {
  queryAgentCharts,
  queryCompanyCharts,
  queryCompareCharts,
} from '../services/charts.service.js'

import cache from '../utils/cache.js'
import { log } from '../utils/logger.js'
import formatDate from '../utils/formatDate.js'

export async function getAgentChartNames(req, res, next) {
  try {
    res.json({
      message: 'validated agent charts request',
      names: Object.keys(AGENT_CHARTS),
    })
  } catch (err) {
    next(err)
  }
}

export async function getAgentCharts(req, res, next) {
  try {
    const { agentId } = req.params
    const { interval, range, skipDays } = parseChartQuery(req.query)
    const { startDate, endDate } = computeDateRange(range)

    const charts = await queryAgentCharts({ agentId, interval, skipDays, startDate, endDate })

    res.json({
      message: 'validated agent charts request',
      interval,
      startDate,
      endDate,
      charts,
    })
  } catch (err) {
    next(err)
  }
}

export async function getAgentChart(req, res, next) {
  try {
    const { agentId } = req.params
    const { interval, range } = parseChartQuery(req.query)
    const { startDate, endDate } = computeDateRange(range)

    // temporary mock data
    const series = [
      { date: '2026-01-20', value: 2 },
      { date: '2026-01-21', value: 0 },
      { date: '2026-01-22', value: 5 },
    ]

    res.json(
      formatChartResponse({
        entityType: 'agent',
        entityId: agentId,
        interval,
        startDate,
        endDate,
        series,
      }),
    )
  } catch (err) {
    next(err)
  }
}

export async function getCompanyCharts(req, res, next) {
  try {
    const { interval, range, skipDays } = parseChartQuery(req.query)
    const { startDate, endDate } = computeDateRange(range)

    const cacheKey = `company-${interval}-${range}-${skipDays}-${formatDate(startDate)}-${formatDate(endDate)}`
    const cachedData = cache.get(cacheKey)
    if (cachedData) {
      log('info', 'Returned chart data using Cache')
      return res.json({
        message: 'validated agent charts request',
        interval,
        startDate,
        endDate,
        charts: cachedData,
      })
    }

    log('info', 'Not using Cache')

    const charts = await queryCompanyCharts({ interval, startDate, endDate, skipDays })
    // Store 4 minutes
    cache.set(cacheKey, charts, 24e4)

    res.json({
      message: 'validated agent charts request',
      interval,
      startDate,
      endDate,
      charts,
    })
  } catch (err) {
    next(err)
  }
}

export async function getCompanyChart(req, res, next) {
  try {
    res.json({ message: 'getCompanyChart not implemented' })
  } catch (err) {
    next(err)
  }
}

export async function getCompareCharts(req, res, next) {
  try {
    const { chartName } = req.params
    const { interval, range, skipDays } = parseChartQuery(req.query)
    const { startDate, endDate } = computeDateRange(range)

    const charts = await queryCompareCharts({ chartName, interval, skipDays, startDate, endDate })

    res.json({
      message: 'validated charts request',
      interval,
      startDate,
      endDate,
      charts,
    })
  } catch (err) {
    next(err)
  }
}
