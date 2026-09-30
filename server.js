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
  const now = new Date().toISOString()
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VinzCloud API</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#0b0f14;color:#e8edf3;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:28px}main{max-width:760px;margin:auto}.brand{display:flex;align-items:center;gap:12px;margin-bottom:24px}.dot{width:12px;height:12px;border-radius:50%;background:#22c55e;box-shadow:0 0 16px #22c55e}.title{font-size:26px;font-weight:800}.sub{color:#8e9aaa;font-size:14px;margin-top:3px}.card{background:#111720;border:1px solid #202936;border-radius:16px;padding:20px;margin:14px 0}.status{display:flex;align-items:center;justify-content:space-between}.online{color:#4ade80;font-weight:700}.label{font-size:12px;color:#8995a5;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}.endpoint{display:flex;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid #202936}.endpoint:last-child{border-bottom:0;padding-bottom:0}.method{font-weight:800;font-size:12px;min-width:48px}.path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#cbd5e1;word-break:break-all}.time{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#8793a3;font-size:12px;word-break:break-all}footer{color:#697586;font-size:12px;margin-top:20px;text-align:center}@media(max-width:520px){body{padding:18px}.endpoint{display:block}.method{margin-bottom:5px}.title{font-size:22px}}</style>
</head>
<body>
<main>
  <div class="brand"><span class="dot"></span><div><div class="title">VinzCloud API</div><div class="sub">API service dashboard</div></div></div>
  <section class="card status"><div><div class="label">Status</div><div>Service is running</div></div><div class="online">● ONLINE</div></section>
  <section class="card"><div class="label">Endpoints</div>
    <div class="endpoint"><div><div class="method">POST</div><div class="path">/api/send-link</div></div><div class="sub">API key required</div></div>
    <div class="endpoint"><div><div class="method">POST</div><div class="path">/api/verify-link</div></div><div class="sub">API key required</div></div>
    <div class="endpoint"><div><div class="method">GET</div><div class="path">/api/status</div></div><div class="sub">Public</div></div>
    <div class="endpoint"><div><div class="method">GET</div><div class="path">/api/stats</div></div><div class="sub">Public</div></div>
  </section>
  <section class="card"><div class="label">Server time</div><div class="time">${now}</div></section>
  <footer>VinzCloud API · Apikey ready</footer>
</main>
</body>
</html>`)
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
