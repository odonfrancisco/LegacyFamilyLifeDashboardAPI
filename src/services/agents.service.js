// services/agentService.js
import { agentDataCollection } from '../db/collections.js'

const EXCLUDED_AGENTS = [
  'marissa_marissa_(inbound)',
  'marissa_marissa_v2_(inbound)',
  'progressive_dialer',
  'david_toelle',
  'micah_metcalf',
  'byron_bierce',
  'isaiah_de_deos',
  'andrew_foley',
  'ian_randies',
]

export async function fetchActiveAgents({ days = 14 }) {
  const collection = agentDataCollection()

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const pipeline = [
    {
      $match: {
        businessDate: { $gte: cutoffDate },
        agentId: { $nin: EXCLUDED_AGENTS },
      },
    },
    {
      $group: {
        _id: '$agentId',
        agentName: { $first: '$agentName' },
        agentId: { $first: '$agentId' },
      },
    },
    {
      $project: {
        _id: 0,
        agentName: 1,
        agentId: 1,
      },
    },
    {
      $sort: { agentName: 1 },
    },
  ]

  return collection.aggregate(pipeline).toArray()
}
