// const BASE_CHARTS = [
//   {
//     name: 'Dials',
//     metricPath: 'data.dials.total',
//     aggregation: 'sum',
//   },
//   {
//     name: 'Manual Dials',
//     metricPath: 'data.dials.manual',
//     aggregation: 'sum',
//   },
//   {
//     name: 'Inbound Dials',
//     metricPath: 'data.dials.inbound',
//     aggregation: 'sum',
//   },

//   {
//     name: 'Contact To Presentation Rate',
//     compute: row =>
//       row.contacts > 0 ? Number(((row.presentations / row.contacts) * 100).toFixed(2)) : 0,
//     dependsOn: ['contacts', 'presentations'],
//   },
// ]

const BASE_CHARTS = {
  contacts: {
    aggregation: { $sum: '$data.contacts.total' },
  },
  presentations: {
    aggregation: { $sum: '$data.presentations.total' },
  },
  sales: {
    aggregation: { $sum: '$data.sales.total' },
  },
  premium: {
    aggregation: { $sum: '$data.sales.premium' },
  },
  dials: {
    aggregation: { $sum: '$data.dials.total' },
  },
  manualDials: {
    aggregation: { $sum: '$data.dials.manual' },
  },
  inboundDials: {
    aggregation: { $sum: '$data.dials.inbound' },
  },

  contactToPresentationRate: {
    compute: row =>
      row.contacts > 0 ? Number(((row.presentations / row.contacts) * 100).toFixed(2)) : 0,
  },
  presentationToCloseRate: {
    compute: row =>
      row.presentations > 0 ? Number(((row.sales / row.presentations) * 100).toFixed(2)) : 0,
  },
  contactToCloseRate: {
    compute: row => (row.contacts > 0 ? Number(((row.sales / row.contacts) * 100).toFixed(2)) : 0),
  },
}

export const AGENT_CHARTS = { ...BASE_CHARTS }
export const COMPANY_CHARTS = {
  ...BASE_CHARTS,

  activeAgents: {
    aggregation: { $sum: '$data.agents.total' },
  },
}
