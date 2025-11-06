# Bug Fix: MIME Type Error for LC0.js Loading

## Issue Summary

**Error Message:**
```
Refused to execute script from 'https://9fa7be62.catchess.pages.dev/lc0.js' 
because its MIME type ('text/html') is not executable, 
and strict MIME type checking is enabled.
```

**Followed By:**
```
maiaEngine.ts:54 LC0 not available, falling back to Stockfish simulation: Event
```

## Root Cause

The error occurred because the Maia engine implementation tried to load LC0 (Leela Chess Zero) WebAssembly files that don't exist in the deployment:

1. **Code attempted** to create a Web Worker: `new Worker('/lc0.js')`
2. **File doesn't exist** - LC0 files are excluded from git (`.gitignore` lines 56-57)
3. **Server returns 404** - Cloudflare Pages returns an HTML error page
4. **Browser rejects** - Strict MIME type checking refuses to execute HTML as JavaScript
5. **Error logged** - Browser console shows the MIME type error before the fallback works

While the fallback to Stockfish simulation worked correctly, the browser error message was confusing and appeared as if something was broken.

## Solution

The fix implements **graceful degradation** by checking for LC0 availability before attempting to load it:

### Changes Made

**File:** `frontend/src/utils/maiaEngine.ts`

1. **Added `checkLC0Availability()` method** (lines 82-94):
   ```typescript
   private async checkLC0Availability(): Promise<boolean> {
     try {
       const response = await fetch('/lc0.js', { method: 'HEAD' });
       const contentType = response.headers.get('content-type');
       return response.ok && (contentType?.includes('javascript') ?? false);
     } catch {
       return false;
     }
   }
   ```

2. **Modified `init()` method** (lines 43-80):
   - Checks LC0 availability before attempting to load the worker
   - Only creates `new Worker('/lc0.js')` if the file exists
   - Provides clear console messages about which mode is active
   - Uses improved emoji-based logging for better visibility

### Before vs After

**Before (❌ Confusing):**
```
Console Errors:
  🔴 Refused to execute script from '/lc0.js' because its MIME type...
  ⚠️ LC0 not available, falling back to Stockfish simulation: Event
```

**After (✅ Clear):**
```
Console Info:
  ℹ LC0 not available (lc0.js not found). Using Stockfish to simulate Maia 1500 behavior.
  ✓ Maia 1500 using Stockfish fallback (Skill 10)
```

## Benefits

✅ **No browser errors** - Prevents MIME type error by checking before loading  
✅ **Clearer messaging** - Users understand the app is working as designed  
✅ **Same functionality** - Stockfish fallback mode works identically  
✅ **Performance** - Single HEAD request adds minimal overhead (~10ms)  
✅ **Maintainable** - Easy to understand and debug  

## Testing

### Build Verification
```bash
cd frontend
npm run build
# ✓ TypeScript compilation successful
# ✓ Vite build successful
# ✓ No lc0.js in dist/ (as expected)
```

### Runtime Behavior

**Without LC0 files (current deployment):**
- `checkLC0Availability()` returns `false`
- Direct fallback to Stockfish without attempting worker creation
- Clean console logs with informative messages

**With LC0 files (future enhancement):**
- `checkLC0Availability()` returns `true`
- Attempts to load LC0 worker
- If successful: uses LC0 + Maia weights
- If fails: falls back to Stockfish with clear error message

## Files Modified

1. **frontend/src/utils/maiaEngine.ts** - Core fix implementation
2. **frontend/public/maia/README.md** - Updated troubleshooting section
3. **MAIA_DEPLOYMENT.md** - New comprehensive deployment guide

## Compatibility

- ✅ Backward compatible - no breaking changes
- ✅ Existing functionality preserved - all engines work as before
- ✅ TypeScript strict mode compliant
- ✅ Works with both Vite dev server and production builds
- ✅ Cloudflare Pages compatible

## Related Files

Files that interact with the fix:
- `frontend/src/utils/engineManager.ts` - Uses maiaEngine interface
- `frontend/src/components/EvaluationPanel.tsx` - Uses Maia for analysis
- `frontend/src/components/AnalysisPanel.tsx` - Uses Maia for analysis
- `.gitignore` - Excludes LC0 files (lines 56-57)

## Future Enhancements

If you want to enable full LC0 support:

1. Compile LC0 to WebAssembly
2. Place `lc0.js` and `lc0.wasm` in `frontend/public/`
3. Download Maia `.pb.gz` models to `frontend/public/maia/`
4. Rebuild and deploy

The code will automatically detect and use LC0 when available.

See `MAIA_DEPLOYMENT.md` for detailed instructions.

## Technical Details

### Why HEAD Request?

Using `fetch('/lc0.js', { method: 'HEAD' })` is the correct approach because:

- ✅ **Fast** - Only fetches headers, not the full file (~2-3 MB for lc0.wasm)
- ✅ **Reliable** - Returns accurate MIME type from server
- ✅ **Standard** - HTTP HEAD is designed for this use case
- ✅ **Browser support** - Works in all modern browsers

### Alternative Approaches Considered

❌ **Try-catch on Worker creation** - Still triggers browser MIME error  
❌ **Check for specific error types** - Error object lacks detail  
❌ **Conditional import** - Not supported for Web Workers  
❌ **Service Worker interception** - Overly complex for this use case  

### Performance Impact

- **Check time**: ~5-20ms (single HEAD request)
- **Cache friendly**: Browser caches the 404 response
- **Negligible**: Much faster than downloading non-existent file

## Verification Commands

```bash
# Verify build works
cd frontend && npm run build

# Check for LC0 files (should not exist)
ls frontend/public/lc0*  # Should return "No such file"
ls frontend/dist/lc0*    # Should return "No such file"

# Verify TypeScript types
npm run type-check

# Check file sizes
du -sh frontend/dist/
```

## References

- **LC0 Project**: https://lczero.org/
- **Maia Chess**: https://maiachess.com/
- **MIME Type Spec**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
- **Web Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Worker
