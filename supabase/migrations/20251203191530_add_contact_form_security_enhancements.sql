/*
  # Contact Form Security Enhancements

  1. Changes
    - Add length constraints to contact_submissions table
    - Create rate_limit_tracking table for spam prevention
    - Add function to check rate limits
    - Add automated cleanup for old archived submissions

  2. New Tables
    - `contact_rate_limits`
      - Tracks submission attempts by IP/fingerprint
      - Automatically cleans up old entries

  3. Security
    - Enforces max field lengths
    - Rate limiting: 3 submissions per hour per identifier
    - Auto-cleanup of rate limit data after 24 hours
    - Auto-cleanup of archived submissions after 90 days
*/

-- Add length constraints to existing contact_submissions table
DO $$
BEGIN
  -- Add check constraints for field lengths
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_name_length'
  ) THEN
    ALTER TABLE contact_submissions
    ADD CONSTRAINT contact_name_length CHECK (length(name) <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_email_length'
  ) THEN
    ALTER TABLE contact_submissions
    ADD CONSTRAINT contact_email_length CHECK (length(email) <= 255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_subject_length'
  ) THEN
    ALTER TABLE contact_submissions
    ADD CONSTRAINT contact_subject_length CHECK (length(subject) <= 200);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_message_length'
  ) THEN
    ALTER TABLE contact_submissions
    ADD CONSTRAINT contact_message_length CHECK (length(message) <= 5000);
  END IF;
END $$;

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS contact_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  submission_count integer DEFAULT 1,
  first_attempt timestamptz DEFAULT now(),
  last_attempt timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow public to check and insert rate limits (needed for form submission)
CREATE POLICY "Anyone can check rate limits"
  ON contact_rate_limits
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert rate limits"
  ON contact_rate_limits
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update rate limits"
  ON contact_rate_limits
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_identifier 
  ON contact_rate_limits(identifier);

CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_last_attempt 
  ON contact_rate_limits(last_attempt);

-- Function to check and enforce rate limits
CREATE OR REPLACE FUNCTION check_contact_rate_limit(
  p_identifier text,
  p_max_attempts integer DEFAULT 3,
  p_window_hours integer DEFAULT 1
)
RETURNS jsonb AS $$
DECLARE
  v_record RECORD;
  v_window_start timestamptz;
  v_allowed boolean;
BEGIN
  v_window_start := now() - (p_window_hours || ' hours')::interval;
  
  -- Get or create rate limit record
  SELECT * INTO v_record
  FROM contact_rate_limits
  WHERE identifier = p_identifier
  AND last_attempt > v_window_start;
  
  IF v_record IS NULL THEN
    -- No recent attempts, allow and create new record
    INSERT INTO contact_rate_limits (identifier, submission_count, first_attempt, last_attempt)
    VALUES (p_identifier, 1, now(), now());
    
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_attempts - 1,
      'reset_at', now() + (p_window_hours || ' hours')::interval
    );
  ELSIF v_record.submission_count >= p_max_attempts THEN
    -- Rate limit exceeded
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reset_at', v_record.first_attempt + (p_window_hours || ' hours')::interval,
      'retry_after', EXTRACT(EPOCH FROM (v_record.first_attempt + (p_window_hours || ' hours')::interval - now()))
    );
  ELSE
    -- Within limits, increment counter
    UPDATE contact_rate_limits
    SET submission_count = submission_count + 1,
        last_attempt = now()
    WHERE id = v_record.id;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_attempts - v_record.submission_count - 1,
      'reset_at', v_record.first_attempt + (p_window_hours || ' hours')::interval
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_contact_rate_limits()
RETURNS integer AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM contact_rate_limits
  WHERE last_attempt < now() - interval '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old archived submissions
CREATE OR REPLACE FUNCTION cleanup_old_contact_submissions()
RETURNS integer AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM contact_submissions
  WHERE status = 'archived'
  AND updated_at < now() - interval '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_contact_rate_limit TO public;
GRANT EXECUTE ON FUNCTION cleanup_old_contact_rate_limits TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_contact_submissions TO authenticated;
