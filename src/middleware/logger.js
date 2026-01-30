export function requestLogger(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start

    console.log(
      `[${new Date().toISOString()}] ` +
        `${req.method} ${req.originalUrl} ` +
        `${res.statusCode} ` +
        `${duration}ms`,
    )
  })

  next()
}

export function errorHandler(err, req, res, next) {
  console.error(`[${req.method} ${req.originalUrl}]`, err)
  res.status(500).json({ error: 'Internal server error' })
}
