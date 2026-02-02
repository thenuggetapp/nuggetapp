export type EmailType = 'signup' | 'password_reset' | 'magic_link' | 'email_change';

interface SendEmailParams {
  type: EmailType;
  email: string;
  link: string;
  userName?: string;
  newEmail?: string;
}

export async function sendAuthEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending auth email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  console.log('[requestPasswordReset] Starting password reset for:', email);

  try {
    console.log('[requestPasswordReset] Calling /api/auth/forgot-password...');
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    console.log('[requestPasswordReset] Response status:', response.status);
    console.log('[requestPasswordReset] Response ok:', response.ok);

    const data = await response.json();
    console.log('[requestPasswordReset] Response data:', JSON.stringify(data, null, 2));

    if (data.debug) {
      console.log('[requestPasswordReset] DEBUG INFO:');
      console.log('  - User found:', data.debug.userFound);
      console.log('  - Token created:', data.debug.tokenCreated);
      console.log('  - Email result:', JSON.stringify(data.debug.emailResult, null, 2));
      console.log('  - Edge function URL:', data.debug.edgeFunctionUrl);
    }

    if (!response.ok) {
      console.error('[requestPasswordReset] Request failed:', data);
      return { success: false, error: data.error || 'Failed to send reset email' };
    }

    console.log('[requestPasswordReset] Success!');
    return { success: true };
  } catch (error) {
    console.error('[requestPasswordReset] Fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
