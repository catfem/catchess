# How to Add Icon Images

## Overview

The move label icons can now use external image files instead of inline SVG icons. This allows you to use professional icons from Lichess, Chess.com, or custom designs.

## Setup Steps

### 1. Prepare Your Icon Images

Collect or download 10 icon images for each move label type:

- brilliant (star/sparkle icon)
- best (checkmark icon)
- excellent (checkmark with circle)
- great (dot or exclamation)
- good (simple circle)
- inaccuracy (warning triangle)
- mistake (X mark)
- blunder (double X or skull)
- miss (missed opportunity icon)
- book (book icon)

### 2. Image Specifications

- **Format**: SVG (preferred) or PNG
- **Size**: 24x24 pixels minimum
- **Background**: Transparent
- **Color**: Icons should work on colored backgrounds
  - Black icons for: brilliant, inaccuracy
  - White icons for: best, excellent, great, good, mistake, blunder, miss, book

### 3. Place Images in the Project

Copy your icon files to: `frontend/public/icons/`

Name them exactly as follows:
```
frontend/public/icons/brilliant.svg
frontend/public/icons/best.svg
frontend/public/icons/excellent.svg
frontend/public/icons/great.svg
frontend/public/icons/good.svg
frontend/public/icons/inaccuracy.svg
frontend/public/icons/mistake.svg
frontend/public/icons/blunder.svg
frontend/public/icons/miss.svg
frontend/public/icons/book.svg
```

### 4. Using External URLs (Alternative)

If you want to use hosted images (e.g., from a CDN or GitHub), update the `imagePaths` in `frontend/src/components/MoveLabelIcon.tsx`:

```typescript
const imagePaths: Record<MoveLabel, string> = {
  brilliant: 'https://example.com/icons/brilliant.svg',
  best: 'https://example.com/icons/best.svg',
  // ... etc
};
```

### 5. Enable/Disable Image Mode

In `frontend/src/components/MoveLabelIcon.tsx`, set:

```typescript
const useExternalImage = true;  // Use images
// or
const useExternalImage = false; // Use inline SVG
```

## Current Status

- ✅ Component supports both images and SVG fallback
- ✅ Automatic fallback if image fails to load
- ✅ Works with both local files and external URLs
- ⚠️ **Images not yet added** - Currently using fallback SVG icons

## Fallback Behavior

The component is smart:
1. First tries to load the external image
2. If image fails to load (404, network error, etc.)
3. Automatically falls back to inline SVG icon
4. No errors shown to user

## Testing

After adding images:

1. Build the project: `npm run build`
2. Start dev server: `npm run dev`
3. Make a move in the game
4. Check that the badge shows your custom icon
5. Open browser DevTools → Network tab
6. Verify images are loading from `/icons/` path

## Troubleshooting

### Images not showing?

Check:
- Files are in `frontend/public/icons/`
- Filenames match exactly (case-sensitive)
- Files are accessible (permissions)
- Image format is supported (SVG, PNG)

### Still seeing SVG icons?

Check:
- `useExternalImage` is set to `true`
- Build was recompiled after adding images
- Browser cache cleared (hard refresh: Ctrl+Shift+R)

### Mixed results (some work, some don't)?

Check:
- All 10 icon files are present
- No typos in filenames
- All files are valid image format

## Example: Adding Lichess-Style Icons

If you want to use Lichess-style icons:

1. Download or create similar icons
2. Save as SVG files in `frontend/public/icons/`
3. Name them according to the convention above
4. Rebuild project
5. Icons will automatically load

## Example: Using Chess.com-Style Icons

If you want to use Chess.com-style icons:

1. Obtain or create similar icon designs
2. Export as 24x24 SVG or PNG
3. Place in `frontend/public/icons/`
4. Follow naming convention
5. Rebuild and test

## Icon Design Guidelines

For consistent appearance:

- **Simple shapes**: Geometric, clear at small sizes
- **Consistent stroke**: 2-3px for all icons
- **Rounded corners**: Friendly, modern look
- **Proper contrast**: Work on colored badges
- **Scalable**: Look good at 16px - 32px

## Next Steps

1. ✅ Component is ready to use images
2. ⬜ Add your 10 icon images to `frontend/public/icons/`
3. ⬜ Rebuild project
4. ⬜ Test in browser
5. ⬜ Adjust if needed

## Getting Icon Images

### Option 1: From Pull Request Comments
If images were shared in PR comments:
1. Download each icon
2. Rename to match convention
3. Place in `frontend/public/icons/`

### Option 2: From Existing Platforms
Extract from:
- Lichess (check their open-source repo)
- Chess.com (may require permission)
- ChessGround (open-source)

### Option 3: Design Custom Icons
Create in:
- Figma (export as SVG)
- Adobe Illustrator (export as SVG)
- Inkscape (open-source, free)

## Summary

The icon system is now flexible and production-ready:
- ✅ Supports external images
- ✅ Automatic SVG fallback
- ✅ Easy to swap icons
- ✅ No code changes needed after setup

Just add your 10 icon files to `frontend/public/icons/` and rebuild!
