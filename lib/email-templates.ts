const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    background-color: #f5f5f5;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 40px;
  }
  .logo {
    text-align: center;
    margin-bottom: 32px;
  }
  .logo-text {
    font-size: 28px;
    font-weight: 700;
    color: #8ec066;
    text-decoration: none;
  }
  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 16px 0;
    text-align: center;
  }
  p {
    font-size: 16px;
    color: #4a4a4a;
    margin: 0 0 16px 0;
  }
  .button-container {
    text-align: center;
    margin: 32px 0;
  }
  .button {
    display: inline-block;
    background-color: #8ec066 !important;
    color: #ffffff !important;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 8px;
    transition: background-color 0.2s;
  }
  .button:hover {
    background-color: #7ab054;
  }
  .link {
    color: #8ec066;
    text-decoration: underline;
    word-break: break-all;
  }
  .footer {
    text-align: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e5e5e5;
  }
  .footer p {
    font-size: 14px;
    color: #737373;
    margin: 0 0 8px 0;
  }
  .small {
    font-size: 13px;
    color: #737373;
  }
  .warning {
    background-color: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 8px;
    padding: 16px;
    margin: 24px 0;
  }
  .warning p {
    color: #92400e;
    margin: 0;
    font-size: 14px;
  }
`;

function wrapInLayout(content: string, previewText: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Nugget</title>
  <style>${baseStyles}</style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">Nugget</span>
      </div>
      ${content}
      <div class="footer">
        <p>Nugget - Family-Friendly Restaurant Discovery</p>
        <p class="small">You're receiving this email because you signed up for Nugget.</p>
        <p class="small">If you didn't request this email, you can safely ignore it.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export function getSignupConfirmationEmail(confirmationLink: string, userName?: string): { html: string; text: string } {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  const html = wrapInLayout(`
    <h1>Welcome to Nugget!</h1>
    <p>${greeting}</p>
    <p>Thanks for signing up! We're excited to help you discover family-friendly restaurants in your area.</p>
    <p>Please click the button below to verify your email address and activate your account:</p>
    <div class="button-container">
      <a href="${confirmationLink}" class="button">Verify Email Address</a>
    </div>
    <p class="small">Or copy and paste this link into your browser:</p>
    <p class="small"><a href="${confirmationLink}" class="link">${confirmationLink}</a></p>
    <div class="warning">
      <p>This link will expire in 24 hours. If it expires, you can request a new verification email from the login page.</p>
    </div>
  `, 'Welcome to Nugget! Please verify your email address.');

  const text = `
Welcome to Nugget!

${greeting}

Thanks for signing up! We're excited to help you discover family-friendly restaurants in your area.

Please click the link below to verify your email address and activate your account:

${confirmationLink}

This link will expire in 24 hours. If it expires, you can request a new verification email from the login page.

---
Nugget - Family-Friendly Restaurant Discovery
You're receiving this email because you signed up for Nugget.
If you didn't request this email, you can safely ignore it.
`;

  return { html, text };
}

export function getPasswordResetEmail(resetLink: string, userName?: string): { html: string; text: string } {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  const html = wrapInLayout(`
    <h1>Reset Your Password</h1>
    <p>${greeting}</p>
    <p>We received a request to reset your password for your Nugget account. Click the button below to create a new password:</p>
    <div class="button-container">
      <a href="${resetLink}" class="button">Reset Password</a>
    </div>
    <p class="small">Or copy and paste this link into your browser:</p>
    <p class="small"><a href="${resetLink}" class="link">${resetLink}</a></p>
    <div class="warning">
      <p>This link will expire in 1 hour for security reasons. If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `, 'Reset your Nugget password');

  const text = `
Reset Your Password

${greeting}

We received a request to reset your password for your Nugget account. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour for security reasons. If you didn't request a password reset, you can safely ignore this email.

---
Nugget - Family-Friendly Restaurant Discovery
You're receiving this email because a password reset was requested for your account.
If you didn't request this, you can safely ignore this email.
`;

  return { html, text };
}

export function getMagicLinkEmail(magicLink: string, userName?: string): { html: string; text: string } {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  const html = wrapInLayout(`
    <h1>Sign In to Nugget</h1>
    <p>${greeting}</p>
    <p>Click the button below to sign in to your Nugget account. No password needed!</p>
    <div class="button-container">
      <a href="${magicLink}" class="button">Sign In to Nugget</a>
    </div>
    <p class="small">Or copy and paste this link into your browser:</p>
    <p class="small"><a href="${magicLink}" class="link">${magicLink}</a></p>
    <div class="warning">
      <p>This link will expire in 10 minutes for security reasons. If you didn't request this email, you can safely ignore it.</p>
    </div>
  `, 'Your Nugget sign-in link');

  const text = `
Sign In to Nugget

${greeting}

Click the link below to sign in to your Nugget account. No password needed!

${magicLink}

This link will expire in 10 minutes for security reasons. If you didn't request this email, you can safely ignore it.

---
Nugget - Family-Friendly Restaurant Discovery
You're receiving this email because a sign-in link was requested for your account.
If you didn't request this, you can safely ignore this email.
`;

  return { html, text };
}

export function getEmailChangeConfirmationEmail(confirmationLink: string, newEmail: string, userName?: string): { html: string; text: string } {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  const html = wrapInLayout(`
    <h1>Confirm Email Change</h1>
    <p>${greeting}</p>
    <p>You requested to change your email address to <strong>${newEmail}</strong>.</p>
    <p>Click the button below to confirm this change:</p>
    <div class="button-container">
      <a href="${confirmationLink}" class="button">Confirm Email Change</a>
    </div>
    <p class="small">Or copy and paste this link into your browser:</p>
    <p class="small"><a href="${confirmationLink}" class="link">${confirmationLink}</a></p>
    <div class="warning">
      <p>If you didn't request this change, please ignore this email and your email address will remain unchanged.</p>
    </div>
  `, 'Confirm your email change');

  const text = `
Confirm Email Change

${greeting}

You requested to change your email address to ${newEmail}.

Click the link below to confirm this change:

${confirmationLink}

If you didn't request this change, please ignore this email and your email address will remain unchanged.

---
Nugget - Family-Friendly Restaurant Discovery
You're receiving this email because an email change was requested for your account.
`;

  return { html, text };
}

export type EmailType = 'signup' | 'password_reset' | 'magic_link' | 'email_change';

export function getEmailTemplate(
  type: EmailType,
  link: string,
  options?: { userName?: string; newEmail?: string }
): { html: string; text: string; subject: string } {
  switch (type) {
    case 'signup':
      return {
        ...getSignupConfirmationEmail(link, options?.userName),
        subject: 'Welcome to Nugget - Verify Your Email',
      };
    case 'password_reset':
      return {
        ...getPasswordResetEmail(link, options?.userName),
        subject: 'Reset Your Nugget Password',
      };
    case 'magic_link':
      return {
        ...getMagicLinkEmail(link, options?.userName),
        subject: 'Sign In to Nugget',
      };
    case 'email_change':
      return {
        ...getEmailChangeConfirmationEmail(link, options?.newEmail || '', options?.userName),
        subject: 'Confirm Your Email Change - Nugget',
      };
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}
