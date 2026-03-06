interface AcceptanceEmailParams {
  clubName: string
  clubUrl: string
  magicLinkUrl: string
}

export function buildAcceptanceEmailHtml({ clubName, clubUrl, magicLinkUrl }: AcceptanceEmailParams): string {
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
