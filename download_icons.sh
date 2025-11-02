#!/bin/bash

# Script to download icon images from GitHub
# Note: These URLs may require authentication or may be expired

echo "Attempting to download icon images..."
echo "If downloads fail (404), you need to manually download from the PR/issue"
echo ""

cd frontend/public/icons

declare -A IMAGES=(
    ["brilliant.png"]="https://github.com/user-attachments/assets/1010fb7d-04ff-449c-acd0-cce74e4f2d09"
    ["best.png"]="https://github.com/user-attachments/assets/4b59410a-afb2-4151-aeee-7ff83488ddc7"
    ["excellent.png"]="https://github.com/user-attachments/assets/284c397f-93d5-41b4-ad45-04d6813de1e2"
    ["great.png"]="https://github.com/user-attachments/assets/a41ec3c2-caf6-4113-89c1-d5e89d0b0e11"
    ["good.png"]="https://github.com/user-attachments/assets/a9553ea0-7578-44b3-9a93-37d12b8a17ba"
    ["inaccuracy.png"]="https://github.com/user-attachments/assets/333ff6f7-35b2-4393-84ed-08a61dfc0961"
    ["mistake.png"]="https://github.com/user-attachments/assets/c71870f4-066c-48da-9d86-480a2b212381"
    ["blunder.png"]="https://github.com/user-attachments/assets/a1c632f0-30a4-4253-b091-e71db00b007f"
    ["miss.png"]="https://github.com/user-attachments/assets/5c6dffa0-fa09-4057-88a2-be9383fab7b7"
    ["book.png"]="https://github.com/user-attachments/assets/6bd0c479-ed4b-4594-b629-36873a392f4a"
)

for filename in "${!IMAGES[@]}"; do
    url="${IMAGES[$filename]}"
    echo "Downloading $filename..."
    
    # Try to download with curl
    if curl -L -f -o "$filename" "$url" 2>/dev/null; then
        echo "✓ Successfully downloaded $filename"
    else
        echo "✗ Failed to download $filename (URL may require authentication)"
    fi
done

echo ""
echo "Download complete!"
echo ""
echo "Checking downloaded files..."
ls -lh *.png 2>/dev/null || echo "No images downloaded - see DOWNLOAD_INSTRUCTIONS.md for manual download"
