# Google SSO Setup Guide

Google Single Sign-On (SSO) has been added to all authentication pages in the application. Users can now sign in or sign up using their Google account.

## What Was Implemented

### 1. Updated Authentication Context
- Added `signInWithGoogle()` method to the `AuthContext`
- Configures Google OAuth with proper redirect URLs
- Handles authentication state automatically

### 2. Updated Pages with Google SSO
All authentication pages now include a "Continue with Google" button:

- `/app/login/page.tsx` - Login page
- `/app/signup/page.tsx` - Regular signup page
- `/app/local-hero/signup/page.tsx` - Local Hero signup page
- `/app/owner/register/page.tsx` - Owner registration page

### 3. UI Features
- Google logo and branding
- Visual separator between Google and email login options
- Loading states for both Google and email authentication
- Disabled state management to prevent double submissions

## How to Configure Google OAuth in Supabase

To enable Google authentication, you need to configure it in your Supabase project:

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://yourdomain.com`)
7. Add authorized redirect URIs:
   - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
   - Replace `YOUR_SUPABASE_PROJECT_REF` with your actual Supabase project reference

8. Save and copy your Client ID and Client Secret

### Step 2: Configure Supabase

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Find "Google" in the list and click to enable it
5. Enter your Google OAuth credentials:
   - **Client ID**: Paste the Client ID from Google Console
   - **Client Secret**: Paste the Client Secret from Google Console
6. Configure the redirect URL (this is pre-filled by Supabase)
7. Click "Save"

### Step 3: Test the Integration

1. Start your development server
2. Navigate to any login or signup page
3. Click the "Continue with Google" button
4. You should be redirected to Google's OAuth consent screen
5. After authorizing, you'll be redirected back to your app and signed in

## How It Works

1. User clicks "Continue with Google"
2. App calls `signInWithGoogle()` from AuthContext
3. Supabase initiates OAuth flow with Google
4. User authorizes on Google's consent screen
5. Google redirects back to Supabase with authorization code
6. Supabase exchanges code for user information
7. User is created/logged in automatically
8. User is redirected based on their role:
   - Admin → `/admin`
   - Owner → `/owner/dashboard`
   - Local Hero → `/local-hero`
   - Regular User → `/`

## User Profile Creation

When a user signs in with Google for the first time:

1. Supabase creates an `auth.users` record automatically
2. The `user_profiles` trigger creates a matching profile record
3. User's full name and email are populated from Google
4. Default role is set to 'customer'
5. User can be assigned different roles by admins if needed

## Security Notes

- Google OAuth uses industry-standard security protocols
- No passwords are stored for Google SSO users
- Users can't sign in with email/password if they registered with Google (and vice versa)
- The redirect URL must match exactly what's configured in Google Console
- Always use HTTPS in production for OAuth redirects

## Troubleshooting

### "Invalid OAuth redirect URI"
- Check that your redirect URI in Google Console matches exactly: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Ensure there are no trailing slashes

### "OAuth provider not enabled"
- Verify Google provider is enabled in Supabase Dashboard
- Double-check Client ID and Client Secret are correctly entered

### Users redirected to wrong page
- Check the AuthContext redirect logic in `contexts/AuthContext.tsx`
- Verify user profiles are being created with correct roles

### "Access blocked: This app's request is invalid"
- Make sure authorized JavaScript origins are configured in Google Console
- Verify your domain is listed in the authorized origins
