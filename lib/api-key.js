const crypto = require('crypto')

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const aa = Buffer.from(a)
  const bb = Buffer.from(b)
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb)
}

function getProvidedKey(req) {
  const header = req.get('x-api-key')
  if (header) return header.trim()

  const auth = req.get('authorization') || ''
  if (/^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '').trim()

  return ''
}

// The bundled web UI is same-origin, so it can continue working without exposing
// the API secret in public/index.html. Non-browser/external clients must use the key.
function isSameOriginUi(req) {
  const origin = req.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host === req.get('host')
  } catch {
    return false
  }
}

function requireApiKey(expectedKey, name) {
  return (req, res, next) => {
    if (isSameOriginUi(req)) return next()

    const provided = getProvidedKey(req)
    if (!expectedKey || !safeEqual(provided, expectedKey)) {
      return res.status(401).json({
        success: false,
        message: 'API key tidak valid atau tidak dikirim.',
        error: 'INVALID_API_KEY',
        endpoint: name
      })
    }
    next()
  }
}

module.exports = { requireApiKey }
