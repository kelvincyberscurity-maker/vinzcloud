const express = require('express')
const auth = require('../../../lib/auth')
const { friendlyFirebaseError } = require('../../../lib/errors')
const { requireApiKey } = require('../../../lib/api-key')

const router = express.Router()

router.post('/', requireApiKey(process.env.SEND_API_KEY, 'send-link'), async (req, res) => {
  const { email } = req.body
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ success: false, message: 'email gak valid.' })
  }
  const em = email.trim().toLowerCase()
  const r = await auth.link(em)
  if (!r.ok) {
    return res.status(400).json({ success: false, message: friendlyFirebaseError(r.why), code: r.why })
  }
  return res.json({ success: true, email: em, message: `link dikirim ke ${em}. cek inbox / spam.` })
})

module.exports = router
