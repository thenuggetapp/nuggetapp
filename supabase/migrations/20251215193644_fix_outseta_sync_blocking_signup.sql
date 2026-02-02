/*
  # Fix Outseta Sync Blocking Signup

  ## Problem
  The Outseta sync trigger is blocking user signups due to:
  1. Missing unique constraint on outseta_sync_log.user_id referenced in ON CONFLICT clause
  2. Trigger errors causing signup failures instead of failing gracefully

  ## Solution
  1. Add unique constraint to outseta_sync_log table
  2. Improve error handling to prevent blocking signups
  3. Make both triggers fail silently so they never block signup

  ## Changes
  - Add unique constraint on user_id in outseta_sync_log
  - Update triggers to use EXCEPTION handlers properly
  - Ensure RETURN NEW happens even if sync fails
*/

-- =====================================================================
-- 1. ADD MISSING UNIQUE CONSTRAINT
-- =====================================================================

-- Add unique constraint that the ON CONFLICT clause expects
ALTER TABLE public.outseta_sync_log
  ADD CONSTRAINT outseta_sync_log_user_id_key UNIQUE (user_id);

-- =====================================================================
-- 2. FIX LOG SYNC ATTEMPT FUNCTION
-- =====================================================================

CREATE OR REPLACE FUNCTION public.log_outseta_sync_attempt()
RETURNS trigger AS $$
BEGIN
  -- Try to log, but never fail the signup if this fails
  BEGIN
    INSERT INTO public.outseta_sync_log (user_id, email, sync_status)
    VALUES (NEW.id, NEW.email, 'pending')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the trigger
      RAISE WARNING 'Failed to log Outseta sync attempt for user %: %', NEW.email, SQLERRM;
  END;

  -- CRITICAL: Always return NEW so the user profile insert succeeds
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 3. FIX MAIN SYNC FUNCTION
-- =====================================================================

CREATE OR REPLACE FUNCTION public.sync_user_to_outseta()
RETURNS trigger AS $$
DECLARE
  supabase_url text := TG_ARGV[0];
  request_id uuid;
BEGIN
  -- CRITICAL: Wrap everything in exception handler so signup never fails
  BEGIN
    -- Only proceed if we have a valid email
    IF NEW.email IS NULL OR NEW.email = '' THEN
      RAISE NOTICE 'Skipping Outseta sync for user % - no email', NEW.id;
      RETURN NEW;
    END IF;

    -- Log the sync attempt
    RAISE NOTICE 'Triggering Outseta sync for user: % (email: %)', NEW.id, NEW.email;

    -- Attempt to make async HTTP request using pg_net extension
    BEGIN
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
        -- pg_net extension not available - this is OK
        RAISE NOTICE 'pg_net not available, Outseta sync skipped (non-critical)';

      WHEN OTHERS THEN
        -- Other error - log but don't fail
        RAISE WARNING 'Outseta sync failed for user %: %', NEW.email, SQLERRM;
    END;

  EXCEPTION
    WHEN OTHERS THEN
      -- Outer exception handler catches ANY error
      RAISE WARNING 'Fatal error in Outseta sync for user %: %', NEW.email, SQLERRM;
  END;

  -- CRITICAL: Always return NEW so the user profile insert succeeds
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 4. ADD DOCUMENTATION
-- =====================================================================

COMMENT ON CONSTRAINT outseta_sync_log_user_id_key ON outseta_sync_log IS
'Ensures each user can only have one sync log entry. Used by ON CONFLICT clause in trigger.';
