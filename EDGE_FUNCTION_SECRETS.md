# Storing Google OAuth Credentials for Edge Functions

## Overview

To use Google OAuth credentials in Supabase Edge Functions, you should store them as **Edge Function Secrets** (environment variables), not in the database. This is the secure, recommended approach.

## How to Set Up Edge Function Secrets

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Edge Functions** in the sidebar
4. Click on **Secrets** or **Environment Variables**
5. Add the following secrets:
   - Name: `GOOGLE_CLIENT_ID`
   - Value: Your Google OAuth Client ID

   - Name: `GOOGLE_CLIENT_SECRET`
   - Value: Your Google OAuth Client Secret

6. Click **Save**

### Method 2: Using Supabase CLI

If you're using the Supabase CLI locally, you can set secrets using commands:

```bash
# Set Google Client ID
supabase secrets set GOOGLE_CLIENT_ID=your-client-id-here

# Set Google Client Secret
supabase secrets set GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### Method 3: Using .env File for Local Development

For local development with Edge Functions, create a `.env` file in your `supabase` folder:

```bash
# supabase/.env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

**Important**: Add this file to `.gitignore` to prevent committing secrets!

## Accessing Secrets in Edge Functions

Once configured, you can access these secrets in your Edge Functions using `Deno.env.get()`:

```typescript
// supabase/functions/your-function/index.ts

Deno.serve(async (req: Request) => {
  try {
    // Access the secrets
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    // Validate secrets exist
    if (!googleClientId || !googleClientSecret) {
      return new Response(
        JSON.stringify({ error: 'Google OAuth credentials not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Use the credentials in your logic
    // For example, exchanging auth codes, validating tokens, etc.

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
```

## Built-in Environment Variables

Supabase Edge Functions automatically have access to these environment variables:

- `SUPABASE_URL` - Your project's Supabase URL
- `SUPABASE_ANON_KEY` - Your project's anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your project's service role key (admin access)
- `SUPABASE_DB_URL` - Direct database connection URL

You don't need to configure these manually.

## Security Best Practices

1. **Never commit secrets to version control**
   - Add `.env` files to `.gitignore`
   - Use secret management for production

2. **Use different credentials for different environments**
   - Development credentials for local testing
   - Production credentials for deployed functions

3. **Rotate secrets regularly**
   - Update credentials periodically
   - Revoke old credentials when rotating

4. **Limit secret access**
   - Only add secrets that edge functions actually need
   - Use least-privilege principle

5. **Validate secrets exist**
   - Always check if secrets are available before using them
   - Provide clear error messages when missing

## Example: Google Token Verification Edge Function

Here's a complete example of an Edge Function that uses Google OAuth credentials:

```typescript
// supabase/functions/verify-google-token/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get Google OAuth credentials from environment
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!googleClientId || !googleClientSecret) {
      console.error('Google OAuth credentials not configured');
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Verify token with Google
    const verifyResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );

    if (!verifyResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const tokenInfo = await verifyResponse.json();

    // Verify the token is for your app
    if (tokenInfo.aud !== googleClientId) {
      return new Response(
        JSON.stringify({ error: "Token not for this application" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        user: {
          email: tokenInfo.email,
          name: tokenInfo.name,
          picture: tokenInfo.picture
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
```

## Deploying Functions with Secrets

When deploying edge functions, secrets are automatically available if configured in the dashboard:

```bash
# Deploy the function (secrets are already in Supabase)
supabase functions deploy your-function-name
```

## Troubleshooting

### "Cannot read environment variable"
- Ensure secrets are configured in Supabase Dashboard
- For local development, ensure `.env` file exists in `supabase/` folder
- Restart your local Supabase instance after adding secrets

### Secrets not available in deployed function
- Verify secrets are set in the Supabase Dashboard (not just locally)
- Check the Edge Functions → Secrets section
- Redeploy the function after adding secrets

### Different values in development vs production
- Use different Google OAuth credentials for each environment
- Local `.env` file for development
- Dashboard secrets for production
