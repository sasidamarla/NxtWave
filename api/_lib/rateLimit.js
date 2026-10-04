/**
 * BASIC RATE LIMITING (in-memory, per server instance)
 *
 * How it works: remember how many times each key (usually "endpoint + IP")
 * hit us inside a time window. Over the limit -> reject with 429.
 *
 * HONEST LIMITATION: serverless functions can run as many separate instances,
 * and each has its own memory. So this stops casual spam and accidental
 * double-clicks, but a determined attacker could still slip through.
 * For a real product you'd store counters in Redis/Upstash (shared memory).
 * For a 7-day campaign this is a reasonable trade-off.
 */

const buckets = new Map()

export function rateLimit(key, limit, windowMs) {
  const now = Date.now()

  // Occasional cleanup so the Map can't grow forever.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
  }

  const entry = buckets.get(key)
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count += 1
  return entry.count <= limit
}
