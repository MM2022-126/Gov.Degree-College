import nodemailer from 'nodemailer'

export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function getTransporter() {
  const port = Number(process.env.SMTP_PORT || 587)
  const secure =
    process.env.SMTP_SECURE === 'true' || port === 465

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendEmail(options: {
  to: string
  subject: string
  text: string
  html?: string
}): Promise<{ sent: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    console.log('[mail] SMTP not configured — skipping send:', options.subject, '→', options.to)
    console.log('[mail] body:', options.text)
    return { sent: false, error: 'SMTP not configured' }
  }

  const from =
    process.env.SMTP_FROM ||
    `College Admin <${process.env.SMTP_USER}>`

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text.replace(/\n/g, '<br>'),
    })
    return { sent: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email'
    console.error('[mail] send failed:', message)
    return { sent: false, error: message }
  }
}

export async function sendAdminOtpEmail(to: string, code: string, purpose: 'login' | 'password_change') {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'Government Graduate College Shahdara'
  const action =
    purpose === 'login' ? 'sign in to the admin panel' : 'change your admin password'

  const subject =
    purpose === 'login'
      ? 'Your admin login verification code'
      : 'Your admin password change verification code'

  const text = [
    `Your verification code is: ${code}`,
    '',
    `Use this code to ${action}.`,
    'This code expires in 10 minutes.',
    '',
    'If you did not request this, ignore this email.',
    '',
    site,
  ].join('\n')

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 12px">Admin verification</h2>
      <p style="margin:0 0 16px">Use this code to ${action}:</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:700;margin:0 0 16px">${code}</p>
      <p style="color:#666;margin:0 0 8px">This code expires in <strong>10 minutes</strong>.</p>
      <p style="color:#666;margin:0">If you did not request this, you can ignore this email.</p>
    </div>
  `

  return sendEmail({ to, subject, text, html })
}
