#!/bin/bash
# Fix cross-category duplicate Unsplash images and broken roofing URL
# Strategy: keep the image in the category it fits best, replace in the other

cd "$(dirname "$0")"

# 1. photo-1587300003388-59208cc962cb (golden retriever) — keep in veterinary, replace in pet-services
# Replace with: happy dog being groomed (photo-1548199973-03cce0bbc87b — two dogs running)
sed -i 's|photo-1587300003388-59208cc962cb|photo-1548199973-03cce0bbc87b|g' src/app/v2/pet-services/page.tsx

# 2. photo-1601758228041-f3b2795255f1 (happy dog) — keep in pet-services, replace in veterinary
# Replace with: vet examining dog (photo-1583511655857-d19b40a7a54e)
sed -i 's|photo-1601758228041-f3b2795255f1|photo-1583511655857-d19b40a7a54e|g' src/app/v2/veterinary/page.tsx

# 3. photo-1600596542815-ffad4c1539a9 (luxury home exterior) — keep in real-estate, replace in general-contractor
# Replace with: construction/renovation exterior (photo-1600585154526-990dced4db0d)
sed -i 's|photo-1600596542815-ffad4c1539a9|photo-1600585154526-990dced4db0d|g' src/app/v2/general-contractor/page.tsx

# 4. photo-1552321554-5fefe8c9ef14 (bathroom) — keep in general-contractor, replace in plumber
# Replace with: plumber working on pipes (photo-1581858726788-75bc0f6a952d)
sed -i 's|photo-1552321554-5fefe8c9ef14|photo-1581858726788-75bc0f6a952d|g' src/app/v2/plumber/page.tsx

# 5. photo-1616486338812-3dadae4b4ace (living room) — keep in interior-design, replace in general-contractor
# Replace with: modern open concept home (photo-1600566753190-17f0baa2a6c3)
sed -i 's|photo-1616486338812-3dadae4b4ace|photo-1600566753190-17f0baa2a6c3|g' src/app/v2/general-contractor/page.tsx

# 6. photo-1600585154340-be6161a56a0c (custom home exterior) — keep in general-contractor, replace in real-estate
# Replace with: different luxury home (photo-1600607687939-ce8a6c25118c)
sed -i 's|photo-1600585154340-be6161a56a0c|photo-1600607687939-ce8a6c25118c|g' src/app/v2/real-estate/page.tsx

# 7. photo-1600047509807-ba8f99d2cdde (house exterior) — keep in garage-door, replace in roofing
# Replace with: house with visible roof (photo-1600047509358-9dc75507daeb)
sed -i 's|photo-1600047509807-ba8f99d2cdde|photo-1600047509358-9dc75507daeb|g' src/app/v2/roofing/page.tsx

# 8. photo-1585320806297-9794b3e4eeae (garden/kitchen) — keep in landscaping, replace in painting
# Replace with: freshly painted wall (photo-1562259949-e8e7689d7828)
sed -i 's|photo-1585320806297-9794b3e4eeae|photo-1562259949-e8e7689d7828|g' src/app/v2/painting/page.tsx

# 9. photo-1556909114-f6e7ad7d3136 (kitchen remodel) — keep in general-contractor, replace in plumber
# Replace with: plumbing work (photo-1585771724684-38269d6639fd)
sed -i 's|photo-1556909114-f6e7ad7d3136|photo-1585771724684-38269d6639fd|g' src/app/v2/plumber/page.tsx

# 10. photo-1551218808-94e220e084d2 (plated dish) — keep in restaurant, replace in catering
# Replace with: catering buffet setup (photo-1555939594-58d7cb561ad1)
sed -i 's|photo-1551218808-94e220e084d2|photo-1555939594-58d7cb561ad1|g' src/app/v2/catering/page.tsx

# 11. photo-1544568100-847a948585b9 (puppy) — keep in pet-services, replace in veterinary
# Replace with: cat at vet (photo-1592194996308-7b43878e84a6)
sed -i 's|photo-1544568100-847a948585b9|photo-1592194996308-7b43878e84a6|g' src/app/v2/veterinary/page.tsx

# 12. photo-1507003211169-0a1dd7228f2d (man's portrait) — keep in church (pastor), replace in painting
# Replace with: painting professional portrait (photo-1560250097-0b93528c311a)
sed -i 's|photo-1507003211169-0a1dd7228f2d|photo-1560250097-0b93528c311a|g' src/app/v2/painting/page.tsx

# 13. photo-1502672260266-1c1ef2d93688 (open concept interior) — keep in general-contractor, replace in painting
# Replace with: painted interior room (photo-1513694203232-719a280e022f)
sed -i 's|photo-1502672260266-1c1ef2d93688|photo-1513694203232-719a280e022f|g' src/app/v2/painting/page.tsx

# 14. Fix broken roofing image (photo-1523217553018-9a907c57e7fe returns 404)
# Replace with: roof installation work (photo-1504307651254-35680f356dfd)
sed -i 's|photo-1523217553018-9a907c57e7fe|photo-1504307651254-35680f356dfd|g' src/app/v2/roofing/page.tsx

echo "Done! All cross-category duplicates replaced and broken roofing image fixed."
