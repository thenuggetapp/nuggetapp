/*
  # Create Email Verification Tokens Table

  1. New Tables
    - `email_verification_tokens`
      - `id` (uuid, primary key) - Unique token ID
      - `user_id` (uuid) - Reference to auth.users
      - `email` (text) - Email address to verify
      - `token` (text, unique) - Verification token
      - `expires_at` (timestamptz) - Token expiration time
      - `used_at` (timestamptz, nullable) - When token was used
      - `created_at` (timestamptz) - When token was created

  2. Security
    - Enable RLS on `email_verification_tokens` table
    - Only service role can insert/update tokens
    - Add index on token for fast lookups
    - Add index on user_id for cleanup queries

  3. Notes
    - Tokens expire after 24 hours
    - Tokens can only be used once
    - Old tokens are automatically cleaned up
*/

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role can manage verification tokens"
  ON email_verification_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token 
  ON email_verification_tokens(token);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id 
  ON email_verification_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at 
  ON email_verification_tokens(expires_at);

-- Function to cleanup expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM email_verification_tokens
  WHERE expires_at < now() - interval '7 days';
END;
$$;