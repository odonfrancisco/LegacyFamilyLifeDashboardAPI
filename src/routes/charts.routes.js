// src/routes/charts.routes.js
import { Router } from 'express'
import {
  getAgentCharts,
  getAgentChart,
  getCompanyCharts,
  getCompanyChart,
  getCompareCharts,
  getAgentChartNames,
} from '../controllers/charts.controller.js'

const router = Router()

router.get('/names', getAgentChartNames)
/**
 * Agent charts
 */
router.get('/agent/:agentId', getAgentCharts)
router.get('/agents/:agentId/:chartName', getAgentChart)

/**
 * Company charts
 */
router.get('/company', getCompanyCharts)
router.get('/company/:chartName', getCompanyChart)

router.get('/compare/:chartName', getCompareCharts)

export default router
