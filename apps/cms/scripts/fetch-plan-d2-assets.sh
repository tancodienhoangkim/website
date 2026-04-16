#!/usr/bin/env bash
# Download 6 Unsplash news cover images for Plan D2.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BASE="$ROOT/apps/cms/public/vendor/images/seed/news"
mkdir -p "$BASE"

download() {
  echo "→ $1"
  curl -sSL "https://images.unsplash.com/photo-$2?w=1200&q=80" -o "$BASE/$1"
}

download 'news-1.jpg' '1504711434969-e33886168f5c'  # newspaper
download 'news-2.jpg' '1542831371-29b0f74f9713'     # magazine
download 'news-3.jpg' '1480714378408-67cf0d13bc1b'  # press
download 'news-4.jpg' '1486406146926-c627a92ad1ab'  # reporting
download 'news-5.jpg' '1505664063603-28e48ca204eb'  # news studio
download 'news-6.jpg' '1451187580459-43490279c0fa'  # event

echo "✅ 6 news covers downloaded to $BASE"
