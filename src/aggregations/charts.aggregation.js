export function buildAgentTimeSeriesPipeline({
  agentName,
  charts, // array of chart configs
  interval,
  startDate,
  endDate,
}) {
  // Step 1: build the group stage dynamically
  const groupFields = charts.reduce((acc, [chartName, props]) => {
    if (props.aggregation) {
      acc[chartName] = props.aggregation
    }
    return acc
  }, {})

  return [
    { $match: { agentName } },
    {
      $addFields: {
        businessDateAsDate: {
          $dateFromString: {
            dateString: '$businessDate',
            format: '%Y%m%d',
          },
        },
      },
    },
    {
      $match: {
        businessDateAsDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: '$businessDateAsDate',
            unit: interval,
            startOfWeek: interval === 'week' ? 'Mon' : undefined,
          },
        },
        ...groupFields,
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { date: '$_id', format: '%Y-%m-%d' } },
        ...charts.reduce((acc, [chartName]) => {
          acc[chartName] = 1
          return acc
        }, {}),
      },
    },
    { $sort: { date: 1 } },
  ]
}
