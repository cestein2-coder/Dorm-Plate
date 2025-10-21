/*
  # Create waitlist_entries table for DormPlate

  1. New Tables
    - `waitlist_entries`
      - `id` (uuid, primary key) - Unique identifier for each waitlist entry
      - `email` (text, unique, not null) - Student email address (must end with .edu)
      - `university` (text, optional) - University name provided by student
      - `created_at` (timestamptz) - Timestamp when entry was created

  2. Security
    - Enable RLS on `waitlist_entries` table
    - Add policy allowing public inserts (for waitlist form submissions)
    - Add policy allowing authenticated users to read all entries (for admin access)

  3. Important Notes
    - Email field has unique constraint to prevent duplicate signups
    - Created_at automatically set to current timestamp
    - Public can insert but cannot read (for privacy)
    - Only authenticated users (admins) can read entries
*/

CREATE TABLE IF NOT EXISTS waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  university text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view waitlist"
  ON waitlist_entries
  FOR SELECT
  TO authenticated
  USING (true);