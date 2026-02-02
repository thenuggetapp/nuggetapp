/*
  # Add Missing INSERT Policies for System Operations

  ## Changes Made
  
  1. **Notifications Table**
     - Add INSERT policy for system to create notifications
  
  2. **Restaurant Ownership Table**
     - Fix INSERT policy to allow authenticated users to claim restaurants
  
  ## Security Notes
  - Notifications can be created by the system for any user
  - Restaurant ownership requires authentication
*/

-- Add INSERT policy for notifications (system can create notifications for users)
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix restaurant ownership INSERT policy
DROP POLICY IF EXISTS "Authenticated users can claim restaurants" ON restaurant_ownership;

CREATE POLICY "Authenticated users can claim restaurants"
  ON restaurant_ownership
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);
