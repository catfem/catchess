-- Cloudflare D1 Schema for CatChess
-- This replaces the KV storage with a free SQL database

CREATE TABLE IF NOT EXISTS chess_rooms (
    id TEXT PRIMARY KEY,
    players TEXT NOT NULL DEFAULT '[]',
    game_state TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Index for efficient cleanup of old rooms
CREATE INDEX IF NOT EXISTS idx_created_at ON chess_rooms(created_at);

-- Auto-cleanup could be done via a scheduled worker
-- Rooms older than 1 hour can be deleted
