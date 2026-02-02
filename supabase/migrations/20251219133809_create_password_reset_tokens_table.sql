/*
  # Create Password Reset Tokens Table

  1. New Tables
    - `password_reset_tokens`
      - `id` (uuid, primary key) - Unique token ID
      - `user_id` (uuid) - Reference to auth.users (nullable to prevent email enumeration)
      - `email` (text) - Email address for the reset
      - `token` (text, unique) - Password reset token
      - `expires_at` (timestamptz) - Token expiration time (1 hour)
      - `used_at` (timestamptz, nullable) - When token was used
      - `created_at` (timestamptz) - When token was created

  2. Security
    - Enable RLS on `password_reset_tokens` table
    - Only service role can access this table
    - Add index on token for fast lookups
    - Add index on email for cleanup queries

  3. Notes
    - Tokens expire after 1 hour
    - Tokens can only be used once
    - user_id is nullable to support requests for non-existent emails
*/

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage password reset tokens"
  ON password_reset_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
  ON password_reset_tokens(token);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email 
  ON password_reset_tokens(email);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at 
  ON password_reset_tokens(expires_at);

CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < now() - interval '24 hours';
END;
$$;
