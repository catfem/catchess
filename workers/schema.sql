-- CatChess D1 Database Schema
-- Cloudflare D1 (SQLite)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    display_name TEXT,
    avatar_url TEXT,
    oauth_provider TEXT,
    oauth_id TEXT,
    rating_blitz INTEGER DEFAULT 1500,
    rating_rapid INTEGER DEFAULT 1500,
    rating_classical INTEGER DEFAULT 1500,
    rating_puzzle INTEGER DEFAULT 1200,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_drawn INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    is_active BOOLEAN DEFAULT 1,
    is_premium BOOLEAN DEFAULT 0
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rating_blitz ON users(rating_blitz);

-- Games Table
CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    white_player_id TEXT,
    black_player_id TEXT,
    white_rating INTEGER,
    black_rating INTEGER,
    time_control TEXT,
    variant TEXT DEFAULT 'standard',
    result TEXT,
    result_reason TEXT,
    opening_eco TEXT,
    opening_name TEXT,
    pgn TEXT,
    fen_start TEXT,
    fen_final TEXT,
    move_count INTEGER DEFAULT 0,
    white_accuracy REAL,
    black_accuracy REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    ended_at DATETIME,
    is_rated BOOLEAN DEFAULT 1,
    is_analyzed BOOLEAN DEFAULT 0,
    FOREIGN KEY (white_player_id) REFERENCES users(id),
    FOREIGN KEY (black_player_id) REFERENCES users(id)
);

CREATE INDEX idx_games_white_player ON games(white_player_id);
CREATE INDEX idx_games_black_player ON games(black_player_id);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_result ON games(result);

-- Moves Table
CREATE TABLE IF NOT EXISTS moves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    move_number INTEGER NOT NULL,
    color TEXT NOT NULL,
    san TEXT NOT NULL,
    uci TEXT NOT NULL,
    fen_before TEXT NOT NULL,
    fen_after TEXT NOT NULL,
    evaluation REAL,
    mate_in INTEGER,
    best_move TEXT,
    label TEXT,
    time_spent INTEGER,
    clock_white INTEGER,
    clock_black INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX idx_moves_game_id ON moves(game_id);
CREATE INDEX idx_moves_move_number ON moves(move_number);

-- Puzzles Table
CREATE TABLE IF NOT EXISTS puzzles (
    id TEXT PRIMARY KEY,
    fen TEXT NOT NULL,
    moves TEXT NOT NULL,
    rating INTEGER NOT NULL,
    rating_deviation INTEGER,
    popularity INTEGER DEFAULT 0,
    themes TEXT,
    game_url TEXT,
    opening_eco TEXT,
    opening_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

CREATE INDEX idx_puzzles_rating ON puzzles(rating);
CREATE INDEX idx_puzzles_themes ON puzzles(themes);

-- Puzzle Attempts Table
CREATE TABLE IF NOT EXISTS puzzle_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    puzzle_id TEXT NOT NULL,
    solved BOOLEAN NOT NULL,
    time_spent INTEGER,
    moves_made TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
);

CREATE INDEX idx_puzzle_attempts_user ON puzzle_attempts(user_id);
CREATE INDEX idx_puzzle_attempts_puzzle ON puzzle_attempts(puzzle_id);
CREATE INDEX idx_puzzle_attempts_solved ON puzzle_attempts(solved);

-- Openings Table
CREATE TABLE IF NOT EXISTS openings (
    eco TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pgn TEXT NOT NULL,
    fen TEXT NOT NULL,
    moves TEXT NOT NULL,
    popularity INTEGER DEFAULT 0,
    white_win_rate REAL,
    draw_rate REAL,
    black_win_rate REAL,
    description TEXT
);

CREATE INDEX idx_openings_name ON openings(name);
CREATE INDEX idx_openings_popularity ON openings(popularity DESC);

-- Friends Table
CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id),
    UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friends_user ON friends(user_id);
CREATE INDEX idx_friends_status ON friends(status);

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    time_control TEXT NOT NULL,
    format TEXT DEFAULT 'swiss',
    max_players INTEGER,
    current_players INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming',
    start_time DATETIME,
    end_time DATETIME,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_time ON tournaments(start_time);

-- Tournament Participants Table
CREATE TABLE IF NOT EXISTS tournament_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    score REAL DEFAULT 0,
    rank INTEGER,
    games_played INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(tournament_id, user_id)
);

CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_score ON tournament_participants(score DESC);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    requirement TEXT,
    points INTEGER DEFAULT 0
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    event_type TEXT NOT NULL,
    event_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
