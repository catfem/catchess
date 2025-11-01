# KV Namespace Configuration Fix

## Problem
When attempting to deploy the CatChess worker, you may have encountered this error:
```
KV namespace 'your-kv-namespace-id' is not valid. [code: 10042]
```

## Solution
The KV namespace configuration in `wrangler.toml` has been commented out to allow deployment without requiring KV setup upfront.

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
