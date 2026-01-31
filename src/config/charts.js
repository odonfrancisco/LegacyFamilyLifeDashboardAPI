const BASE_CHARTS = {
  premium: {
    aggregation: { $sum: '$data.sales.premium' },
  },
  sales: {
    aggregation: { $sum: '$data.sales.total' },
  },
  dials: {
    aggregation: { $sum: '$data.dials.total' },
  },
  contacts: {
    aggregation: { $sum: '$data.contacts.total' },
  },
  presentations: {
    aggregation: { $sum: '$data.presentations.total' },
  },
  contactToPresentationRate: {
    compute: row =>
      row.contacts > 0 ? Number(((row.presentations / row.contacts) * 100).toFixed(2)) : 0,
    dependsOn: ['presentations', 'contacts'],
  },
  presentationToCloseRate: {
    compute: row =>
      row.presentations > 0 ? Number(((row.sales / row.presentations) * 100).toFixed(2)) : 0,
    dependsOn: ['presentations', 'sales'],
  },
  contactToCloseRate: {
    compute: row => (row.contacts > 0 ? Number(((row.sales / row.contacts) * 100).toFixed(2)) : 0),
    dependsOn: ['contacts', 'sales'],
  },
  manualDials: {
    aggregation: { $sum: '$data.dials.manual' },
  },
  inboundDials: {
    aggregation: { $sum: '$data.dials.inbound' },
  },
}

export const AGENT_CHARTS = { ...BASE_CHARTS }
export const AGENT_CHART_ORDER = Object.keys(AGENT_CHARTS)
export const COMPANY_CHARTS = {
  ...BASE_CHARTS,

  // activeAgents: {
  //   aggregation: { $sum: '$data.agents.total' },
  // },
}
export const COMPANY_CHART_ORDER = Object.keys(COMPANY_CHARTS)
