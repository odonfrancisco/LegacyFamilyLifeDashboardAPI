const VALID_SKIPS = { 0: 1, 6: 1 }

export function isValidSkipDay({ date: dateStr, skipDays }) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)

  const validSkipArg =
    skipDays &&
    skipDays.split(',').reduce((a, c) => {
      if (VALID_SKIPS[c]) a[c] = 1
      return a
    }, {})

  return VALID_SKIPS[date.getDay()] && validSkipArg && validSkipArg[date.getDay()]
}
