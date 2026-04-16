#!/usr/bin/env bash
# Replace akisa branded hero/about/cta/video-thumb images with Unsplash CC0.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BASE="$ROOT/apps/cms/public/vendor/images/seed/hero"
mkdir -p "$BASE"

download() {
  echo "→ $1"
  curl -sSL "https://images.unsplash.com/photo-$2?w=1920&q=85" -o "$BASE/$1"
}

# Hero carousel (5 slides — luxury villa / classical architecture)
download 'hero-1.jpg' '1600585154340-be6161a56a0c'  # modern luxury villa
download 'hero-2.jpg' '1613977257363-707ba9348227'  # neoclassical facade
download 'hero-3.jpg' '1605146769289-440113cc3d00'  # french chateau
download 'hero-4.jpg' '1564013799919-ab600027ffc6'  # modern villa exterior
download 'hero-5.jpg' '1512917774080-9991f1c4c750'  # classical mansion

# About snippet (elegant interior or exterior)
download 'about-hero.jpg' '1600596542815-ffad4c1539a9'  # villa with garden

# CTA banner
download 'cta-bg.jpg' '1570129477492-45c003edd2be'  # grand mansion

# Video thumbnails (3 architectural preview photos to override akisa YouTube CDN)
download 'video-thumb-1.jpg' '1600585154340-be6161a56a0c'
download 'video-thumb-2.jpg' '1586023492125-27b2c045efd7'
download 'video-thumb-3.jpg' '1505691938895-1758d7feb511'

echo ""
echo "✅ 10 Unsplash hero/video images downloaded to $BASE"
