# Migration Guide: KV to D1

This guide helps you migrate from Cloudflare KV to D1 database.

## Why Migrate?

| Feature | KV (Old) | D1 (New) |
|---------|----------|----------|
| Free tier reads | 100k/day | 5M/day |
| Free tier writes | 1k/day | 100k/day |
| Storage | 1GB | 5GB |
| Query capability | Key-value only | Full SQL |
| Cost after free | $0.50/month | Free tier sufficient |

**Benefits:**
- ✅ 50x more free reads
- ✅ 100x more free writes  
- ✅ 5x more storage
- ✅ Better querying with SQL
- ✅ Completely free for our use case

## Migration Steps

### 1. No Data Migration Needed

Since chess rooms are temporary (1 hour TTL), there's no need to migrate existing data. Simply:

1. Deploy the new version with D1
2. Old rooms in KV will expire naturally
3. New rooms will use D1

### 2. Setup D1

```bash
# Create D1 database
wrangler d1 create catchess-db

# Note the database_id from output
```

### 3. Update wrangler.toml

**Remove or comment out KV configuration:**

```toml
# OLD - Remove or comment out
# [[kv_namespaces]]
# binding = "CHESS_ROOMS"
# id = "your-kv-namespace-id"
# preview_id = "your-preview-kv-namespace-id"
```

**Add D1 configuration:**

```toml
# NEW - Add this
[[d1_databases]]
binding = "DB"
database_name = "catchess-db"
database_id = "your-actual-database-id"  # From step 2
```

### 4. Initialize Database Schema

```bash
wrangler d1 execute catchess-db --file=./schema.sql
```

### 5. Deploy

```bash
# Build frontend
cd frontend && npm run build && cd ..

# Deploy worker with D1
wrangler deploy
```

### 6. Verify

Test room creation and joining:

```bash
# Create a room
curl https://your-worker.workers.dev/api/rooms/create

# Verify in D1
wrangler d1 execute catchess-db --command="SELECT * FROM chess_rooms"
```

## Code Changes Summary

The worker code has been updated to use D1 SQL queries instead of KV operations:

**Before (KV):**
```javascript
// Get
const roomData = await env.CHESS_ROOMS.get(roomId);

// Put
await env.CHESS_ROOMS.put(roomId, JSON.stringify(data), { 
  expirationTtl: 3600 
});
```

**After (D1):**
```javascript
// Get
const result = await env.DB.prepare(
  'SELECT * FROM chess_rooms WHERE id = ?'
).bind(roomId).first();

// Insert
await env.DB.prepare(
  'INSERT INTO chess_rooms (id, players, game_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
).bind(roomId, JSON.stringify([]), null, now, now).run();

// Update
await env.DB.prepare(
  'UPDATE chess_rooms SET players = ?, updated_at = ? WHERE id = ?'
).bind(JSON.stringify(players), Date.now(), roomId).run();
```

## Cleanup Old KV Namespace (Optional)

After successful migration, you can delete the old KV namespace:

```bash
# List your namespaces
wrangler kv:namespace list

# Delete the namespace
wrangler kv:namespace delete --namespace-id=<your-namespace-id>
```

**Note:** This is optional. If you leave it, it will just sit unused (free tier).

## Local Development

The local backend server (`npm run dev:backend`) uses in-memory storage and is unaffected by this change. It continues to work the same way.

For testing the Worker locally:

```bash
# Uses local D1 (SQLite) automatically
wrangler dev
```

## Rollback (If Needed)

If you need to rollback to KV:

1. Keep your KV namespace (don't delete it)
2. Revert `wrangler.toml` changes
3. Revert `workers/chess-api.js` to use KV
4. Deploy: `wrangler deploy`

## Support

- See [D1_SETUP.md](./D1_SETUP.md) for detailed D1 configuration
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- Check [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)

---

**Migration completed! Enjoy the improved free tier limits! 🎉**
