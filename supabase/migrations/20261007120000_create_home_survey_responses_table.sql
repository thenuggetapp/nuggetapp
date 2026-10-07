/*
  # Create Home Survey Responses Table

  1. New Tables
    - `home_survey_responses`
      - `id` (uuid, primary key)
      - `choice` (text, required) - more_restaurants, add_city, deals, parent_reviews, or other
      - `city` (text, optional) - City given for more_restaurants / add_city
      - `email` (text, optional) - Email given to hear when deals launch
      - `other_text` (text, optional) - Free text for "Something else"
      - `page_path` (text, optional) - Page the popup was answered on
      - `user_id` (uuid, optional) - Link to auth.users if user is logged in
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Anyone (anon or authenticated) can insert
    - Only admins can view or delete (JWT check, no database query)
*/

CREATE TABLE IF NOT EXISTS home_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  choice text NOT NULL CHECK (choice IN ('more_restaurants', 'add_city', 'deals', 'parent_reviews', 'other')),
  city text CHECK (char_length(city) <= 120),
  email text CHECK (char_length(email) <= 254),
  other_text text CHECK (char_length(other_text) <= 1000),
  page_path text CHECK (char_length(page_path) <= 300),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE home_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit home survey responses"
  ON home_survey_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view home survey responses"
  ON home_survey_responses
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can delete home survey responses"
  ON home_survey_responses
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_home_survey_responses_created_at ON home_survey_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_home_survey_responses_choice ON home_survey_responses(choice);

GRANT SELECT, INSERT, DELETE ON home_survey_responses TO authenticated;
GRANT INSERT ON home_survey_responses TO anon;
