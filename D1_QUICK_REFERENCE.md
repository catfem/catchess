# D1 Quick Reference Card

Quick commands for working with Cloudflare D1 in CatChess.

## Setup Commands

```bash
# Create database
wrangler d1 create catchess-db

# Initialize schema
wrangler d1 execute catchess-db --file=./schema.sql

# Deploy worker
wrangler deploy
```

## Query Commands

```bash
# List all rooms
wrangler d1 execute catchess-db --command="SELECT * FROM chess_rooms"

# Count rooms
wrangler d1 execute catchess-db --command="SELECT COUNT(*) as total FROM chess_rooms"

# Find specific room
wrangler d1 execute catchess-db --command="SELECT * FROM chess_rooms WHERE id = 'abc12345'"

# Delete old rooms (> 1 hour)
wrangler d1 execute catchess-db --command="DELETE FROM chess_rooms WHERE created_at < strftime('%s', 'now', '-1 hour') * 1000"

# Clear all rooms
wrangler d1 execute catchess-db --command="DELETE FROM chess_rooms"

# Show table schema
wrangler d1 execute catchess-db --command="PRAGMA table_info(chess_rooms)"
```

## Local Development

```bash
# Start local worker with D1
wrangler dev

# Query local D1
wrangler d1 execute catchess-db --local --command="SELECT * FROM chess_rooms"

# Initialize local schema
wrangler d1 execute catchess-db --local --file=./schema.sql

# Reset local database
rm -rf .wrangler/state/v3/d1/
```

## Database Management

```bash
# List databases
wrangler d1 list

# Get database info
wrangler d1 info catchess-db

# Export database
wrangler d1 export catchess-db --output=backup.sql

# Import database
wrangler d1 execute catchess-db --file=backup.sql
```

## Debugging

```bash
# View worker logs
wrangler tail

# View with filter
wrangler tail --status error

# Test specific endpoint
curl https://your-worker.workers.dev/api/health
curl -X POST https://your-worker.workers.dev/api/rooms/create
```

## Configuration

**wrangler.toml:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "catchess-db"
database_id = "your-database-id-here"
```

**schema.sql structure:**
- `id` - Room ID (TEXT PRIMARY KEY)
- `players` - JSON array of players (TEXT)
- `game_state` - Game state JSON (TEXT)
- `created_at` - Unix timestamp in ms (INTEGER)
- `updated_at` - Unix timestamp in ms (INTEGER)

## Useful SQL Queries

```sql
-- Rooms created in last hour
SELECT * FROM chess_rooms 
WHERE created_at > strftime('%s', 'now', '-1 hour') * 1000;

-- Full rooms (2 players)
SELECT * FROM chess_rooms 
WHERE json_array_length(players) = 2;

-- Empty rooms
SELECT * FROM chess_rooms 
WHERE json_array_length(players) = 0;

-- Rooms by age (oldest first)
SELECT *, (strftime('%s', 'now') * 1000 - created_at) / 1000 as age_seconds
FROM chess_rooms 
ORDER BY created_at ASC;
```

## Free Tier Limits

- **Storage**: 5 GB
- **Reads**: 5,000,000 / day
- **Writes**: 100,000 / day
- **Databases**: 10 per account

## Resources

- [Full D1 Setup Guide](./D1_SETUP.md)
- [Migration Guide](./MIGRATION_KV_TO_D1.md)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [D1 SQL Reference](https://developers.cloudflare.com/d1/platform/client-api/)

---

**Tip:** Bookmark this page for quick reference! 📌
