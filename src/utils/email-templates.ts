export function getCourseNotificationTemplate({
  name,
  subject,
  message,
  ctaLink,
  ctaText = "Go to Dashboard",
}: {
  name: string;
  subject: string;
  message: string;
  ctaLink?: string;
  ctaText?: string;
}) {
  const ieeeLogo = "https://ieeevbitsb.in/ieee-vbit-sb.png";
  const svadhyayLogo = "https://ieeevbitsb.in/svadhyay-logo.png";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #334155;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      padding: 48px 20px;
      text-align: center;
      background-color: #ffffff;
      border-bottom: 1px solid #f1f5f9;
    }
    .logo-table {
      margin: 0 auto 32px auto;
    }
    .logo-ieee {
      height: 52px;
      width: auto;
      display: inline-block;
      vertical-align: middle;
      pointer-events: none;
    }
    .logo-divider {
      display: inline-block;
      width: 1px;
      height: 32px;
      background-color: #e2e8f0;
      margin: 0 24px;
      vertical-align: middle;
    }
    .logo-svadhyay {
      height: 72px;
      width: auto;
      display: inline-block;
      vertical-align: middle;
      pointer-events: none;
    }
    .content {
      padding: 40px 48px;
    }
    .greeting {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 16px 0;
    }
    .message {
      font-size: 16px;
      color: #334155;
      margin-bottom: 32px;
      white-space: pre-wrap;
    }
    .cta-container {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 36px;
      background-color: #00629B;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .footer {
      background-color: #f8fafc;
      padding: 32px 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer-links a {
      color: #00629B;
      text-decoration: none;
      margin: 0 10px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <table class="logo-table" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td valign="middle" align="center">
            <img src="${ieeeLogo}" alt="IEEE - VBIT SB" class="logo-ieee" draggable="false" style="pointer-events: none;">
            <div class="logo-divider"></div>
            <img src="${svadhyayLogo}" alt="Svadhyay" class="logo-svadhyay" draggable="false" style="pointer-events: none;">
          </td>
        </tr>
      </table>
      <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 800; margin-top: 8px;">
        IEEE - VBIT SB | Svadhyay - LMS
      </div>
    </div>
    <div class="content">
      <h2 class="greeting">Hello ${name},</h2>
      <div class="message">${message}</div>
      ${ctaLink ? `
      <div class="cta-container">
        <a href="${ctaLink}" class="cta-button">${ctaText}</a>
      </div>
      ` : ""}
      <p style="margin-top: 40px; font-size: 14px; color: #64748b;">
        Best Regards,<br>
        <strong style="color: #0f172a;">IEEE - VBIT SB</strong>
      </p>
    </div>
    <div class="footer">
      <div class="footer-links">
        <a href="https://ieeevbitsb.in">ieeevbitsb.in</a>
        <a href="https://ieeevbitsb.in/contact">Support</a>
      </div>
      <p style="margin-bottom: 12px; opacity: 0.8;">This is an electronically generated email. Please do not reply to this message.</p>
      <p>&copy; ${new Date().getFullYear()} IEEE - VBIT Student Branch. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
