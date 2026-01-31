function indexByName(seriesArr) {
  return seriesArr.reduce((acc, s) => {
    acc[s.name] = s
    return acc
  }, {})
}

export function computeSeries({ series, charts }) {
  const byName = indexByName(series)

  for (const [chartName, props] of Object.entries(charts)) {
    if (!props.compute) continue

    const sources = props.dependsOn.map(name => byName[name])
    if (sources.some(Boolean) === false) continue

    // assume all series share the same x domain (true after fillSeries)
    const computedSeries = sources[0].series.map((point, i) => {
      const row = {}

      props.dependsOn.forEach(dep => {
        row[dep] = byName[dep].series[i]?.y ?? 0
      })

      return {
        x: point.x,
        y: props.compute(row),
      }
    })

    const computedChart = {
      name: chartName,
      series: computedSeries,
    }

    byName[chartName] = computedChart
  }

  return Object.values(byName)
}
