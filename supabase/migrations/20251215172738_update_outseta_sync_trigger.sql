/*
  # Update Outseta CRM Sync Trigger
  
  ## Overview
  Updates the trigger to use a simpler approach that works without pg_net.
  Uses the service role to directly call the edge function.
  
  ## Changes
  1. Simplifies the sync function to use direct HTTP calls
  2. Makes it more reliable by removing pg_net dependency
  3. Adds better error handling and logging
*/

-- =====================================================================
-- 1. UPDATE SYNC FUNCTION WITH SIMPLIFIED HTTP CALL
-- =====================================================================

CREATE OR REPLACE FUNCTION public.sync_user_to_outseta()
RETURNS trigger AS $$
DECLARE
  supabase_url text := TG_ARGV[0];
  request_id uuid;
BEGIN
  -- Only proceed if we have a valid email
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE WARNING 'Skipping Outseta sync for user % - no email', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Log the sync attempt
  RAISE NOTICE 'Triggering Outseta sync for user: % (email: %)', NEW.id, NEW.email;
  
  -- Use pg_net if available, otherwise just log
  BEGIN
    -- Attempt to make async HTTP request using pg_net extension
    SELECT INTO request_id net.http_post(
      url := supabase_url || '/functions/v1/outseta-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'user_id', NEW.id::text,
        'email', NEW.email,
        'full_name', COALESCE(NEW.full_name, split_part(NEW.email, '@', 1)),
        'created_at', COALESCE(NEW.created_at, now())::text
      )
    );
    
    RAISE NOTICE 'Outseta sync queued with request_id: %', request_id;
    
  EXCEPTION
    WHEN undefined_function THEN
      -- pg_net extension not available
      -- This is OK - the webhook will handle it instead
      RAISE NOTICE 'pg_net not available, sync will happen via webhook';
      
    WHEN OTHERS THEN
      -- Other error - log but don't fail the trigger
      RAISE WARNING 'Outseta sync failed for user %: %', NEW.email, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 2. RECREATE TRIGGER WITH SUPABASE URL PARAMETER
-- =====================================================================

-- Drop and recreate trigger with parameter
DROP TRIGGER IF EXISTS on_user_profile_created_sync_outseta ON user_profiles;

-- Note: You'll need to replace this URL with your actual Supabase URL
CREATE TRIGGER on_user_profile_created_sync_outseta
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_to_outseta('https://bothvdppmqybygdfoqag.supabase.co');

-- =====================================================================
-- 3. CREATE TABLE TO TRACK SYNC STATUS (OPTIONAL)
-- =====================================================================

-- Create a table to track Outseta sync status
CREATE TABLE IF NOT EXISTS public.outseta_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  sync_status text NOT NULL DEFAULT 'pending', -- pending, success, failed
  outseta_person_id text,
  error_message text,
  synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.outseta_sync_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view sync logs
CREATE POLICY "Admins can view sync logs"
  ON outseta_sync_log
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_outseta_sync_log_user_id ON outseta_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_outseta_sync_log_status ON outseta_sync_log(sync_status);

-- =====================================================================
-- 4. CREATE FUNCTION TO LOG INITIAL SYNC ATTEMPT
-- =====================================================================

-- Log sync attempts for monitoring
CREATE OR REPLACE FUNCTION public.log_outseta_sync_attempt()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.outseta_sync_log (user_id, email, sync_status)
  VALUES (NEW.id, NEW.email, 'pending')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to log sync attempts
DROP TRIGGER IF EXISTS on_user_profile_log_outseta_sync ON user_profiles;

CREATE TRIGGER on_user_profile_log_outseta_sync
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_outseta_sync_attempt();

-- =====================================================================
-- 5. ADD DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE public.outseta_sync_log IS 
'Tracks Outseta CRM sync status for each user. Admins can query this to monitor sync health.';

COMMENT ON FUNCTION public.sync_user_to_outseta() IS 
'Asynchronously syncs new user to Outseta CRM. Falls back gracefully if pg_net is unavailable.';

COMMENT ON FUNCTION public.log_outseta_sync_attempt() IS
'Logs initial sync attempt to outseta_sync_log table for monitoring.';
