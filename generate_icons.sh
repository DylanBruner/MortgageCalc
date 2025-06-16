#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required. Please install it first."
    echo "On macOS: brew install imagemagick"
    echo "On Ubuntu/Debian: sudo apt-get install imagemagick"
    exit 1
fi

# Generate 192x192 icon
convert -background none -size 192x192 icon.svg icon-192.png

# Generate 512x512 icon
convert -background none -size 512x512 icon.svg icon-512.png

echo "Icons generated successfully!" 