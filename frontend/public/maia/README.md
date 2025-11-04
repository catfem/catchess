# Maia Chess Models

This directory contains the Maia chess engine models in ONNX format.

## Required Files

The following model files should be placed in this directory:

- `maia_kdd_1100.onnx` - Maia 1100 rating level
- `maia_kdd_1300.onnx` - Maia 1300 rating level
- `maia_kdd_1500.onnx` - Maia 1500 rating level
- `maia_kdd_1700.onnx` - Maia 1700 rating level
- `maia_kdd_1900.onnx` - Maia 1900 rating level

## Downloading Models

Run the download script from the project root:

```bash
./scripts/download-maia-models.sh
```

Or manually download from: https://github.com/CSSLab/maia-chess/tree/master/maia_weights

## Model Details

- **Format**: ONNX
- **Size**: ~20MB per model
- **Total**: ~100MB for all 5 models
- **License**: See https://github.com/CSSLab/maia-chess for licensing information

## Notes

These models are not included in the repository due to their size. You must download them separately to use the Maia engine.

If you don't have the models, the application will fall back to Stockfish engine.
