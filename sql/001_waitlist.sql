-- Run in Supabase SQL Editor to create the waitlist table
CREATE TABLE IF NOT EXISTS waitlist_signups (
  email TEXT PRIMARY KEY,
  source TEXT DEFAULT 'bridge-calculator',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
