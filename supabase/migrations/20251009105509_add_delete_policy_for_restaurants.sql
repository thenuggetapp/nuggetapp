/*
  # Add DELETE policy for restaurants table

  1. Security Changes
    - Add RLS policy to allow authenticated users to delete restaurants
    - This enables the admin dashboard delete functionality

  This policy allows any authenticated user to delete restaurants from the database.
*/

CREATE POLICY "Authenticated users can delete restaurants"
  ON restaurants
  FOR DELETE
  TO authenticated
  USING (true);
