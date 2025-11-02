# Download Instructions for Icon Images

## Problem

The GitHub user attachment URLs are not publicly accessible (return 404 errors). You need to manually download and place the images here.

## Required Images

Place these 10 images in this directory (`frontend/public/icons/`):

1. **brilliant.png** - Brilliant move icon
2. **best.png** - Best move icon  
3. **excellent.png** - Excellent move icon (the "ok" image)
4. **great.png** - Great move icon
5. **good.png** - Good move icon
6. **inaccuracy.png** - Inaccuracy icon (the "inaccurate" image)
7. **mistake.png** - Mistake icon
8. **blunder.png** - Blunder icon
9. **miss.png** - Missed win/draw icon
10. **book.png** - Book move icon

## How to Get the Images

### From Pull Request:
1. Open the pull request where you posted the images
2. Right-click each image
3. Select "Save image as..."
4. Save with the names above to this directory

### From Issue/Comment:
1. Navigate to the issue/comment with the images
2. Click each image to view full size
3. Right-click and "Save image as..."
4. Save with the names above

## Verification

After adding images, run:
```bash
ls -la /home/engine/project/frontend/public/icons/
```

You should see all 10 .png files.

Then rebuild:
```bash
cd /home/engine/project/frontend
npm run build
```

## Note

The component is already configured to load from `/icons/` path. Once you add the images and rebuild, they will automatically be used.
