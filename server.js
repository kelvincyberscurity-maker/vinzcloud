const express = require('express')
const path = require('path')
const apiRoutes = require('./app/api/route')

const app = express()
const PORT = Number(process.env.PORT || 3000)

app.use(require('cors')())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate')
    }
  }
}))

app.get('/api', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    message: 'VinzCloud API is running',
    endpoints: {
      send: 'POST /api/send-link',
      verify: 'POST /api/verify-link',
      status: 'GET /api/status',
      stats: 'GET /api/stats'
    },
    timestamp: new Date().toISOString()
  })
})

app.use('/api', apiRoutes)

// Vercel menjalankan Express sebagai serverless function.
// Local/VPS tetap bisa memakai npm start seperti biasa.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`server jalan di http://localhost:${PORT}`)
  })
}

module.exports = app
