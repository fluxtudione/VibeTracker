-- Migration: Add reminder fields to habits table
-- Purpose: Support Smart Reminders (Phase 1: UX Foundations, Task 1)
--
-- Run this migration in Supabase SQL Editor or via supabase CLI:
--   supabase db push
--   OR: psql -h <host> -U <user> -d <db> -f supabase/migrations/20250101_add_reminder_fields.sql

BEGIN;

-- Add reminder_enabled column (boolean, defaults to false)
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false;

-- Add reminder_time column (stores time in HH:MM:SS format, e.g. '08:30:00')
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT NULL;

COMMIT;

-- Verification
-- SELECT id, name, reminder_enabled, reminder_time FROM public.habits LIMIT 5;
