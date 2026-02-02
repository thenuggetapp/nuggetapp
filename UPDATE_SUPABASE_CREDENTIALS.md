# How to Fix the Supabase Connection Error

## Problem
The Supabase URL `bothvdppmqybygdfoqag.supabase.co` in your `.env` file cannot be resolved. This URL either:
- Never existed
- Has been deleted
- Is from a different/old Supabase project

## Solution

### Step 1: Get Your Correct Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and log in
2. Select your project from the dashboard
3. Click on **Project Settings** (gear icon in sidebar)
4. Click on **API** in the settings menu
5. You'll see two important values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)

### Step 2: Update Your .env File

Open the `.env` file in the project root and update these two lines:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 3: Restart the Development Server

After updating the `.env` file, restart your development server for the changes to take effect.

## How to Test

After updating the credentials:

1. Try signing up again at `/signup`
2. Visit `/diagnostic` to check connection status
3. Check browser console for any remaining errors

## Note About Database Schema

Your database schema is already correctly set up with:
- ✅ user_profiles table with role column
- ✅ handle_new_user trigger function
- ✅ Proper RLS policies
- ✅ All required tables and relationships

The only issue is the connection credentials in the client-side code.
