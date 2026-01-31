export function buildTimeSeriesPipeline({
  match = {},
  groupBy = null, // 'agentId', 'companyId', or null
  charts, // Chart Object  {chartName, config}
  interval,
  startDate,
  endDate,
}) {
  const chartEntries = Object.entries(charts)
  const chartNames = chartEntries.map(([name]) => name)

  // Build group fields dynamically
  const groupFields = chartEntries.reduce((acc, [chartName, props]) => {
    if (props.aggregation) {
      acc[groupBy ? 'value' : chartName] = props.aggregation
    }
    return acc
  }, {})

  const bucketExpr = {
    $dateTrunc: {
      date: '$businessDate',
      unit: interval,
      startOfWeek: interval === 'week' ? 'Mon' : undefined,
    },
  }

  const pipeline = [
    // 1️⃣ Match
    {
      $match: {
        ...match,
        businessDate: { $gte: startDate, $lte: endDate },
      },
    },

    // 2️⃣ Group by time (and optionally entity)
    {
      $group: groupBy
        ? {
            _id: { bucket: bucketExpr, entityId: `$${groupBy}` },
            name: { $first: groupBy === 'agentId' ? '$agentName' : '$companyName' },
            ...groupFields,
          }
        : {
            _id: bucketExpr,
            ...groupFields,
          },
    },
  ]

  if (groupBy) {
    // 3a️⃣ Build series per entity
    pipeline.push(
      {
        $group: {
          _id: '$_id.entityId',
          entityId: { $first: '$_id.entityId' },
          name: { $first: '$name' },
          series: {
            $push: {
              x: { $dateToString: { date: '$_id.bucket', format: '%Y-%m-%d' } },
              y: { $round: ['$value', 2] },
            },
          },
        },
      },
      {
        $addFields: { series: { $sortArray: { input: '$series', sortBy: { x: 1 } } } },
      },
      { $project: { _id: 0, entityId: 1, name: 1, series: 1 } },
    )
  } else {
    // 3b️⃣ Flatten dynamic charts for compare charts
    pipeline.push(
      {
        $project: {
          _id: 0,
          x: { $dateToString: { date: '$_id', format: '%Y-%m-%d' } },
          values: chartNames.map(name => ({ k: name, v: { $round: [`$${name}`, 2] } })),
        },
      },
      { $unwind: '$values' },
      {
        $group: {
          _id: '$values.k',
          series: { $push: { x: '$x', y: { $ifNull: ['$values.v', 0] } } },
        },
      },
      { $project: { _id: 0, name: '$_id', series: 1 } },
    )
  }

  return pipeline
}
