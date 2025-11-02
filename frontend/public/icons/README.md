# Move Label Icons

Place the move label icon images in this directory with the following naming convention:

## Required Images

- `brilliant.svg` or `brilliant.png` - Brilliant move icon
- `best.svg` or `best.png` - Best move icon
- `excellent.svg` or `excellent.png` - Excellent move icon
- `great.svg` or `great.png` - Great move icon
- `good.svg` or `good.png` - Good move icon
- `inaccuracy.svg` or `inaccuracy.png` - Inaccuracy icon
- `mistake.svg` or `mistake.png` - Mistake icon
- `blunder.svg` or `blunder.png` - Blunder icon
- `miss.svg` or `miss.png` - Missed win/draw icon
- `book.svg` or `book.png` - Book move icon

## Image Specifications

- **Size**: 24x24 pixels minimum (will be scaled as needed)
- **Format**: SVG preferred, PNG acceptable
- **Transparency**: Should have transparent backgrounds
- **Color**: Icons should work on colored backgrounds

## Usage

Once images are placed here, they will be automatically loaded by the `MoveLabelIcon` component.
The component will first look for SVG files, then fall back to PNG if SVG is not found.
