interface AcceptanceEmailParams {
  clubName: string
  clubUrl: string
  magicLinkUrl: string
  operatorMessage?: string
}

export function buildAcceptanceEmailHtml({ clubName, clubUrl, magicLinkUrl, operatorMessage }: AcceptanceEmailParams): string {
  const operatorMessageBlock = operatorMessage
    ? `<div style="background:#f8f9fa;border-left:4px solid #2563eb;padding:16px;margin:24px 0;">
          <p style="margin:0 0 8px;font-weight:600;font-size:15px;color:#18181b;">Message from the platform:</p>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#3f3f46;">${escapeHtml(operatorMessage)}</p>
        </div>`
    : ''
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f4f4f5;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
        <tr><td>
          <h1 style="margin:0 0 16px;font-size:22px;color:#18181b;">Your club site is ready</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            Congratulations! Your application for <strong>${escapeHtml(clubName)}</strong> has been approved.
          </p>
          ${operatorMessageBlock}
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3f3f46;">
            Your club URL:
          </p>
          <p style="margin:0 0 24px;">
            <a href="${escapeHtml(clubUrl)}" style="color:#2563eb;text-decoration:underline;font-size:15px;">${escapeHtml(clubUrl)}</a>
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3f3f46;">
            Click the button below to set your password and enable two-factor authentication.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#18181b;border-radius:6px;padding:12px 24px;">
              <a href="${escapeHtml(magicLinkUrl)}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Set up your account</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
            This link expires in 1 hour. If you did not request this, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface RejectionEmailParams {
  clubName: string
  rejectionReason?: string
}

export function buildRejectionEmailHtml({ clubName, rejectionReason }: RejectionEmailParams): string {
  const explanation = rejectionReason
    ? escapeHtml(rejectionReason)
    : 'After careful review, we were unable to approve your application at this time. Our platform focuses on non-profit clubs engaged in real-world community activities.'

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f4f4f5;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
        <tr><td>
          <h1 style="margin:0 0 16px;font-size:22px;color:#18181b;">Regarding your application</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            Thank you for your interest in joining our platform with <strong>${escapeHtml(clubName)}</strong>.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            ${explanation}
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            If your circumstances change or you believe this decision was made in error, you are welcome to submit a new application.
          </p>
          <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
            Best regards,<br>The Platform Team
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface OperatorMessageEmailParams {
  clubName: string
  message: string
}

export function buildOperatorMessageEmailHtml({ clubName, message }: OperatorMessageEmailParams): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f4f4f5;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
        <tr><td>
          <h1 style="margin:0 0 16px;font-size:22px;color:#18181b;">Message from the platform</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            The following message concerns your club <strong>${escapeHtml(clubName)}</strong>:
          </p>
          <div style="background:#f8f9fa;border-left:4px solid #2563eb;padding:16px;margin:24px 0;">
            <p style="margin:0;font-size:15px;line-height:1.6;color:#3f3f46;">${escapeHtml(message)}</p>
          </div>
          <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
            Best regards,<br>The Platform Team
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface ForceOfflineEmailParams {
  clubName: string
  reason: string
}

export function buildForceOfflineEmailHtml({ clubName, reason }: ForceOfflineEmailParams): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f4f4f5;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
        <tr><td>
          <h1 style="margin:0 0 16px;font-size:22px;color:#18181b;">Your club page has been taken offline</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            Your club page for <strong>${escapeHtml(clubName)}</strong> has been taken offline by the platform team for the following reason:
          </p>
          <div style="background:#f8f9fa;border-left:4px solid #2563eb;padding:16px;margin:24px 0;">
            <p style="margin:0;font-size:15px;line-height:1.6;color:#3f3f46;">${escapeHtml(reason)}</p>
          </div>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            Your page will remain offline until the issue is resolved. Please review the reason above and make any necessary changes. Once the issue is addressed, the platform team will restore your page.
          </p>
          <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
            Best regards,<br>The Platform Team
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
