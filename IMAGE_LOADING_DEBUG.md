# Image Loading Debug Guide

## Current Configuration

The `MoveLabelIcon` component is configured to load images from GitHub:

- **Mode**: `useExternalImage = true`
- **Source**: GitHub user attachments
- **Fallback**: Inline SVG if image fails

## Verify Images Are Loading

### 1. Check Browser Console

When the app runs, you should see console logs:
```
Successfully loaded image for brilliant
Successfully loaded image for best
...
```

If you see:
```
Failed to load image for [label], falling back to SVG
```

This means the image URL is not accessible.

### 2. Test Image URLs Directly

Open these URLs in your browser to verify they work:

**Brilliant:**
https://github.com/user-attachments/assets/1010fb7d-04ff-449c-acd0-cce74e4f2d09

**Best:**
https://github.com/user-attachments/assets/4b59410a-afb2-4151-aeee-7ff83488ddc7

**Excellent (OK):**
https://github.com/user-attachments/assets/284c397f-93d5-41b4-ad45-04d6813de1e2

**Great:**
https://github.com/user-attachments/assets/a41ec3c2-caf6-4113-89c1-d5e89d0b0e11

**Good:**
https://github.com/user-attachments/assets/a9553ea0-7578-44b3-9a93-37d12b8a17ba

**Inaccuracy:**
https://github.com/user-attachments/assets/333ff6f7-35b2-4393-84ed-08a61dfc0961

**Mistake:**
https://github.com/user-attachments/assets/c71870f4-066c-48da-9d86-480a2b212381

**Blunder:**
https://github.com/user-attachments/assets/a1c632f0-30a4-4253-b091-e71db00b007f

**Miss:**
https://github.com/user-attachments/assets/5c6dffa0-fa09-4057-88a2-be9383fab7b7

**Book:**
https://github.com/user-attachments/assets/6bd0c479-ed4b-4594-b629-36873a392f4a

### 3. Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Img"
4. Make a move in the game
5. Look for requests to `github.com/user-attachments/assets/...`

**Success**: Status 200, image loads  
**Failure**: Status 404 or CORS error

## Common Issues

### Issue 1: CORS Errors

**Symptom**: Console shows CORS policy errors  
**Cause**: GitHub may block cross-origin image requests  
**Solution**: Images need to be hosted elsewhere or downloaded locally

### Issue 2: 404 Not Found

**Symptom**: Images show 404 in network tab  
**Cause**: GitHub attachment URLs may expire or be private  
**Solution**: Download images and host locally

### Issue 3: Seeing SVG Instead

**Symptom**: Icons appear but look like simple shapes  
**Cause**: Images failed to load, fallback SVG is showing  
**Check**: Console logs will say "Failed to load image"

## Solutions

### Solution 1: Download and Host Locally

1. Download all 10 images from GitHub
2. Place them in `frontend/public/icons/`
3. Update `imagePaths` to use local paths:

```typescript
const imagePaths: Record<MoveLabel, string> = {
  brilliant: '/icons/brilliant.png',
  best: '/icons/best.png',
  // ... etc
};
```

### Solution 2: Use Different CDN

If GitHub URLs don't work, upload to:
- Imgur
- CloudFlare Images
- Your own server
- Project's public folder

### Solution 3: Use SVG (Current Fallback)

Set `useExternalImage = false` to always use SVG icons:

```typescript
const useExternalImage = false; // Use SVG icons
```

## Testing Steps

### Step 1: Start Dev Server
```bash
cd frontend
npm run dev
```

### Step 2: Open in Browser
```
http://localhost:5173
```

### Step 3: Make a Move

Click and make a chess move.

### Step 4: Observe Badge

Look for the small badge on the destination square.

### Step 5: Check What Shows

**GitHub Images**: 
- High-quality, professional icon
- Colored/detailed design
- Matches the style you uploaded

**SVG Fallback**:
- Simple geometric shapes
- Monochrome (uses CSS color)
- Basic icons

## Current Status

✅ **Code Updated**: Using GitHub URLs  
✅ **Build Passes**: No errors  
✅ **Fallback Ready**: SVG shows if images fail  
⏳ **Testing Needed**: Verify images actually load  

## Next Steps

1. **Run the dev server**
2. **Check browser console** for load messages
3. **Inspect network tab** to see if images are fetched
4. **If images don't load**, download and use local hosting

## Quick Test Command

```bash
# Test if image URLs are accessible
curl -I https://github.com/user-attachments/assets/1010fb7d-04ff-449c-acd0-cce74e4f2d09
```

Should return `HTTP/1.1 200 OK` if accessible.
