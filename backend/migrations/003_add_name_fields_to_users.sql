-- Migration: Add first_name and last_name columns to users table

-- Add first_name column
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

-- Add last_name column
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);