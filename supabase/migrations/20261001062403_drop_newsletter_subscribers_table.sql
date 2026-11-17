/*
  # Drop Newsletter Subscribers Table

  1. Changes
    - Drop `newsletter_subscribers` and its policies/indexes

  Blog newsletter signups now create a real Nugget account (auth.users +
  user_profiles) instead of a separate subscriber record, so this table
  is no longer written to.
*/

DROP TABLE IF EXISTS newsletter_subscribers;
