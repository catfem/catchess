# Maia Chess Engine Setup

CatChess now supports the Maia chess engine in addition to Stockfish! Maia is a neural network-based chess engine that plays like humans at different rating levels (1100-1900).

## About Maia

Maia is a research project from Cornell University that uses deep learning to create chess engines that play like humans at specific skill levels. Unlike traditional engines like Stockfish that always try to play the objectively best move, Maia predicts what human players at different rating levels would actually play.

- **Maia 1100**: Plays like a 1100-rated player (beginner)
- **Maia 1300**: Plays like a 1300-rated player (intermediate)
- **Maia 1500**: Plays like a 1500-rated player (advanced)
- **Maia 1700**: Plays like a 1700-rated player (expert)
- **Maia 1900**: Plays like a 1900-rated player (master)

Learn more at: https://github.com/CSSLab/maia-chess

## Installation

### Automatic Setup (Recommended)

Run the download script to fetch the Maia models:

```bash
./scripts/download-maia-models.sh
```

This will download all 5 Maia models (approximately 100MB total) to `frontend/public/maia/`.

### Manual Setup

If the automatic download fails, you can manually download the models:

1. Visit https://github.com/CSSLab/maia-chess/tree/master/maia_weights
2. Download the following ONNX model files:
   - `maia_kdd_1100.onnx`
   - `maia_kdd_1300.onnx`
   - `maia_kdd_1500.onnx`
   - `maia_kdd_1700.onnx`
   - `maia_kdd_1900.onnx`
3. Place them in `frontend/public/maia/` directory

## Usage

1. Start the application:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. In the UI, go to the **Chess Engine** section in the controls panel

3. Select **Maia** instead of Stockfish

4. Choose your desired rating level (1100-1900)

5. The engine will automatically load and be ready to use for:
   - Playing vs Engine mode
   - Move analysis
   - Position evaluation

## Features

### Human-like Play
Maia makes moves that actual human players would make, including:
- Common human mistakes at the chosen rating level
- Popular opening choices for that skill level
- Typical tactical patterns and oversights

### Multiple Rating Levels
Switch between different skill levels to:
- Practice against players at your rating
- Learn from slightly stronger opponents
- Analyze games from a human perspective

### Analysis Mode
Use Maia to:
- Get move suggestions that humans would likely play
- Understand common human mistakes
- Improve your practical chess understanding

## Technical Details

- **Model Format**: ONNX (Open Neural Network Exchange)
- **Runtime**: ONNX Runtime Web (WebAssembly)
- **Model Size**: ~20MB per model
- **Inference**: Runs entirely in the browser
- **Performance**: Fast enough for real-time play and analysis

## Troubleshooting

### Models Not Loading

If you see an error about missing models:
1. Check that model files exist in `frontend/public/maia/`
2. Verify the files are named correctly (e.g., `maia_kdd_1500.onnx`)
3. Try running the download script again
4. Check browser console for specific error messages

### Slow Performance

If Maia is running slowly:
1. Try a lower depth setting in Analysis settings
2. Close other browser tabs to free up memory
3. Use a modern browser (Chrome, Firefox, or Edge recommended)
4. Check that WebAssembly is enabled in your browser

### Browser Compatibility

Maia requires:
- Modern browser with WebAssembly support
- At least 2GB of available RAM
- JavaScript enabled

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Comparison: Maia vs Stockfish

| Feature | Stockfish | Maia |
|---------|-----------|------|
| Playing Style | Perfect, objective | Human-like |
| Strength Control | Skill levels 0-20 | Rating levels 1100-1900 |
| Analysis | Best moves only | What humans would play |
| Speed | Very fast | Fast |
| Use Case | Maximum challenge | Practice & learning |

## Credits

Maia Chess is developed by:
- Cornell Social Systems Lab (CSSLab)
- Microsoft Research
- University of Toronto

Paper: "Aligning Superhuman AI with Human Behavior: Chess as a Model System"

Links:
- Project: https://maiachess.com/
- GitHub: https://github.com/CSSLab/maia-chess
- Paper: https://arxiv.org/abs/2006.01855
