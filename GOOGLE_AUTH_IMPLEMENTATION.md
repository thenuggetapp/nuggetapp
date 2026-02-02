# Google Authentication Implementation

## Overview

This project implements Google Sign-In using **two complementary approaches**:

1. **Supabase Built-in OAuth** (Primary) - Used in the frontend for simplicity
2. **Custom Edge Function** (Available) - For advanced use cases requiring custom handling

## Current Implementation: Supabase Built-in OAuth

### How It Works

The application currently uses Supabase's native Google OAuth integration:

1. User clicks "Continue with Google" button
2. `signInWithGoogle()` is called from `AuthContext`
3. Supabase redirects to Google's OAuth consent screen
4. User approves the permissions
5. Google redirects back to your app
6. Supabase automatically:
   - Creates the user in `auth.users` table
   - Stores user metadata (name, avatar, email)
   - Creates a session
7. The database trigger (`handle_new_user()`) automatically creates a profile in `user_profiles` table

### User Profile Storage

When a user signs in with Google using Supabase's built-in OAuth:

**Auth Table (`auth.users`):**
- Automatically managed by Supabase
- Stores email, encrypted credentials, metadata

**User Profile Table (`user_profiles`):**
- Automatically created by the `handle_new_user()` trigger
- Populated with:
  - `id` - References auth.users.id
  - `email` - From Google account
  - `full_name` - From Google profile
  - `avatar_url` - From user_metadata (if stored by Supabase)
  - `preferences` - Empty JSON object by default

### Configuration Required

1. **Supabase Dashboard:**
   - Navigate to Authentication → Providers
   - Enable Google provider
   - Add your Google Client ID and Client Secret
   - Set authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`

2. **Google Cloud Console:**
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
   - Add authorized JavaScript origins:
     - `https://your-domain.com`
     - `http://localhost:3000` (for development)

### Advantages of Built-in OAuth

✅ Simple implementation
✅ Automatic user creation
✅ Automatic profile creation via trigger
✅ Built-in session management
✅ No manual token handling
✅ Works with RLS policies automatically

## Alternative: Custom Edge Function

A custom edge function (`google-auth`) is also available for advanced scenarios.

### When to Use the Edge Function

Use the custom edge function when you need:

- Custom user onboarding flows
- Additional validation before account creation
- Integration with external services during signup
- Custom role assignment logic
- Detailed logging of authentication events
- Special handling of user metadata

### How the Edge Function Works

1. Frontend initiates Google OAuth flow manually
2. Google redirects back with authorization code
3. Frontend sends code to edge function
4. Edge function:
   - Exchanges code for access token
   - Fetches user info from Google
   - Creates/updates user in `auth.users`
   - Creates/updates profile in `user_profiles`
   - Generates session token
   - Returns user data

### Using the Edge Function

```typescript
import {
  initiateGoogleSignIn,
  handleGoogleCallback,
  getGoogleAuthCode
} from '@/lib/google-auth';

// 1. Initiate sign-in
const handleGoogleClick = () => {
  initiateGoogleSignIn('/login');
};

// 2. Handle callback on redirect page
useEffect(() => {
  const code = getGoogleAuthCode();
  if (code) {
    handleGoogleCallback(code, '/login')
      .then(response => {
        // response.user contains user data
        // response.profile contains profile data
        // Handle successful authentication
      })
      .catch(error => {
        // Handle error
      });
  }
}, []);
```

### Edge Function Configuration

The edge function requires secrets to be configured in Supabase:

1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Add:
   - `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret

These are **different** from the Google credentials in Authentication → Providers.

### Edge Function Endpoints

**Endpoint:** `https://your-project.supabase.co/functions/v1/google-auth`

**Method:** POST

**Request Body:**
```json
{
  "code": "authorization_code_from_google",
  "redirect_uri": "https://your-domain.com/login"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name",
    "avatar_url": "https://..."
  },
  "profile": { ... },
  "session": { ... },
  "isNewUser": true,
  "message": "Account created successfully"
}
```

## Database Schema

### auth.users (Managed by Supabase)
- `id` - UUID (primary key)
- `email` - User's email
- `encrypted_password` - For email/password auth
- `raw_user_meta_data` - JSON with Google profile data
- `raw_app_meta_data` - JSON for app-level metadata

### user_profiles (Your Application)
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Automatic Profile Creation Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Security Considerations

### Row Level Security (RLS)

Both approaches work with RLS policies:

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can manage profiles (for edge function)
CREATE POLICY "Service role can manage user profiles"
  ON user_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Data Access

- **Built-in OAuth**: Uses authenticated user's token, respects RLS automatically
- **Edge Function**: Uses service role key, bypasses RLS (by design for admin operations)

## Troubleshooting

### "User already registered" Error
- Supabase prevents duplicate emails
- Use the built-in OAuth which handles this automatically
- Or check if user exists before creating in edge function

### Profile Not Created
- Check if `handle_new_user()` trigger exists
- Verify trigger is enabled
- Check Supabase logs for errors
- Ensure RLS policies allow profile creation

### OAuth Redirect Issues
- Verify redirect URIs match in Google Console and Supabase
- Check that domains are authorized
- Ensure HTTPS in production

### Edge Function Not Working
- Verify secrets are configured (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- Check function logs in Supabase Dashboard
- Ensure service role policies exist

## Recommendation

**For most applications, use Supabase's built-in OAuth** (current implementation). It's simpler, more secure, and automatically handles all edge cases.

Only implement the custom edge function if you have specific requirements that the built-in OAuth cannot fulfill.

## Migration Between Approaches

If you want to switch from built-in OAuth to the edge function:

1. Update `AuthContext.tsx` to use `lib/google-auth.ts` functions
2. Configure edge function secrets in Supabase
3. Update redirect URIs in Google Console
4. Test thoroughly in development before deploying

The user data remains compatible between both approaches since they use the same database tables.
