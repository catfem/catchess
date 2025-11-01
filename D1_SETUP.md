# Cloudflare D1 Database Setup

CatChess now uses **Cloudflare D1** (free SQL database) instead of KV for storing room data. D1 provides better querying capabilities and is completely free.

## What Changed

- ✅ Replaced Cloudflare KV with D1 database
- ✅ Rooms stored in SQLite-compatible SQL database
- ✅ Better query capabilities and data structure
- ✅ Local P2P backend still works independently
- ✅ Free tier includes 5GB storage and 5M reads/day

## Quick Setup

### 1. Create D1 Database

```bash
# Create the database
wrangler d1 create catchess-db
```

You'll receive output like:
```
✅ Successfully created DB 'catchess-db'

[[d1_databases]]
binding = "DB"
database_name = "catchess-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Update wrangler.toml

Copy the `database_id` from the output above and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "catchess-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Your actual database ID
```

### 3. Initialize Database Schema

```bash
# Apply the schema to your D1 database
wrangler d1 execute catchess-db --file=./schema.sql
```

### 4. Deploy

```bash
wrangler deploy
```

## Local Development

For local development, Wrangler automatically creates a local SQLite database:

```bash
# Start local dev server with D1
wrangler dev

# Or use the local backend server (already uses in-memory storage)
npm run dev:backend
```

The local D1 database is stored in `.wrangler/state/v3/d1/`.

## Database Schema

The `chess_rooms` table structure:

```sql
CREATE TABLE chess_rooms (
    id TEXT PRIMARY KEY,           -- Room ID (UUID)
    players TEXT NOT NULL,         -- JSON array of players
    game_state TEXT,               -- JSON game state
    created_at INTEGER NOT NULL,   -- Unix timestamp
    updated_at INTEGER NOT NULL    -- Unix timestamp
);
```

## D1 vs KV Comparison

| Feature | KV | D1 |
|---------|----|----|
| **Type** | Key-Value | SQL Database |
| **Free Tier** | 100k reads/day | 5M reads/day |
| **Storage** | 1GB | 5GB |
| **Queries** | Simple get/put | Full SQL |
| **Cost** | $0.50/month after free | Free tier sufficient |
| **Best For** | Simple storage | Structured data |

## Querying the Database

You can query your D1 database directly:

```bash
# List all rooms
wrangler d1 execute catchess-db --command="SELECT * FROM chess_rooms"

# Delete old rooms (older than 1 hour)
wrangler d1 execute catchess-db --command="DELETE FROM chess_rooms WHERE created_at < $(date -d '1 hour ago' +%s)000"

# Count active rooms
wrangler d1 execute catchess-db --command="SELECT COUNT(*) FROM chess_rooms"
```

## Automatic Cleanup

Rooms are not automatically deleted. To clean up old rooms, you can:

### Option 1: Manual Cleanup

```bash
# Delete rooms older than 1 hour (timestamp in milliseconds)
wrangler d1 execute catchess-db --command="DELETE FROM chess_rooms WHERE created_at < strftime('%s', 'now', '-1 hour') * 1000"
```

### Option 2: Scheduled Worker (Recommended)

Create a scheduled worker that runs periodically:

```javascript
// In wrangler.toml
[triggers]
crons = ["0 * * * *"]  // Run every hour

// In worker
export default {
  async scheduled(event, env, ctx) {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    await env.DB.prepare(
      'DELETE FROM chess_rooms WHERE created_at < ?'
    ).bind(oneHourAgo).run();
  }
}
```

## Troubleshooting

### "binding DB is not defined"

Make sure you've updated the `database_id` in `wrangler.toml` with your actual D1 database ID.

### Local development not working

The local backend server (`backend/src/index.js`) uses in-memory storage and doesn't require D1. It's designed for local P2P play and development.

### Migration from KV

If you were using KV before, no migration is needed as rooms are temporary anyway. Just deploy with D1 configuration and new rooms will use D1.

## Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│  - Local P2P (backend WebSocket)       │
│  - Online P2P (Cloudflare Workers)     │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│   Backend    │      │  Cloudflare      │
│   Server     │      │  Workers         │
│              │      │                  │
│  - WebSocket │      │  - Chess API     │
│  - In-memory │      │  - Durable Obj   │
│  - Local dev │      │  - D1 Database   │
└──────────────┘      └──────────────────┘
```

## Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
