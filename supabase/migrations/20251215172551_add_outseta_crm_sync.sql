/*
  # Add Outseta CRM Sync Integration
  
  ## Overview
  Automatically syncs new user signups to Outseta CRM via edge function.
  
  ## Changes
  1. Creates a function to call the Outseta sync edge function
  2. Creates a trigger that fires after user profile creation
  3. Runs asynchronously so it doesn't block signup process
  
  ## Security
  - Uses service role to call edge function
  - Fails silently if Outseta is unavailable
  - Logs errors for monitoring
  
  ## Notes
  - Requires OUTSETA_API_KEY and OUTSETA_SECRET_KEY environment variables
  - Edge function is deployed at /functions/v1/outseta-sync
*/

-- =====================================================================
-- 1. CREATE FUNCTION TO SYNC USER TO OUTSETA
-- =====================================================================

CREATE OR REPLACE FUNCTION public.sync_user_to_outseta()
RETURNS trigger AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  edge_function_url text;
  request_payload jsonb;
BEGIN
  -- Get Supabase configuration from environment
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Build edge function URL
  -- In production, these values are automatically available
  IF supabase_url IS NULL THEN
    supabase_url := TG_ARGV[0]; -- Pass as trigger argument if needed
  END IF;
  
  edge_function_url := supabase_url || '/functions/v1/outseta-sync';
  
  -- Prepare payload for edge function
  request_payload := jsonb_build_object(
    'user_id', NEW.id::text,
    'email', NEW.email,
    'full_name', NEW.full_name,
    'created_at', NEW.created_at::text
  );
  
  -- Make async HTTP request to edge function
  -- Using pg_net extension (if available) or log for manual sync
  BEGIN
    -- Try to use pg_net for async request
    PERFORM net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := request_payload
    );
    
    RAISE NOTICE 'Queued Outseta sync for user %', NEW.email;
  EXCEPTION
    WHEN OTHERS THEN
      -- If pg_net is not available or fails, log the error
      -- This ensures signup still succeeds even if Outseta sync fails
      RAISE WARNING 'Failed to queue Outseta sync for user %: %', NEW.email, SQLERRM;
      
      -- Store failed sync attempt for retry (optional)
      -- You could create a separate table to track failed syncs
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 2. CREATE TRIGGER TO CALL SYNC FUNCTION
-- =====================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_user_profile_created_sync_outseta ON user_profiles;

-- Create trigger that fires AFTER user profile is created
CREATE TRIGGER on_user_profile_created_sync_outseta
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_to_outseta();

-- =====================================================================
-- 3. ADD DOCUMENTATION
-- =====================================================================

COMMENT ON FUNCTION public.sync_user_to_outseta() IS 
'Asynchronously syncs new user signup to Outseta CRM via edge function. Fails silently to prevent blocking signup process.';

COMMENT ON TRIGGER on_user_profile_created_sync_outseta ON user_profiles IS
'Automatically syncs user to Outseta CRM after profile creation';
