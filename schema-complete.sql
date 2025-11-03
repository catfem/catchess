-- =====================================================
-- Cloudflare D1 Complete Schema for CatChess Platform
-- Production-Grade Chess Platform Database
-- =====================================================

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    country TEXT,
    rating_blitz INTEGER DEFAULT 1200,
    rating_rapid INTEGER DEFAULT 1200,
    rating_classical INTEGER DEFAULT 1200,
    rating_deviation REAL DEFAULT 350.0,
    provisional BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_moderator BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at INTEGER NOT NULL,
    last_active INTEGER NOT NULL,
    verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_rating_blitz ON users(rating_blitz DESC);
CREATE INDEX IF NOT EXISTS idx_users_rating_rapid ON users(rating_rapid DESC);
CREATE INDEX IF NOT EXISTS idx_users_rating_classical ON users(rating_classical DESC);

-- =====================================================
-- GAMES & MATCHES
-- =====================================================

CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    white_id TEXT NOT NULL,
    black_id TEXT NOT NULL,
    white_rating INTEGER,
    black_rating INTEGER,
    result TEXT, -- 1-0, 0-1, 1/2-1/2, *
    termination TEXT, -- normal, time, resignation, abandonment
    pgn TEXT NOT NULL,
    fen_final TEXT,
    time_control TEXT, -- blitz, rapid, classical, custom
    time_base INTEGER, -- seconds
    time_increment INTEGER, -- seconds
    opening_eco TEXT,
    opening_name TEXT,
    move_count INTEGER DEFAULT 0,
    white_accuracy REAL,
    black_accuracy REAL,
    created_at INTEGER NOT NULL,
    started_at INTEGER,
    completed_at INTEGER,
    rated BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (white_id) REFERENCES users(id),
    FOREIGN KEY (black_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_games_white ON games(white_id);
CREATE INDEX IF NOT EXISTS idx_games_black ON games(black_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_completed_at ON games(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_opening ON games(opening_eco);

-- =====================================================
-- GAME MOVES (for detailed analysis)
-- =====================================================

CREATE TABLE IF NOT EXISTS moves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    move_number INTEGER NOT NULL,
    color TEXT NOT NULL, -- w or b
    san TEXT NOT NULL,
    uci TEXT NOT NULL,
    fen TEXT NOT NULL,
    eval REAL,
    mate INTEGER,
    label TEXT, -- brilliant, best, good, inaccuracy, mistake, blunder
    time_spent INTEGER, -- milliseconds
    clock_remaining INTEGER, -- milliseconds
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_moves_game ON moves(game_id);
CREATE INDEX IF NOT EXISTS idx_moves_label ON moves(label);

-- =====================================================
-- ONLINE ROOMS (for matchmaking)
-- =====================================================

CREATE TABLE IF NOT EXISTS chess_rooms (
    id TEXT PRIMARY KEY,
    players TEXT NOT NULL DEFAULT '[]', -- JSON array
    game_state TEXT,
    time_control TEXT,
    rated BOOLEAN DEFAULT FALSE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON chess_rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON chess_rooms(expires_at);

-- =====================================================
-- PUZZLES & TACTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS puzzles (
    id TEXT PRIMARY KEY,
    fen TEXT NOT NULL,
    moves TEXT NOT NULL, -- JSON array of moves (solution)
    rating INTEGER NOT NULL,
    rating_deviation INTEGER DEFAULT 100,
    themes TEXT NOT NULL, -- JSON array: ["fork", "pin", "skewer"]
    popularity INTEGER DEFAULT 0,
    game_url TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_puzzles_rating ON puzzles(rating);
CREATE INDEX IF NOT EXISTS idx_puzzles_themes ON puzzles(themes);

CREATE TABLE IF NOT EXISTS puzzle_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    puzzle_id TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    time_spent INTEGER, -- milliseconds
    attempted_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
);

CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_user ON puzzle_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_puzzle ON puzzle_attempts(puzzle_id);

-- =====================================================
-- TOURNAMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    format TEXT NOT NULL, -- swiss, arena, knockout
    time_control TEXT NOT NULL,
    min_rating INTEGER DEFAULT 0,
    max_rating INTEGER DEFAULT 3000,
    max_players INTEGER,
    entry_fee INTEGER DEFAULT 0,
    prize_pool INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, active, completed, cancelled
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    starts_at INTEGER NOT NULL,
    ends_at INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_starts_at ON tournaments(starts_at);

CREATE TABLE IF NOT EXISTS tournament_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    score REAL DEFAULT 0.0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    joined_at INTEGER NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_score ON tournament_participants(score DESC);

-- =====================================================
-- SOCIAL FEATURES
-- =====================================================

CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, blocked
    created_at INTEGER NOT NULL,
    accepted_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id),
    UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

CREATE TABLE IF NOT EXISTS game_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    move_number INTEGER,
    comment TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    edited_at INTEGER,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_game_comments_game ON game_comments(game_id);

-- =====================================================
-- USER STATISTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY,
    total_games INTEGER DEFAULT 0,
    blitz_wins INTEGER DEFAULT 0,
    blitz_draws INTEGER DEFAULT 0,
    blitz_losses INTEGER DEFAULT 0,
    rapid_wins INTEGER DEFAULT 0,
    rapid_draws INTEGER DEFAULT 0,
    rapid_losses INTEGER DEFAULT 0,
    classical_wins INTEGER DEFAULT 0,
    classical_draws INTEGER DEFAULT 0,
    classical_losses INTEGER DEFAULT 0,
    puzzles_solved INTEGER DEFAULT 0,
    puzzles_failed INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- OPENINGS LIBRARY (ECO codes)
-- =====================================================

CREATE TABLE IF NOT EXISTS openings (
    id TEXT PRIMARY KEY,
    eco TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    fen TEXT NOT NULL,
    moves TEXT NOT NULL,
    category TEXT,
    description TEXT,
    popularity INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_openings_eco ON openings(eco);
CREATE INDEX IF NOT EXISTS idx_openings_category ON openings(category);

-- =====================================================
-- LESSONS & TRAINING
-- =====================================================

CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT, -- beginner, intermediate, advanced
    category TEXT, -- opening, middlegame, endgame, tactics
    content TEXT NOT NULL, -- JSON with positions and annotations
    order_num INTEGER,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    progress INTEGER DEFAULT 0, -- percentage
    completed_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);

-- =====================================================
-- USER SETTINGS & PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    board_theme TEXT DEFAULT 'classic',
    piece_set TEXT DEFAULT 'standard',
    sound_enabled BOOLEAN DEFAULT TRUE,
    sound_volume INTEGER DEFAULT 50,
    auto_queen BOOLEAN DEFAULT FALSE,
    premove_enabled BOOLEAN DEFAULT TRUE,
    show_coordinates BOOLEAN DEFAULT TRUE,
    show_legal_moves BOOLEAN DEFAULT TRUE,
    animation_speed INTEGER DEFAULT 200,
    analysis_enabled BOOLEAN DEFAULT TRUE,
    engine_depth INTEGER DEFAULT 18,
    theme_mode TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- MODERATION & REPORTS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id TEXT NOT NULL,
    reported_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    game_id TEXT,
    status TEXT DEFAULT 'pending', -- pending, reviewed, actioned, dismissed
    created_at INTEGER NOT NULL,
    reviewed_at INTEGER,
    reviewed_by TEXT,
    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (reported_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_id);

CREATE TABLE IF NOT EXISTS moderation_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- warning, mute, ban, unban
    reason TEXT NOT NULL,
    duration INTEGER, -- seconds, NULL for permanent
    created_at INTEGER NOT NULL,
    expires_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (moderator_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_user ON moderation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_expires_at ON moderation_actions(expires_at);

-- =====================================================
-- SESSION MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    last_activity INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

-- =====================================================
-- RATING HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS rating_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    time_control TEXT NOT NULL,
    rating INTEGER NOT NULL,
    deviation REAL NOT NULL,
    game_id TEXT,
    recorded_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE INDEX IF NOT EXISTS idx_rating_history_user ON rating_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_history_recorded_at ON rating_history(recorded_at);

-- =====================================================
-- ACHIEVEMENTS & BADGES
-- =====================================================

CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    requirement TEXT NOT NULL, -- JSON criteria
    points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    earned_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- =====================================================
-- ANALYTICS & LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    event_type TEXT NOT NULL,
    event_data TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
