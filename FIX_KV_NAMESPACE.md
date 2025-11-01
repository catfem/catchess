# ⚠️ DEPRECATED - KV No Longer Used

## This File is Outdated

CatChess now uses **Cloudflare D1** (free SQL database) instead of KV.

Please see:
- **[D1_SETUP.md](./D1_SETUP.md)** for new D1 configuration
- **[MIGRATION_KV_TO_D1.md](./MIGRATION_KV_TO_D1.md)** for migration guide

---

## Old Information (For Reference Only)

## Changes Made
1. **wrangler.toml**: KV namespace configuration is now commented out with clear instructions
2. **DEPLOYMENT.md**: Updated to clarify that KV namespace setup is optional
3. **DEPLOYMENT.md**: Added troubleshooting section for KV namespace errors

## Impact
- ✅ Workers can now be deployed immediately without KV setup
- ✅ Application will function normally (room data just won't persist between deployments)
- ✅ KV storage can be enabled later when needed

## Enabling KV Storage (Optional)

If you want to persist room data, follow these steps:

### 1. Create KV Namespaces
```bash
# Create production namespace
wrangler kv:namespace create "CHESS_ROOMS"

# Create preview namespace  
wrangler kv:namespace create "CHESS_ROOMS" --preview
```

Each command will return a namespace ID like:
```
{ binding = "CHESS_ROOMS", id = "abc123..." }
```

### 2. Update wrangler.toml
Open `wrangler.toml` and uncomment the KV namespace section (around line 20):

```toml
[[kv_namespaces]]
binding = "CHESS_ROOMS"
id = "your-production-namespace-id"
preview_id = "your-preview-namespace-id"
```

Replace `your-production-namespace-id` and `your-preview-namespace-id` with the IDs from step 1.

### 3. Deploy
```bash
wrangler deploy
```

## Technical Details
The chess-api.js worker checks for `env.CHESS_ROOMS` before using it:
```javascript
if (env.CHESS_ROOMS) {
  await env.CHESS_ROOMS.put(roomId, ...);
}
```

This means the application gracefully handles missing KV namespaces and will continue to work without them.
