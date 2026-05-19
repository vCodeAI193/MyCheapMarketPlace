import nodemailer from 'nodemailer'

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST) return null
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  })
}

export async function sendMail(to: string, subject: string, html: string) {
  const transport = createTransport()
  if (!transport) {
    console.log(`[MAIL] To: ${to} | Subject: ${subject}`)
    return
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@mycheapmarketplace.de',
    to,
    subject,
    html,
  })
}
