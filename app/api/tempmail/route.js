const express = require('express')
const axios = require('axios')
const crypto = require('crypto')

const router = express.Router()
const BASE = 'https://api.catchmail.io/api/v1'
const DOMAINS = ['catchmail.io', 'mailistry.com', 'zeppost.com']

function validAddress(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function newMailbox(domain) {
  const d = DOMAINS.includes(domain) ? domain : 'catchmail.io'
  const local = ('vinz' + crypto.randomBytes(6).toString('hex')).toLowerCase()
  return `${local}@${d}`
}

async function upstream(method, path, params) {
  const r = await axios({
    method,
    url: `${BASE}${path}`,
    params,
    timeout: 15000,
    validateStatus: () => true,
    headers: { Accept: 'application/json', 'User-Agent': 'Vinz-TempMail/1.1' }
  })

  let data = r.data
  if (typeof data === 'string') {
    try { data = JSON.parse(data) } catch (_) {
      const e = new Error(`Catchmail mengembalikan response bukan JSON (HTTP ${r.status}).`)
      e.status = r.status || 502
      throw e
    }
  }

  if (r.status >= 400) {
    const msg = data?.error?.message || data?.message || `Catchmail HTTP ${r.status}`
    const e = new Error(msg)
    e.status = r.status
    throw e
  }
  return data
}

// Generate is local: Catchmail's public API does not have a mailbox-create endpoint.
router.get('/generate', (req, res) => {
  const domain = DOMAINS.includes(String(req.query.domain || '')) ? String(req.query.domain) : 'catchmail.io'
  const email = newMailbox(domain)
  res.setHeader('Cache-Control', 'no-store')
  return res.json({ success: true, email, domain, domains: DOMAINS })
})

router.get('/inbox', async (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase()
  if (!validAddress(email)) return res.status(400).json({ success: false, message: 'Alamat email tidak valid.' })
  try {
    const data = await upstream('GET', '/mailbox', { address: email, page: 1, page_size: 50 })
    return res.json({ success: true, data })
  } catch (e) {
    return res.status(e.status || 502).json({ success: false, message: e.message || 'Catchmail tidak dapat dihubungi.' })
  }
})

router.get('/message', async (req, res) => {
  const id = String(req.query.id || '').trim()
  const mailbox = String(req.query.email || '').trim().toLowerCase()
  if (!id || !validAddress(mailbox)) return res.status(400).json({ success: false, message: 'ID pesan atau mailbox tidak valid.' })
  try {
    const data = await upstream('GET', `/message/${encodeURIComponent(id)}`, { mailbox })
    return res.json({ success: true, data })
  } catch (e) {
    return res.status(e.status || 502).json({ success: false, message: e.message || 'Pesan tidak dapat dibaca.' })
  }
})

router.delete('/message', async (req, res) => {
  const id = String(req.query.id || '').trim()
  const mailbox = String(req.query.email || '').trim().toLowerCase()
  if (!id || !validAddress(mailbox)) return res.status(400).json({ success: false, message: 'ID pesan atau mailbox tidak valid.' })
  try {
    const data = await upstream('DELETE', `/message/${encodeURIComponent(id)}`, { mailbox })
    return res.json({ success: true, data: data || null })
  } catch (e) {
    return res.status(e.status || 502).json({ success: false, message: e.message || 'Pesan gagal dihapus.' })
  }
})

module.exports = router
