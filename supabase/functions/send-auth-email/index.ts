import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "hello@thenugget.app";
const FROM_NAME = "Nugget";

console.log('[Edge Function] 🚀 Function loaded');
console.log('[Edge Function] 📧 FROM_EMAIL:', FROM_EMAIL);
console.log('[Edge Function] 🔑 Has RESEND_API_KEY:', !!RESEND_API_KEY);

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
    background-color: #8ec066;
    color: #ffffff !important;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 8px;
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

function getSignupConfirmationEmail(confirmationLink: string, userName?: string): { html: string; text: string; subject: string } {
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

  const text = `Welcome to Nugget!\n\n${greeting}\n\nThanks for signing up! We're excited to help you discover family-friendly restaurants in your area.\n\nPlease click the link below to verify your email address and activate your account:\n\n${confirmationLink}\n\nThis link will expire in 24 hours.`;

  return { html, text, subject: 'Welcome to Nugget - Verify Your Email' };
}

function getPasswordResetEmail(resetLink: string, userName?: string): { html: string; text: string; subject: string } {
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

  const text = `Reset Your Password\n\n${greeting}\n\nWe received a request to reset your password for your Nugget account.\n\n${resetLink}\n\nThis link will expire in 1 hour.`;

  return { html, text, subject: 'Reset Your Nugget Password' };
}

function getMagicLinkEmail(magicLink: string, userName?: string): { html: string; text: string; subject: string } {
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
      <p>This link will expire in 10 minutes for security reasons.</p>
    </div>
  `, 'Your Nugget sign-in link');

  const text = `Sign In to Nugget\n\n${greeting}\n\nClick the link below to sign in:\n\n${magicLink}\n\nThis link will expire in 10 minutes.`;

  return { html, text, subject: 'Sign In to Nugget' };
}

function getEmailChangeEmail(confirmationLink: string, newEmail: string, userName?: string): { html: string; text: string; subject: string } {
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
      <p>If you didn't request this change, please ignore this email.</p>
    </div>
  `, 'Confirm your email change');

  const text = `Confirm Email Change\n\n${greeting}\n\nYou requested to change your email to ${newEmail}.\n\n${confirmationLink}`;

  return { html, text, subject: 'Confirm Your Email Change - Nugget' };
}

interface EmailPayload {
  type: 'signup' | 'password_reset' | 'magic_link' | 'email_change';
  to: string;
  link: string;
  userName?: string;
  newEmail?: string;
}

async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string; id?: string }> {
  console.log('[Edge Function] 📧 sendEmail called');
  console.log('[Edge Function] 📧 Payload:', { ...payload, link: payload.link.substring(0, 50) + '...' });

  if (!RESEND_API_KEY) {
    console.error('[Edge Function] ❌ RESEND_API_KEY not configured!');
    console.error('[Edge Function] ❌ Available env vars:', Object.keys(Deno.env.toObject()));
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  console.log('[Edge Function] ✅ RESEND_API_KEY is configured');

  let emailContent: { html: string; text: string; subject: string };

  console.log('[Edge Function] 📧 Email type:', payload.type);

  switch (payload.type) {
    case 'signup':
      emailContent = getSignupConfirmationEmail(payload.link, payload.userName);
      break;
    case 'password_reset':
      emailContent = getPasswordResetEmail(payload.link, payload.userName);
      break;
    case 'magic_link':
      emailContent = getMagicLinkEmail(payload.link, payload.userName);
      break;
    case 'email_change':
      emailContent = getEmailChangeEmail(payload.link, payload.newEmail || '', payload.userName);
      break;
    default:
      console.error('[Edge Function] ❌ Unknown email type:', payload.type);
      return { success: false, error: `Unknown email type: ${payload.type}` };
  }

  console.log('[Edge Function] ✅ Email content generated');
  console.log('[Edge Function] 📧 Subject:', emailContent.subject);
  console.log('[Edge Function] 📧 To:', payload.to);
  console.log('[Edge Function] 📧 From:', `${FROM_NAME} <${FROM_EMAIL}>`);

  try {
    console.log('[Edge Function] 🚀 Calling Resend API...');

    const resendPayload = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [payload.to],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    console.log('[Edge Function] 📦 Resend payload:', {
      from: resendPayload.from,
      to: resendPayload.to,
      subject: resendPayload.subject,
      hasHtml: !!resendPayload.html,
      hasText: !!resendPayload.text,
    });

    const fetchStart = Date.now();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    });
    const fetchDuration = Date.now() - fetchStart;

    console.log('[Edge Function] ⏱️ Resend API response time:', fetchDuration, 'ms');
    console.log('[Edge Function] 📊 Response status:', response.status);
    console.log('[Edge Function] 📊 Response ok:', response.ok);

    const data = await response.json();
    console.log('[Edge Function] 📊 Response data:', data);

    if (!response.ok) {
      console.error('[Edge Function] ❌ Resend API error:', data);
      console.error('[Edge Function] ❌ Status:', response.status);
      console.error('[Edge Function] ❌ Status Text:', response.statusText);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log('[Edge Function] ✅ Email sent successfully via Resend!');
    console.log('[Edge Function] ✅ Email ID:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('[Edge Function] ❌ Fatal error sending email:', error);
    console.error('[Edge Function] ❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Edge Function] ❌ Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Edge Function] ❌ Error stack:', error instanceof Error ? error.stack : 'N/A');
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

Deno.serve(async (req: Request) => {
  console.log('\n' + '='.repeat(80));
  console.log('[Edge Function] 📨 REQUEST RECEIVED');
  console.log('='.repeat(80));
  console.log('[Edge Function] 🌐 Method:', req.method);
  console.log('[Edge Function] 🌐 URL:', req.url);
  console.log('[Edge Function] 🌐 Headers:', Object.fromEntries(req.headers.entries()));

  try {
    if (req.method === 'OPTIONS') {
      console.log('[Edge Function] ℹ️ OPTIONS request - returning CORS headers');
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      console.error('[Edge Function] ❌ Invalid method:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Edge Function] 📦 Parsing request body...');
    const payload: EmailPayload = await req.json();
    console.log('[Edge Function] 📦 Request payload received:', {
      type: payload.type,
      to: payload.to,
      hasLink: !!payload.link,
      userName: payload.userName,
      newEmail: payload.newEmail,
    });

    if (!payload.type || !payload.to || !payload.link) {
      console.error('[Edge Function] ❌ Missing required fields');
      console.error('[Edge Function] ❌ Has type:', !!payload.type);
      console.error('[Edge Function] ❌ Has to:', !!payload.to);
      console.error('[Edge Function] ❌ Has link:', !!payload.link);
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, to, link' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Edge Function] ✅ Validation passed, calling sendEmail...');
    const result = await sendEmail(payload);

    if (!result.success) {
      console.error('[Edge Function] ❌ sendEmail failed:', result.error);
      console.log('='.repeat(80) + '\n');
      return new Response(
        JSON.stringify({ error: result.error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Edge Function] ✅ Email sent successfully!');
    console.log('[Edge Function] ✅ Email ID:', result.id);
    console.log('='.repeat(80) + '\n');

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Edge Function] ❌ Fatal request error:', error);
    console.error('[Edge Function] ❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Edge Function] ❌ Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Edge Function] ❌ Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.log('='.repeat(80) + '\n');
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});