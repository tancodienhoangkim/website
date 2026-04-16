#!/usr/bin/env bash
set -euo pipefail

# Download Unsplash images for Plan A homepage sections.
# Unsplash photos are free-for-commercial-use with no attribution required.
# Partner logos are NOT fetched — they are trademark assets and must be
# downloaded manually from each brand's official brandkit before deploy.

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BASE="$ROOT/apps/cms/public/vendor/images/seed"

mkdir -p "$BASE/services" "$BASE/partners" "$BASE/testimonials"

echo "[1/7] services/thiet-ke-kien-truc.jpg"
curl -sSL "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80" -o "$BASE/services/thiet-ke-kien-truc.jpg"

echo "[2/7] services/thi-cong-xay-dung.jpg"
curl -sSL "https://images.unsplash.com/photo-1541976590-713941681591?w=1200&q=80" -o "$BASE/services/thi-cong-xay-dung.jpg"

echo "[3/7] services/thiet-ke-noi-that.jpg"
curl -sSL "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80" -o "$BASE/services/thiet-ke-noi-that.jpg"

echo "[4/7] services/san-xuat-noi-that.jpg"
curl -sSL "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80" -o "$BASE/services/san-xuat-noi-that.jpg"

echo "[5/7] testimonials/avatar-tuan.jpg"
curl -sSL "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&q=80&fit=crop" -o "$BASE/testimonials/avatar-tuan.jpg"

echo "[6/7] testimonials/avatar-linh.jpg"
curl -sSL "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&q=80&fit=crop" -o "$BASE/testimonials/avatar-linh.jpg"

echo "[7/7] testimonials/avatar-phat.jpg"
curl -sSL "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&q=80&fit=crop" -o "$BASE/testimonials/avatar-phat.jpg"

echo ""
echo "✅ Unsplash assets downloaded to $BASE"
echo ""
echo "⚠️  Partner logos NOT fetched. Seed uses placeholder SVGs (see scripts/generate-partner-placeholders.mjs)."
echo "    Before production deploy, replace with real logos via admin /admin/collections/partners"
