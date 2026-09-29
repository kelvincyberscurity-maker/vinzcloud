# AM Premium + Catchmail Temp Mail

Temp Mail sekarang memakai Catchmail public API.

## Catchmail API
Base URL:
`https://api.catchmail.io/api/v1`

Mailbox tidak perlu dibuat lewat endpoint khusus. Aplikasi membuat alamat acak lalu membaca inbox dengan:

- `GET /api/v1/mailbox?address=<email>`
- `GET /api/v1/message/<id>?mailbox=<email>`
- `DELETE /api/v1/message/<id>?mailbox=<email>`

Domain yang tersedia di UI:
- `catchmail.io`
- `mailistry.com`
- `zeppost.com`

## Temp Mail UI
- Generate Mail
- Copy Email
- Refresh Inbox tanpa reload
- Auto refresh setiap 6 detik
- Buka email dan baca HTML/plain-text body
- Deteksi link dari email
- Prioritas link `alight-creative.firebaseapp.com`
- Copy Link / Open Link
- Delete mailbox lokal

Frontend punya fallback langsung ke Catchmail apabila endpoint `/api/tempmail/*` pada deployment mengembalikan HTML/non-JSON. Ini mencegah error `Server mengirim response bukan JSON` hanya karena route backend tidak tersedia pada hosting.

Catchmail public API memiliki batas anonymous yang didokumentasikan 1 request/detik/IP, sehingga polling dibuat 6 detik.
