-- ============================================================
-- Ghost Chat — Database Schema (Phase 1)
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================================

-- 1. DEVICES TABLE
-- Stores anonymous device identities
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY,
  secret_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  public_key TEXT NULL,
  last_seen TIMESTAMPTZ NULL,
  short_code VARCHAR(5) UNIQUE
);

-- 2. MESSAGES TABLE
-- Stores all messages between devices
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  parent_message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL
);

-- Indexes for efficient message queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 3. CONVERSATIONS TABLE
-- Tracks relationships between devices
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  nickname_for_one TEXT NULL,
  nickname_for_two TEXT NULL,
  CONSTRAINT unique_conversation UNIQUE (participant_one, participant_two)
);

-- Index for conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations(participant_one);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations(participant_two);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- Phase 1: Permissive policies using anon key.
-- The API route handlers verify identity via secret code.
-- Phase 2 will add JWT-based claims for stricter RLS.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- DEVICES policies
CREATE POLICY "Allow anonymous device registration"
  ON devices FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow reading own device"
  ON devices FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow updating own device"
  ON devices FOR UPDATE
  TO anon
  USING (true);

-- MESSAGES policies
CREATE POLICY "Allow sending messages"
  ON messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow reading messages"
  ON messages FOR SELECT
  TO anon
  USING (true);

-- CONVERSATIONS policies
CREATE POLICY "Allow creating conversations"
  ON conversations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow reading conversations"
  ON conversations FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- 5. ENABLE REALTIME
-- Required for live message updates
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- 6. MIGRATION FOR EXISTING INSTANCES (Phase 2 Updates)
-- Run these statements manually if your tables are already created:
-- ============================================================
-- ALTER TABLE devices ADD COLUMN IF NOT EXISTS short_code VARCHAR(5) UNIQUE;
-- ALTER TABLE devices ADD CONSTRAINT unique_secret_hash UNIQUE (secret_hash);
-- ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL;
-- ALTER TABLE conversations ADD COLUMN IF NOT EXISTS nickname_for_one TEXT NULL;
-- ALTER TABLE conversations ADD COLUMN IF NOT EXISTS nickname_for_two TEXT NULL;
-- ============================================================
-- Done! Your Ghost Chat database is ready.
-- ============================================================
