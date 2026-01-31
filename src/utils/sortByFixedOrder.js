export function sortByFixedOrder(charts, order) {
  const orderMap = new Map(order.map((name, index) => [name, index]))

  return [...charts].sort((a, b) => {
    const aIdx = orderMap.get(a.name) ?? Infinity
    const bIdx = orderMap.get(b.name) ?? Infinity

    return aIdx - bIdx
  })
}
