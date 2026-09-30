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
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VinzCloud API</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#080b12;color:#eef2ff;min-height:100vh} .wrap{max-width:920px;margin:auto;padding:34px 18px 50px}.brand{display:flex;align-items:center;gap:12px;margin-bottom:28px}.logo{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#6d5dfc,#25c6ff);display:grid;place-items:center;font-weight:900;box-shadow:0 10px 35px #25c6ff25}.brand h1{font-size:22px;margin:0}.brand p{margin:3px 0 0;color:#8f9bb5;font-size:13px}.hero{border:1px solid #20283a;background:linear-gradient(145deg,#111827,#0d111b);border-radius:22px;padding:24px;box-shadow:0 20px 70px #0008}.status{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:#0c241b;border:1px solid #164d35;color:#65e6a4;font-size:13px;font-weight:700}.dot{width:8px;height:8px;border-radius:50%;background:#36df8b;box-shadow:0 0 14px #36df8b}.hero h2{font-size:30px;margin:18px 0 8px}.hero .sub{color:#9aa6bd;margin:0 0 24px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.card{background:#0b101a;border:1px solid #20283a;border-radius:16px;padding:17px}.method{font-size:11px;font-weight:800;letter-spacing:.08em;color:#75a9ff}.path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:7px;font-size:14px;word-break:break-word}.desc{color:#8f9bb5;font-size:12px;margin-top:7px}.footer{margin-top:18px;color:#69758d;font-size:12px;text-align:center}.badge{display:inline-block;margin-top:14px;padding:6px 9px;border-radius:8px;background:#151c2a;color:#9da9c1;font-size:11px}@media(max-width:650px){.wrap{padding:22px 13px 35px}.hero{padding:18px}.hero h2{font-size:25px}.grid{grid-template-columns:1fr}}
</style>
</head>
<body><main class="wrap">
<header class="brand"><div class="logo">V</div><div><h1>VinzCloud API</h1><p>API gateway & service status</p></div></header>
<section class="hero"><span class="status"><span class="dot"></span> API ONLINE</span><h2>Welcome to VinzCloud</h2><p class="sub">Service is running normally. Gunakan endpoint di bawah untuk terhubung dari bot atau aplikasi.</p>
<div class="grid">
<div class="card"><div class="method">POST</div><div class="path">/api/send-link</div><div class="desc">Kirim link verifikasi. Membutuhkan SEND API key.</div></div>
<div class="card"><div class="method">POST</div><div class="path">/api/verify-link</div><div class="desc">Verifikasi link/email. Membutuhkan VERIFY API key.</div></div>
<div class="card"><div class="method">GET</div><div class="path">/api/status</div><div class="desc">Cek status service.</div></div>
<div class="card"><div class="method">GET</div><div class="path">/api/stats</div><div class="desc">Cek statistik service.</div></div>
</div><span class="badge">Server time: ${now}</span></section>
<div class="footer">VinzCloud API • Protected endpoints require API key</div>
</main></body></html>`)
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
