#!/usr/bin/env bash
# Download 20 Unsplash architectural images for Plan B project grids.
# All photos are CC0 (free commercial use, no attribution required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BASE="$ROOT/apps/cms/public/vendor/images/seed/projects"
mkdir -p "$BASE"

download() {
  local name="$1"
  local photo_id="$2"
  echo "→ $name"
  curl -sSL "https://images.unsplash.com/photo-${photo_id}?w=1200&q=80" -o "$BASE/$name"
}

# S6 Biệt thự (4)
download 'biet-thu-1.jpg'  '1512917774080-9991f1c4c750'  # classical villa exterior
download 'biet-thu-2.jpg'  '1564013799919-ab600027ffc6'  # modern villa
download 'biet-thu-3.jpg'  '1600585154340-be6161a56a0c'  # luxury home
download 'biet-thu-4.jpg'  '1600596542815-ffad4c1539a9'  # villa with garden

# S7 Lâu đài - Dinh thự (4)
download 'lau-dai-1.jpg'   '1605146769289-440113cc3d00'  # French château
download 'lau-dai-2.jpg'   '1570129477492-45c003edd2be'  # mansion
download 'lau-dai-3.jpg'   '1542314831-068cd1dbfeeb'    # grand estate
download 'lau-dai-4.jpg'   '1613977257363-707ba9348227'  # neoclassical façade

# S8 Nội thất (4)
download 'noi-that-1.jpg'  '1586023492125-27b2c045efd7'  # classical living room
download 'noi-that-2.jpg'  '1505691938895-1758d7feb511'  # luxury bedroom
download 'noi-that-3.jpg'  '1556909114-f6e7ad7d3136'     # kitchen interior
download 'noi-that-4.jpg'  '1616046229478-9901c5536a45'  # formal room

# S9 Thi công (4)
download 'thi-cong-1.jpg'  '1541976590-713941681591'     # construction site
download 'thi-cong-2.jpg'  '1503387762-592deb58ef4e'     # blueprint review
download 'thi-cong-3.jpg'  '1517581177682-a085bb7ffb15'  # building frame
download 'thi-cong-4.jpg'  '1504307651254-35680f356dfd'  # construction worker

# S10 Trụ sở - Khách sạn (4)
download 'tru-so-1.jpg'    '1497366216548-37526070297c'  # office building
download 'tru-so-2.jpg'    '1564501049412-61c2a3083791'  # hotel lobby
download 'tru-so-3.jpg'    '1522771739844-6a9f6d5f14af'  # boutique hotel
download 'tru-so-4.jpg'    '1559599101-f09722fb4948'     # restaurant interior

echo ""
echo "✅ 20 Unsplash images downloaded to $BASE"
