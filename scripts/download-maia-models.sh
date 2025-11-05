#!/bin/bash

# Download Maia chess models from the official repository
# Maia models are Leela Chess Zero (LC0) neural networks in .pb.gz format

set -e

MAIA_DIR="frontend/public/maia"
BASE_URL="https://github.com/CSSLab/maia-chess/raw/master/maia_weights"

echo "==========================================="
echo "Maia Chess Model Download Script"
echo "==========================================="
echo ""
echo "IMPORTANT: Maia models require Leela Chess Zero (LC0) engine to run."
echo "These are .pb.gz (Protocol Buffer) model files, not standalone engines."
echo ""
echo "To use Maia models, you need:"
echo "1. LC0 engine compiled to WebAssembly (lc0.js + lc0.wasm)"
echo "2. These Maia weight files (.pb.gz)"
echo "3. Run with: lc0 --weights=maia-1500.pb.gz and 'go nodes 1'"
echo ""
echo "Creating Maia models directory..."
mkdir -p "$MAIA_DIR"

echo "Downloading Maia .pb.gz model files..."
echo ""

# Main Maia models (used on Lichess bots)
models=(
  "maia-1100.pb.gz"
  "maia-1200.pb.gz"
  "maia-1300.pb.gz"
  "maia-1400.pb.gz"
  "maia-1500.pb.gz"
  "maia-1600.pb.gz"
  "maia-1700.pb.gz"
  "maia-1800.pb.gz"
  "maia-1900.pb.gz"
)

success_count=0
fail_count=0

for model in "${models[@]}"; do
  if [ -f "$MAIA_DIR/$model" ]; then
    echo "✓ $model already exists, skipping..."
    ((success_count++))
  else
    echo "Downloading $model..."
    if curl -L -f -o "$MAIA_DIR/$model" "$BASE_URL/$model" 2>/dev/null; then
      echo "  ✓ Downloaded successfully"
      ((success_count++))
    else
      echo "  ✗ Failed to download"
      ((fail_count++))
    fi
  fi
done

echo ""
echo "==========================================="
echo "Download Summary"
echo "==========================================="
echo "Success: $success_count models"
echo "Failed:  $fail_count models"
echo ""

if [ $success_count -gt 0 ]; then
  echo "✓ Maia models are located in: $MAIA_DIR"
  echo ""
  echo "Next steps:"
  echo "1. Get LC0 WebAssembly build (lc0.js + lc0.wasm)"
  echo "2. Place LC0 files in frontend/public/"
  echo "3. Models will load automatically with rating selection"
  echo ""
  echo "Note: Without LC0, the app will use Stockfish to simulate"
  echo "      human-like play at different skill levels."
fi

if [ $fail_count -gt 0 ]; then
  echo ""
  echo "⚠ Some downloads failed. You can manually download from:"
  echo "   https://github.com/CSSLab/maia-chess/tree/master/maia_weights"
fi

echo ""
echo "For more information, see MAIA_SETUP.md"
