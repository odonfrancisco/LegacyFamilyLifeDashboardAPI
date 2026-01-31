export function sortByTotalVolumeDesc(charts) {
  return [...charts].sort((a, b) => {
    const totalA = a.series.reduce((sum, p) => sum + p.y, 0)
    const totalB = b.series.reduce((sum, p) => sum + p.y, 0)

    return totalB - totalA
  })
}
