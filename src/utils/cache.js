import { scheduleJob } from 'node-schedule'

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Where the data will be actually stored
const _cache = {}
// Object storing all the keys that need to be manually deleted after they expired
// in order to avoid memory leaks
const _autoClean = {}

// Utils
const _notUndef = v => v !== undefined
const _identity = v => v

/**
 * Util to change the ttl of an existing key by grabbing its value and resetting it
 *
 * @param {String} key The cache key
 * @param {Number} ttl The new TTL for that cache key
 */
const ttl = (key, ttl) => {
  const v = get(key)
  set(key, v, ttl)
}

/**
 * Deletes an entry from the cache
 *
 * @param {String} key The cache key
 */
const del = key => {
  const v = _cache[key]
  delete _cache[key]

  if (v && v.cleanTs && _autoClean[v.cleanTs]) {
    delete _autoClean[v.cleanTs][key]
  }
}

/**
 * Gets an entry from the cache, and clear it if it's expired
 *
 * @param {String} key The cache key
 * @param {Boolean} full Returns the expire value in addition to the value
 * @param {Object} defaultValue If the key is not present, returns that value instead
 * @param {Boolean} clear Clear the entry from the cache after grabbing it
 * @param {Boolean} refresh If accessed, the TTL will be refreshed
 */
const get = (
  key,
  { refresh = false, full = false, defaultValue = undefined, clear = false } = {},
) => {
  const v = _cache[key]
  if (v === undefined) return defaultValue
  if (v === null || (v.expire && v.expire < Date.now())) {
    del(key)
    return defaultValue
  }

  if (refresh && v.ttl) set(key, v.value, v.ttl)
  if (clear) del(key)
  if (full) return v

  return v.value
}

/**
 * Creates a new cache entry
 *
 * @param {String} key The cache key
 * @param {Object} value The value that will be cached
 * @param {Number} ttl Optional TTL for that cache key
 */
const set = (key, value, ttl) => {
  if (!key) return

  const expire = ttl && Date.now() + ttl
  const cleanTs = expire && new Date(expire).setMinutes(new Date(expire).getMinutes() + 1, 0, 0)

  const prev = get(key, { full: true })
  if (prev && _autoClean[prev.cleanTs]) {
    delete _autoClean[prev.cleanTs][key]
  }

  if (cleanTs) {
    if (!_autoClean[cleanTs]) _autoClean[cleanTs] = {}
    _autoClean[cleanTs][key] = 1
  }

  _cache[key] = {
    value,
    ttl,
    ...(expire && { expire }),
    ...(cleanTs && { cleanTs }),
  }
}

/**
 * Allows to set a key based on an updator function that gets passed the current value
 *
 * @param {String} key The cache key
 * @param {Function} f The function which return value will be cached
 * @param {Number} ttl Optional TTL for that cache key
 * @param {Object} ops Options passed down to get
 */
const update = (key, updator, ttl, opts) => {
  const prev = get(key, opts)
  const value = updator(prev)
  set(key, value, ttl)
  return value
}

/**
 * Allows to pass an asynchronous function and cache its return value for a specified TTL
 *
 * @param {String} key The cache key
 * @param {Function} f The async function which resolved value will be cached
 * @param [Number] ttl TTL for that cache key
 * @param {Object} ops Options passed down to get
 */
const fn = async (key, f, ttl, opts) => {
  const cached = get(key, opts)
  if (_notUndef(cached)) return cached

  const value = await f()

  set(key, value, ttl)
  return value
}

/**
 * Same as fn, but ensures that the async function will never be called more than
 * once, aka safe to call in a Promise.all or similar.
 *
 * @param {String} key The cache key
 * @param {Function} f The async function which resolve value will be cached
 * @param {Number} ttl Optional TTL for that cache key
 * @param {Object} ops Options passed down to get
 */
const fnLimit = async (key, f, ttl, opts) => {
  const cached = get(key, opts)
  if (_notUndef(cached)) return cached

  if (get(`processing-${key}`)) {
    await sleep(250)
    return fnLimit(key, f, ttl)
  }

  set(`processing-${key}`, true)
  const res = await fn(key, f, ttl)
  del(`processing-${key}`)

  return res
}

/**
 * Wait for a key to be in the cache and retries before returning its value
 *
 * @param {String} key The cache key to wait for
 * @param {Function} check An optional function to validate the cached value, defaults to a truthy check
 * @param {Function} transform An optional function to transform the cached value, defaults to identity
 * @param {Number} ms The amount of miliseconds to wait for before a retry
 */
const wait = async (key, { check = _notUndef, transform = _identity, ms = 250 } = {}, opts) => {
  const cached = transform(get(key, opts))
  if (check(cached)) return cached

  await sleep(ms)
  return wait(key, { check, transform, ms })
}

/**
 * Every minute, clean the expired keys that are still there
 */
scheduleJob('0 * * * * *', () => {
  const now = Date.now()
  const ts = new Date(now).setSeconds(0, 0)
  if (!_autoClean[ts]) return

  for (const key of Object.keys(_autoClean[ts])) {
    del(key)
  }

  delete _autoClean[ts]
})

export default {
  get,
  set,
  del,
  update,
  ttl,

  fn,
  fnLimit,

  wait,
}
