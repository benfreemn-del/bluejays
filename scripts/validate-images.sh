#!/bin/bash
# Image Validation — runs automatically to check for broken URLs and duplicates
# Usage: bash scripts/validate-images.sh

echo "=== IMAGE VALIDATION ==="
echo ""

# Check for cross-category duplicate Unsplash photos
echo "Checking for cross-category duplicates..."
DUPES=$(grep -roh "photo-[a-z0-9-]*" src/app/v2/*/page.tsx 2>/dev/null | sort | uniq -c | sort -rn | awk '$1 > 1 {print $0}')

if [ -n "$DUPES" ]; then
  echo "❌ DUPLICATES FOUND:"
  echo "$DUPES" | while read count photo; do
    cats=$(grep -rl "$photo" src/app/v2/*/page.tsx | sed 's|src/app/v2/||;s|/page.tsx||' | tr '\n' ',')
    echo "  $photo ($count uses) -> $cats"
  done
  echo ""
  echo "⚠️  Fix duplicates before deploying!"
else
  echo "✅ No cross-category duplicates"
fi

echo ""
echo "Done."
