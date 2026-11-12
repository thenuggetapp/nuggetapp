/*
  # Marketing opt-in

  `user_profiles.marketing_opt_in`: the user agreed to receive marketing tips, feature
  updates, and ways to reach more families. Off unless the user ticks it.
*/

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;
