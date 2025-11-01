# 🎉 What's New: D1 Database Migration

## TL;DR

CatChess now uses **Cloudflare D1** (free SQL database) instead of KV. This gives you:
- ✅ **50x more free reads** (5M/day vs 100k/day)
- ✅ **100x more free writes** (100k/day vs 1k/day)
- ✅ **Full SQL** queries instead of just key-value
- ✅ **Still completely free** for typical use

## What You Need to Do

### For Local Development 
**Nothing!** Just continue using:
```bash
npm run dev
```

The local backend server still works exactly the same way.

### For Cloudflare Workers Deployment

If you want to deploy to Cloudflare, you now need to set up D1 instead of KV:

```bash
# 1. Create D1 database
wrangler d1 create catchess-db

# 2. Copy the database_id and update wrangler.toml

# 3. Initialize the schema
wrangler d1 execute catchess-db --file=./schema.sql

# 4. Deploy
wrangler deploy
```

**Full guide:** See [D1_SETUP.md](./D1_SETUP.md)

## What Changed?

### ✅ Unchanged (Still Works!)
- ✅ Local backend server (`npm run dev:backend`)
- ✅ Frontend code (no changes)
- ✅ API endpoints (same paths)
- ✅ WebSocket connections
- ✅ All game features
- ✅ Local P2P gameplay

### 🔄 Changed (Better!)
- 🔄 Cloudflare Workers now use D1 instead of KV
- 🔄 Room data stored in SQL database
- 🔄 Better querying capabilities
- 🔄 More generous free tier

## Documentation

| Document | Purpose |
|----------|---------|
| **[D1_SETUP.md](./D1_SETUP.md)** | Complete D1 setup guide |
| **[MIGRATION_KV_TO_D1.md](./MIGRATION_KV_TO_D1.md)** | Migrate from KV |
| **[KV_TO_D1_SUMMARY.md](./KV_TO_D1_SUMMARY.md)** | Technical summary |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Updated deployment guide |

## FAQ

### Do I need to migrate existing data?
**No!** Chess rooms are temporary (1 hour expiration). Just deploy the new version and new rooms will use D1.

### Will my local development break?
**No!** Local backend uses in-memory storage and is completely unchanged.

### Is D1 really free?
**Yes!** The free tier includes:
- 5GB storage
- 5M reads/day
- 100k writes/day

This is more than enough for typical use.

### What if I want to rollback to KV?
Easy! Just revert the changes to `wrangler.toml` and `workers/chess-api.js`. See [MIGRATION_KV_TO_D1.md](./MIGRATION_KV_TO_D1.md) for details.

### How do I test locally with D1?
```bash
wrangler dev
```
This automatically creates a local SQLite database.

### Can I query the D1 database?
Yes!
```bash
# List all rooms
wrangler d1 execute catchess-db --command="SELECT * FROM chess_rooms"

# Delete old rooms
wrangler d1 execute catchess-db --command="DELETE FROM chess_rooms WHERE created_at < strftime('%s', 'now', '-1 hour') * 1000"
```

## Need Help?

1. Check **[D1_SETUP.md](./D1_SETUP.md)** for detailed instructions
2. Read the **[Troubleshooting](./D1_SETUP.md#troubleshooting)** section
3. See **[Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)**
4. Open a GitHub issue

---

**Happy coding! ♟️**
