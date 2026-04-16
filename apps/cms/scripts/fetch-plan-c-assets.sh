#!/usr/bin/env bash
# Download 12 Unsplash workshop/factory photos for Plan C S5 carousel.
# All photos are CC0 (free commercial use, no attribution required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BASE="$ROOT/apps/cms/public/vendor/images/seed/factory"
mkdir -p "$BASE"

download() {
  local name="$1"
  local photo_id="$2"
  echo "→ $name"
  curl -sSL "https://images.unsplash.com/photo-${photo_id}?w=1200&q=80" -o "$BASE/$name"
}

download 'nha-may-1.jpg'   '1504148455328-c376907d081c'  # woodworking
download 'nha-may-2.jpg'   '1560574188-6a6774965120'     # carpenter
download 'nha-may-3.jpg'   '1558618666-fcd25c85cd64'     # workshop
download 'nha-may-4.jpg'   '1574158622682-e40e69881006'  # craftsman
download 'nha-may-5.jpg'   '1513519245088-0e12902e5a38'  # cnc saw
download 'nha-may-6.jpg'   '1600585152915-d208bec867a1'  # carpentry tools
download 'nha-may-7.jpg'   '1533090481720-856c6e3c1fdc'  # furniture assembly
download 'nha-may-8.jpg'   '1530124566582-a618bc2615dc'  # wood planks
download 'nha-may-9.jpg'   '1517463700628-5103184eac47'  # sanding
download 'nha-may-10.jpg'  '1558002038-1055907df827'     # lathe
download 'nha-may-11.jpg'  '1621905251918-48416bd8575a'  # lumber yard
download 'nha-may-12.jpg'  '1540574163026-643ea20ade25'  # furniture finishing

echo ""
echo "✅ 12 Unsplash images downloaded to $BASE"
