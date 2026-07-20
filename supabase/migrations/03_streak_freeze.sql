-- Migration: Add streak freeze support columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS freeze_tokens integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_freeze_granted timestamp with time zone;
