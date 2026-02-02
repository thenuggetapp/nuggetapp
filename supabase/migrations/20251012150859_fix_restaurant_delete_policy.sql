/*
  # Fix Restaurant Delete Functionality

  ## Problem
  The DELETE policy for the restaurants table is missing, preventing authenticated users from deleting restaurants in the admin dashboard.

  ## Changes
  1. Add DELETE policy for authenticated users on the restaurants table
  2. This policy allows any authenticated user to delete any restaurant (suitable for admin functionality)

  ## Security Notes
  - Policy restricted to authenticated users only
  - In a production environment, you may want to add additional checks for admin roles
  - Foreign key constraints on favorites and reviews tables already have CASCADE rules, so related records will be automatically deleted
*/

-- Add DELETE policy for restaurants table
CREATE POLICY "Authenticated users can delete restaurants"
  ON restaurants
  FOR DELETE
  TO authenticated
  USING (true);
