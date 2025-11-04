#!/bin/bash

# Download Maia chess models from the official repository
# These are ONNX format models for different rating levels

set -e

MAIA_DIR="frontend/public/maia"
BASE_URL="https://github.com/CSSLab/maia-chess/raw/master/maia_weights"

echo "Creating Maia models directory..."
mkdir -p "$MAIA_DIR"

echo "Downloading Maia models..."

# Array of Maia models to download
models=(
  "maia_kdd_1100.onnx"
  "maia_kdd_1300.onnx"
  "maia_kdd_1500.onnx"
  "maia_kdd_1700.onnx"
  "maia_kdd_1900.onnx"
)

for model in "${models[@]}"; do
  if [ -f "$MAIA_DIR/$model" ]; then
    echo "✓ $model already exists, skipping..."
  else
    echo "Downloading $model..."
    curl -L -o "$MAIA_DIR/$model" "$BASE_URL/$model" || {
      echo "Warning: Failed to download $model from official repo"
      echo "You may need to download it manually from: https://github.com/CSSLab/maia-chess"
    }
  fi
done

echo ""
echo "Maia models download complete!"
echo "Models are located in: $MAIA_DIR"
echo ""
echo "Note: If downloads failed, you can manually download the models from:"
echo "https://github.com/CSSLab/maia-chess/tree/master/maia_weights"
