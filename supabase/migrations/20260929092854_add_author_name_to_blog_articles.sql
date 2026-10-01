/*
  # Add author_name to Blog Articles

  1. Changes
    - Add `author_name` (text, nullable) to `blog_articles`
    - Lets an article credit a specific writer by name, independent of
      which admin account was logged in when it was created/edited.
      Falls back to the author account's profile name when left blank.
*/

ALTER TABLE blog_articles
  ADD COLUMN IF NOT EXISTS author_name text;
