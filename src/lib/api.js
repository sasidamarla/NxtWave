/**
 * Small wrapper around fetch for our own /api endpoints.
 * It does 3 jobs: send JSON, give up after a timeout, and turn every failure
 * into ONE kind of error (ApiError) with a message that is safe to show a student.
 */

export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = null) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export async function postJson(path, body, { timeoutMs = 40000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    let data = null
    try {
      data = await res.json()
    } catch {
      // Server sent something that isn't JSON (e.g. a platform error page).
    }

    if (!res.ok) {
      throw new ApiError(
        data?.error || 'Something went wrong on our side. Please try again.',
        res.status,
        data?.errors || null,
      )
    }
    return data
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err.name === 'AbortError') throw new ApiError('That took too long. Please try again.')
    throw new ApiError('Network problem. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
  }
}

export async function getJson(path, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(path, { signal: controller.signal })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
