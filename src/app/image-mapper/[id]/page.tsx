"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ImageSlot, ImageMapping } from "@/lib/image-mapper-store";

/* ─── Theme Library: 9 unique high-quality fallback images per category ─── */
const THEME_LIBRARY: Record<string, { url: string; name: string }[]> = {
  dental: [
    { url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80", name: "dentist-at-work" },
    { url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80", name: "dental-consultation" },
    { url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80", name: "bright-smile" },
    { url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80", name: "dental-chair" },
    { url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80", name: "dental-office" },
    { url: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=80", name: "dental-hygienist" },
    { url: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80", name: "office-interior" },
    { url: "https://images.unsplash.com/photo-1593022356769-11f762e25ed9?w=800&q=80", name: "dental-instruments" },
    { url: "https://images.unsplash.com/photo-1667133295315-820bb6481730?w=800&q=80", name: "dental-exam" },
  ],
  roofing: [
    { url: "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800&q=80", name: "roofer-on-roof" },
    { url: "https://images.unsplash.com/photo-1743610350670-db2f1cc54620?w=800&q=80", name: "roof-drill-work" },
    { url: "https://images.unsplash.com/photo-1726589004565-bedfba94d3a2?w=800&q=80", name: "man-working-roof" },
    { url: "https://images.unsplash.com/photo-1681881134614-2032b02da1e7?w=800&q=80", name: "roof-inspection" },
    { url: "https://images.unsplash.com/photo-1643509867448-57001e0c333d?w=800&q=80", name: "shingle-install" },
    { url: "https://images.unsplash.com/photo-1765808376054-e224c7dbcdee?w=800&q=80", name: "metal-roof" },
    { url: "https://images.unsplash.com/photo-1760331840361-d751cfc1becf?w=800&q=80", name: "roof-repair" },
    { url: "https://images.unsplash.com/photo-1631639324100-2ed305cb32a4?w=800&q=80", name: "new-construction" },
    { url: "https://images.unsplash.com/photo-1627591637320-fcfe8c34b62d?w=800&q=80", name: "roofing-team" },
  ],
  veterinary: [
    { url: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80", name: "vet-holding-cat" },
    { url: "https://images.unsplash.com/photo-1596272875729-ed2ff7d6d9c5?w=800&q=80", name: "cat-at-vet" },
    { url: "https://images.unsplash.com/photo-1700665537604-412e89a285c3?w=800&q=80", name: "vet-team-dog" },
    { url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80", name: "happy-dogs" },
    { url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80", name: "cat-portrait" },
    { url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80", name: "dog-portrait" },
    { url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80", name: "pet-checkup" },
    { url: "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=800&q=80", name: "playful-kitten" },
    { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80", name: "golden-retriever" },
  ],
  electrician: [
    { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80", name: "electrician-tool" },
    { url: "https://images.unsplash.com/photo-1682345262055-8f95f3c513ea?w=800&q=80", name: "wiring-work" },
    { url: "https://images.unsplash.com/photo-1646640381839-02748ae8ddf0?w=800&q=80", name: "electrician-drill" },
    { url: "https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?w=800&q=80", name: "cable-install" },
    { url: "https://images.unsplash.com/photo-1635335874521-7987db781153?w=800&q=80", name: "electrical-panel" },
    { url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80", name: "hard-hat-worker" },
    { url: "https://images.unsplash.com/photo-1507494924047-60b8ee826ca9?w=800&q=80", name: "light-install" },
    { url: "https://images.unsplash.com/photo-1597502310092-31cdaa35b46d?w=800&q=80", name: "worker-helmet" },
    { url: "https://images.unsplash.com/photo-1581972327480-e3764d31e5e6?w=800&q=80", name: "components" },
  ],
  plumber: [
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", name: "plumber-tool" },
    { url: "https://images.unsplash.com/photo-1620653713380-7a34b773fef8?w=800&q=80", name: "pipe-fitting" },
    { url: "https://images.unsplash.com/photo-1542013936693-884638332954?w=800&q=80", name: "faucet-fixture" },
    { url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80", name: "plumbing-tools" },
    { url: "https://images.unsplash.com/photo-1521207418485-99c705420785?w=800&q=80", name: "kitchen-faucet" },
    { url: "https://images.unsplash.com/photo-1640682841767-cdfce3aea6e0?w=800&q=80", name: "wrench-set" },
    { url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&q=80", name: "bathroom-faucet" },
    { url: "https://images.unsplash.com/photo-1669920282730-ab422e592f97?w=800&q=80", name: "running-water" },
    { url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80", name: "plumber-work" },
  ],
  salon: [
    { url: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&q=80", name: "hair-cutting" },
    { url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80", name: "blowdryer" },
    { url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80", name: "styling-tools" },
    { url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80", name: "salon-interior" },
    { url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80", name: "hair-dryer" },
    { url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80", name: "salon-team" },
    { url: "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80", name: "hair-curling" },
    { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80", name: "color-result" },
    { url: "https://images.unsplash.com/photo-1554519934-e32b1629d9ee?w=800&q=80", name: "blowout-finish" },
  ],
  hvac: [
    { url: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&q=80", name: "smart-thermostat" },
    { url: "https://images.unsplash.com/photo-1566917064245-1c6bff30dbf1?w=800&q=80", name: "outdoor-ac" },
    { url: "https://images.unsplash.com/photo-1558358235-a0a93f68a52c?w=800&q=80", name: "air-vent" },
    { url: "https://images.unsplash.com/photo-1568634699096-82c9765548a0?w=800&q=80", name: "ac-units" },
    { url: "https://images.unsplash.com/photo-1698479603408-1a66a6d9e80f?w=800&q=80", name: "commercial-ac" },
    { url: "https://images.unsplash.com/photo-1545259742-b4fd8fea67e4?w=800&q=80", name: "thermostat-ctrl" },
    { url: "https://images.unsplash.com/photo-1615309662243-70f6df917b59?w=800&q=80", name: "ductwork" },
    { url: "https://images.unsplash.com/photo-1572081790780-1a7739896259?w=800&q=80", name: "exhaust-fan" },
    { url: "https://images.unsplash.com/photo-1718203862467-c33159fdc504?w=800&q=80", name: "wall-ac" },
  ],
  cleaning: [
    { url: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&q=80", name: "cleaning-counter" },
    { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", name: "spray-bottles" },
    { url: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&q=80", name: "tidy-room" },
    { url: "https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?w=800&q=80", name: "clean-bathroom" },
    { url: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80", name: "supplies" },
    { url: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=800&q=80", name: "mop-floor" },
    { url: "https://images.unsplash.com/photo-1583845112239-97ef1341b271?w=800&q=80", name: "vacuuming" },
    { url: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80", name: "clean-kitchen" },
    { url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80", name: "window-clean" },
  ],
  landscaping: [
    { url: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80", name: "garden-path" },
    { url: "https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=800&q=80", name: "flower-bed" },
    { url: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=800&q=80", name: "outdoor-lighting" },
    { url: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800&q=80", name: "hedge-trimming" },
    { url: "https://images.unsplash.com/photo-1590595978583-3967cf17d2ea?w=800&q=80", name: "stone-pathway" },
    { url: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=800&q=80", name: "water-feature" },
    { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80", name: "backyard-lawn" },
    { url: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80", name: "patio-design" },
    { url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800&q=80", name: "landscape-view" },
  ],
  "law-firm": [
    { url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80", name: "law-library" },
    { url: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&q=80", name: "courthouse" },
    { url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80", name: "legal-docs" },
    { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80", name: "professional" },
    { url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80", name: "business-portrait" },
    { url: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&q=80", name: "scales-justice" },
    { url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80", name: "office-meeting" },
    { url: "https://images.unsplash.com/photo-1593115057322-e94b77572f20?w=800&q=80", name: "gavel" },
    { url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80", name: "conference-room" },
  ],
  insurance: [
    { url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80", name: "consultation" },
    { url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80", name: "car-road" },
    { url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80", name: "home-protected" },
    { url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80", name: "agent" },
    { url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80", name: "happy-family" },
    { url: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?w=800&q=80", name: "family-protect" },
    { url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80", name: "health-coverage" },
    { url: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80", name: "doc-signing" },
    { url: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&q=80", name: "property" },
  ],
  accounting: [
    { url: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=800&q=80", name: "calculator" },
    { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80", name: "team-meeting" },
    { url: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80", name: "charts" },
    { url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80", name: "tax-forms" },
    { url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80", name: "spreadsheet" },
    { url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80", name: "professional" },
    { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", name: "office-building" },
    { url: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=800&q=80", name: "laptop-work" },
    { url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80", name: "data-analysis" },
  ],
  chiropractic: [
    { url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80", name: "back-treatment" },
    { url: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80", name: "consultation" },
    { url: "https://images.unsplash.com/photo-1617952739858-28043cecdae3?w=800&q=80", name: "massage" },
    { url: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&q=80", name: "clinic-interior" },
    { url: "https://images.unsplash.com/photo-1552508744-1696d4464960?w=800&q=80", name: "stretching" },
    { url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80", name: "yoga-wellness" },
    { url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80", name: "meditation" },
    { url: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80", name: "therapy-room" },
    { url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80", name: "neck-treatment" },
  ],
  "auto-repair": [
    { url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80", name: "mechanic-hood" },
    { url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80", name: "engine-parts" },
    { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", name: "car-front" },
    { url: "https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=800&q=80", name: "auto-shop" },
    { url: "https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=800&q=80", name: "tire-service" },
    { url: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80", name: "brake-repair" },
    { url: "https://images.unsplash.com/photo-1632823469850-2f77dd9c7f93?w=800&q=80", name: "diagnostic" },
    { url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80", name: "car-lift" },
    { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&q=80", name: "oil-change" },
  ],
  "real-estate": [
    { url: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80", name: "luxury-home" },
    { url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80", name: "open-house" },
    { url: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&q=80", name: "kitchen-staged" },
    { url: "https://images.unsplash.com/photo-1632646332858-3bd21405f98f?w=800&q=80", name: "for-sale-sign" },
    { url: "https://images.unsplash.com/photo-1560449752-8b6023e2ab5a?w=800&q=80", name: "living-staged" },
    { url: "https://images.unsplash.com/photo-1613849925352-96348d26bc51?w=800&q=80", name: "modern-bath" },
    { url: "https://images.unsplash.com/photo-1564343128896-3ffbcf9439e5?w=800&q=80", name: "showing-home" },
    { url: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80", name: "aerial-view" },
    { url: "https://images.unsplash.com/photo-1604882234072-d5741489e0c0?w=800&q=80", name: "front-porch" },
  ],
  photography: [
    { url: "https://images.unsplash.com/photo-1504202654196-f6a71d98dc01?w=800&q=80", name: "camera-closeup" },
    { url: "https://images.unsplash.com/photo-1627913759066-2f62eb9bbaa4?w=800&q=80", name: "wedding" },
    { url: "https://images.unsplash.com/photo-1497881807663-38b9a95b7192?w=800&q=80", name: "portrait" },
    { url: "https://images.unsplash.com/photo-1553614186-a373dedbb390?w=800&q=80", name: "studio-light" },
    { url: "https://images.unsplash.com/photo-1642322430525-41043cf3e99b?w=800&q=80", name: "landscape" },
    { url: "https://images.unsplash.com/photo-1576566933304-a2d7d8a496fe?w=800&q=80", name: "couple-shoot" },
    { url: "https://images.unsplash.com/photo-1601228552459-f648744df0d4?w=800&q=80", name: "event-photo" },
    { url: "https://images.unsplash.com/photo-1610901144642-231342332fb4?w=800&q=80", name: "newborn" },
    { url: "https://images.unsplash.com/photo-1528109966604-5a6a4a964e8d?w=800&q=80", name: "editing" },
  ],
  "interior-design": [
    { url: "https://images.unsplash.com/photo-1533499966477-9333968a4e28?w=800&q=80", name: "modern-living" },
    { url: "https://images.unsplash.com/photo-1631701601945-414a32dbef47?w=800&q=80", name: "kitchen-remodel" },
    { url: "https://images.unsplash.com/photo-1638840992956-142399e7e2df?w=800&q=80", name: "bedroom" },
    { url: "https://images.unsplash.com/photo-1632829882891-5047ccc421bc?w=800&q=80", name: "bathroom" },
    { url: "https://images.unsplash.com/photo-1593136596203-7212b076f4d2?w=800&q=80", name: "dining-room" },
    { url: "https://images.unsplash.com/photo-1600210491305-7396500b5b31?w=800&q=80", name: "home-office" },
    { url: "https://images.unsplash.com/photo-1608556984704-fa578c96e6eb?w=800&q=80", name: "color-swatches" },
    { url: "https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?w=800&q=80", name: "furniture" },
    { url: "https://images.unsplash.com/photo-1557379488-c611c67dab77?w=800&q=80", name: "accent-wall" },
  ],
  "general-contractor": [
    { url: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800&q=80", name: "construction" },
    { url: "https://images.unsplash.com/photo-1656956479776-637a2d453e7e?w=800&q=80", name: "framing" },
    { url: "https://images.unsplash.com/photo-1634586621169-93e12e0bd604?w=800&q=80", name: "renovation" },
    { url: "https://images.unsplash.com/photo-1599256630445-67b5772b1204?w=800&q=80", name: "finished-remodel" },
    { url: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=800&q=80", name: "blueprints" },
    { url: "https://images.unsplash.com/photo-1454694220579-9d6672b1ec2a?w=800&q=80", name: "power-tools" },
    { url: "https://images.unsplash.com/photo-1553946550-4b8f3eea5451?w=800&q=80", name: "hardhat-worker" },
    { url: "https://images.unsplash.com/photo-1575281923032-f40d94ef6160?w=800&q=80", name: "kitchen-build" },
    { url: "https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?w=800&q=80", name: "bath-renovation" },
  ],
  moving: [
    { url: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=800&q=80", name: "cardboard-boxes" },
    { url: "https://images.unsplash.com/photo-1556216607-691819089c19?w=800&q=80", name: "moving-truck" },
    { url: "https://images.unsplash.com/photo-1577702312572-5bb9328a9f15?w=800&q=80", name: "packing-tape" },
    { url: "https://images.unsplash.com/photo-1533696848654-6bdf438edea4?w=800&q=80", name: "new-home-keys" },
    { url: "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?w=800&q=80", name: "loading-dolly" },
    { url: "https://images.unsplash.com/photo-1555474258-ee7cefbcbd82?w=800&q=80", name: "bubble-wrap" },
    { url: "https://images.unsplash.com/photo-1600877326636-c434f8f3e872?w=800&q=80", name: "empty-apartment" },
    { url: "https://images.unsplash.com/photo-1581573796233-13d3d9cbefd7?w=800&q=80", name: "family-moving" },
    { url: "https://images.unsplash.com/photo-1595944356863-e624f8234e1e?w=800&q=80", name: "stacked-boxes" },
  ],
  "pest-control": [
    { url: "https://images.unsplash.com/photo-1554585371-5369ea41b018?w=800&q=80", name: "home-inspection" },
    { url: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&q=80", name: "tech-spraying" },
    { url: "https://images.unsplash.com/photo-1558983925-ea9372bf2ba0?w=800&q=80", name: "ant-closeup" },
    { url: "https://images.unsplash.com/photo-1587829166062-cae2a11cb521?w=800&q=80", name: "termite-damage" },
    { url: "https://images.unsplash.com/photo-1552920831-9206c8ebe115?w=800&q=80", name: "rodent-trap" },
    { url: "https://images.unsplash.com/photo-1540366244940-9dce0a570312?w=800&q=80", name: "clean-yard" },
    { url: "https://images.unsplash.com/photo-1572731561221-96d988d74dc9?w=800&q=80", name: "protective-gear" },
    { url: "https://images.unsplash.com/photo-1581578404991-245ebf59c917?w=800&q=80", name: "pest-free-home" },
    { url: "https://images.unsplash.com/photo-1591735115730-4bf3a351cfe8?w=800&q=80", name: "crawl-space" },
  ],
  "carpet-cleaning": [
    { url: "https://images.unsplash.com/photo-1628260412297-a3377e45006f?w=800&q=80", name: "carpet-clean" },
    { url: "https://images.unsplash.com/photo-1558944351-3f79926e74ef?w=800&q=80", name: "steam-machine" },
    { url: "https://images.unsplash.com/photo-1534889156217-d643df14f14a?w=800&q=80", name: "before-after" },
    { url: "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=800&q=80", name: "stain-removal" },
    { url: "https://images.unsplash.com/photo-1527515673510-8aa78ce21f9b?w=800&q=80", name: "upholstery" },
    { url: "https://images.unsplash.com/photo-1546550879-3b71f2427ae0?w=800&q=80", name: "rug-cleaning" },
    { url: "https://images.unsplash.com/photo-1496093044462-e7ee398276c9?w=800&q=80", name: "clean-carpet" },
    { url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80", name: "pro-equipment" },
    { url: "https://images.unsplash.com/photo-1549637642-90187f64f420?w=800&q=80", name: "fresh-floor" },
  ],
  "physical-therapy": [
    { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80", name: "therapy-session" },
    { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", name: "stretching" },
    { url: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&q=80", name: "exercise-ball" },
    { url: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=800&q=80", name: "rehab-clinic" },
    { url: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&q=80", name: "pt-equipment" },
    { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80", name: "yoga-stretch" },
    { url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80", name: "recovery" },
    { url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80", name: "weights" },
    { url: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=800&q=80", name: "consultation" },
  ],
  fitness: [
    { url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", name: "gym-floor" },
    { url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", name: "lifting" },
    { url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80", name: "group-class" },
    { url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80", name: "training" },
    { url: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80", name: "cardio" },
    { url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80", name: "crossfit" },
    { url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80", name: "personal-trainer" },
    { url: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80", name: "dumbbells" },
    { url: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80", name: "gym-interior" },
  ],
  tattoo: [
    { url: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80", name: "tattoo-artist" },
    { url: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=800&q=80", name: "tattoo-machine" },
    { url: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=800&q=80", name: "ink-bottles" },
    { url: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=800&q=80", name: "tattoo-studio" },
    { url: "https://images.unsplash.com/photo-1614107151491-6876eecbff89?w=800&q=80", name: "arm-tattoo" },
    { url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80", name: "sleeve-work" },
    { url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80", name: "tattoo-design" },
    { url: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=800&q=80", name: "artist-at-work" },
    { url: "https://images.unsplash.com/photo-1550537687-c91072c4792d?w=800&q=80", name: "flash-art" },
  ],
  church: [
    { url: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&q=80", name: "church-interior" },
    { url: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80", name: "worship-service" },
    { url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80", name: "community-gathering" },
    { url: "https://images.unsplash.com/photo-1519677584237-752f8853252e?w=800&q=80", name: "church-exterior" },
    { url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80", name: "stained-glass" },
    { url: "https://images.unsplash.com/photo-1557127275-f8b5ba93e24e?w=800&q=80", name: "choir" },
    { url: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&q=80", name: "fellowship-hall" },
    { url: "https://images.unsplash.com/photo-1505455184862-554165e5f6ba?w=800&q=80", name: "bible-study" },
    { url: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&q=80", name: "church-lobby" },
  ],
  daycare: [
    { url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80", name: "children-playing" },
    { url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&q=80", name: "playground" },
    { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80", name: "classroom" },
    { url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80", name: "reading-time" },
    { url: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&q=80", name: "art-activities" },
    { url: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=800&q=80", name: "nap-room" },
    { url: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800&q=80", name: "outdoor-play" },
    { url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80", name: "snack-time" },
    { url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80", name: "colorful-room" },
  ],
  florist: [
    { url: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80", name: "flower-arrangement" },
    { url: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80", name: "bouquet" },
    { url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80", name: "flower-shop" },
    { url: "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=800&q=80", name: "roses" },
    { url: "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800&q=80", name: "wedding-flowers" },
    { url: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80", name: "floral-display" },
    { url: "https://images.unsplash.com/photo-1416339684178-3a239570f315?w=800&q=80", name: "delivery" },
    { url: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80", name: "wreath" },
    { url: "https://images.unsplash.com/photo-1585241936939-be4099591252?w=800&q=80", name: "potted-plants" },
  ],
  "med-spa": [
    { url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80", name: "facial-treatment" },
    { url: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80", name: "spa-room" },
    { url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80", name: "skincare-products" },
    { url: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&q=80", name: "treatment-bed" },
    { url: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800&q=80", name: "laser-equipment" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", name: "relaxation-area" },
    { url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80", name: "consultation" },
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", name: "injectable-treatment" },
    { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", name: "spa-interior" },
  ],
  restaurant: [
    { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", name: "plated-food" },
    { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", name: "restaurant-interior" },
    { url: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&q=80", name: "chef-cooking" },
    { url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80", name: "bar-area" },
    { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", name: "outdoor-dining" },
    { url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80", name: "kitchen" },
    { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", name: "menu-presentation" },
    { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", name: "wine-service" },
    { url: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80", name: "table-setting" },
  ],
  "martial-arts": [
    { url: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80", name: "karate-class" },
    { url: "https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=800&q=80", name: "dojo-interior" },
    { url: "https://images.unsplash.com/photo-1555597408-26bc8e548a46?w=800&q=80", name: "sparring" },
    { url: "https://images.unsplash.com/photo-1562088287-bde35a1ea917?w=800&q=80", name: "belt-ceremony" },
    { url: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800&q=80", name: "instructor-teaching" },
    { url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80", name: "kids-class" },
    { url: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80", name: "punching-bag" },
    { url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80", name: "group-training" },
    { url: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=800&q=80", name: "uniform-lineup" },
  ],
  "pool-spa": [
    { url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80", name: "swimming-pool" },
    { url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", name: "hot-tub" },
    { url: "https://images.unsplash.com/photo-1519120944692-1a8d8cfc107f?w=800&q=80", name: "pool-cleaning" },
    { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", name: "pool-equipment" },
    { url: "https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=800&q=80", name: "backyard-pool" },
    { url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80", name: "pool-maintenance" },
    { url: "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&q=80", name: "water-testing" },
    { url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80", name: "pool-tile" },
    { url: "https://images.unsplash.com/photo-1620674156044-52b714665d46?w=800&q=80", name: "pool-party" },
  ],
  catering: [
    { url: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80", name: "buffet-setup" },
    { url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80", name: "catering-team" },
    { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80", name: "food-display" },
    { url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80", name: "event-table" },
    { url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80", name: "chef-preparing" },
    { url: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800&q=80", name: "appetizer-tray" },
    { url: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80", name: "wedding-reception-food" },
    { url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", name: "dessert-table" },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", name: "serving" },
  ],
  "event-planning": [
    { url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80", name: "decorated-venue" },
    { url: "https://images.unsplash.com/photo-1562887250-9a52d844ad30?w=800&q=80", name: "wedding-setup" },
    { url: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&q=80", name: "corporate-event" },
    { url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80", name: "party-decorations" },
    { url: "https://images.unsplash.com/photo-1507878866276-a947ef722fee?w=800&q=80", name: "table-centerpiece" },
    { url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80", name: "lighting-design" },
    { url: "https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?w=800&q=80", name: "outdoor-tent" },
    { url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80", name: "stage-setup" },
    { url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80", name: "balloon-arch" },
  ],
  fencing: [
    { url: "https://images.unsplash.com/photo-1635424710928-0544e8512eae?w=800&q=80", name: "wooden-fence" },
    { url: "https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?w=800&q=80", name: "iron-gate" },
    { url: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80", name: "chain-link-fence" },
    { url: "https://images.unsplash.com/photo-1619221882220-947b3d3c8861?w=800&q=80", name: "fence-installation" },
    { url: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&q=80", name: "vinyl-fence" },
    { url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80", name: "fence-post" },
    { url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80", name: "privacy-fence" },
    { url: "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80", name: "garden-gate" },
    { url: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80", name: "fence-repair" },
  ],
  "garage-door": [
    { url: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&q=80", name: "garage-door-exterior" },
    { url: "https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?w=800&q=80", name: "garage-opener" },
    { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80", name: "garage-interior" },
    { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80", name: "door-repair" },
    { url: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&q=80", name: "new-installation" },
    { url: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80", name: "spring-mechanism" },
    { url: "https://images.unsplash.com/photo-1590004987778-bece5c9adab6?w=800&q=80", name: "insulated-door" },
    { url: "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=800&q=80", name: "carriage-style" },
    { url: "https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&q=80", name: "modern-garage" },
  ],
  locksmith: [
    { url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80", name: "key-cutting" },
    { url: "https://images.unsplash.com/photo-1558383331-f520f2888351?w=800&q=80", name: "door-lock" },
    { url: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80", name: "locksmith-tools" },
    { url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80", name: "car-lockout" },
    { url: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80", name: "key-set" },
    { url: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=800&q=80", name: "deadbolt" },
    { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", name: "padlock" },
    { url: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&q=80", name: "security-system" },
    { url: "https://images.unsplash.com/photo-1633259584604-afdc243122ea?w=800&q=80", name: "lock-repair" },
  ],
  medical: [
    { url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80", name: "doctor-consultation" },
    { url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80", name: "medical-office" },
    { url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80", name: "stethoscope" },
    { url: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80", name: "waiting-room" },
    { url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80", name: "exam-room" },
    { url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80", name: "healthcare-team" },
    { url: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80", name: "medical-equipment" },
    { url: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&q=80", name: "patient-care" },
    { url: "https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=800&q=80", name: "clinic-exterior" },
  ],
  painting: [
    { url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80", name: "house-painting" },
    { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80", name: "paint-roller" },
    { url: "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=800&q=80", name: "color-samples" },
    { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", name: "interior-painting" },
    { url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80", name: "exterior-painting" },
    { url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80", name: "paint-cans" },
    { url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80", name: "painter-on-ladder" },
    { url: "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&q=80", name: "accent-wall" },
    { url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80", name: "trim-work" },
  ],
  "pet-services": [
    { url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80", name: "dog-grooming" },
    { url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80", name: "pet-walking" },
    { url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80", name: "dog-daycare" },
    { url: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800&q=80", name: "pet-boarding" },
    { url: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=800&q=80", name: "cat-sitting" },
    { url: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80", name: "pet-bath" },
    { url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80", name: "dog-training" },
    { url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&q=80", name: "pet-accessories" },
    { url: "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=800&q=80", name: "happy-pets" },
  ],
  "pressure-washing": [
    { url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80", name: "pressure-washer-action" },
    { url: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=800&q=80", name: "driveway-cleaning" },
    { url: "https://images.unsplash.com/photo-1563473213013-de2a0133c100?w=800&q=80", name: "deck-cleaning" },
    { url: "https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=800&q=80", name: "siding-wash" },
    { url: "https://images.unsplash.com/photo-1543393716-375f47996a77?w=800&q=80", name: "concrete-cleaning" },
    { url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80", name: "equipment" },
    { url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80", name: "before-after-surface" },
    { url: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80", name: "commercial-cleaning" },
    { url: "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=800&q=80", name: "fence-washing" },
  ],
  towing: [
    { url: "https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=800&q=80", name: "tow-truck" },
    { url: "https://images.unsplash.com/photo-1617104678098-de229db51175?w=800&q=80", name: "flatbed" },
    { url: "https://images.unsplash.com/photo-1613323593608-abc90fec84ff?w=800&q=80", name: "roadside-assistance" },
    { url: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80", name: "car-being-towed" },
    { url: "https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800&q=80", name: "jump-start" },
    { url: "https://images.unsplash.com/photo-1615615228002-890bb61cac6e?w=800&q=80", name: "tire-change" },
    { url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80", name: "tow-driver" },
    { url: "https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=800&q=80", name: "recovery" },
    { url: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80", name: "breakdown" },
  ],
  "tree-service": [
    { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", name: "tree-trimming" },
    { url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80", name: "arborist-climbing" },
    { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80", name: "chainsaw-work" },
    { url: "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80", name: "tree-removal" },
    { url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80", name: "stump-grinding" },
    { url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80", name: "pruning" },
    { url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&q=80", name: "fallen-tree" },
    { url: "https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=800&q=80", name: "bucket-truck" },
    { url: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80", name: "wood-chips" },
  ],
  tutoring: [
    { url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80", name: "student-studying" },
    { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", name: "tutor-with-student" },
    { url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80", name: "classroom" },
    { url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80", name: "books-and-laptop" },
    { url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80", name: "whiteboard" },
    { url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80", name: "math-lesson" },
    { url: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&q=80", name: "online-tutoring" },
    { url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80", name: "study-group" },
    { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80", name: "library" },
  ],
  "junk-removal": [
    { url: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=800&q=80", name: "dumpster" },
    { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", name: "hauling-truck" },
    { url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80", name: "garage-cleanout" },
    { url: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=800&q=80", name: "debris-removal" },
    { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", name: "furniture-removal" },
    { url: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=800&q=80", name: "cleanup-crew" },
    { url: "https://images.unsplash.com/photo-1558618047-3c8c76c55e9b?w=800&q=80", name: "before-after-space" },
    { url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80", name: "recycling" },
    { url: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800&q=80", name: "estate-cleanout" },
  ],
  "appliance-repair": [
    { url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80", name: "washing-machine" },
    { url: "https://images.unsplash.com/photo-1599045118108-bf9954418b76?w=800&q=80", name: "refrigerator-repair" },
    { url: "https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=800&q=80", name: "oven-service" },
    { url: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80", name: "dishwasher" },
    { url: "https://images.unsplash.com/photo-1621460248083-6271cc4437a8?w=800&q=80", name: "technician-working" },
    { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", name: "tools" },
    { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800&q=80", name: "dryer-repair" },
    { url: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800&q=80", name: "appliance-parts" },
    { url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80", name: "kitchen-appliances" },
  ],
  construction: [
    { url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80", name: "construction-site" },
    { url: "https://images.unsplash.com/photo-1580795479225-c50ab8c3348d?w=800&q=80", name: "framing" },
    { url: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80", name: "concrete-pour" },
    { url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80", name: "crane" },
    { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80", name: "hard-hats" },
    { url: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80", name: "blueprints" },
    { url: "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=800&q=80", name: "building-progress" },
    { url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80", name: "steel-beams" },
    { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80", name: "excavation" },
  ],
};

/* ─── Helpers ─── */
function statusColor(status: ImageSlot["status"]) {
  switch (status) {
    case "needs-replacement":
      return { bg: "bg-red-500/20", text: "text-red-400", label: "Needs Replacement" };
    case "replaced":
      return { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Replaced" };
    case "keep-original":
      return { bg: "bg-blue-500/20", text: "text-blue-400", label: "Keep Original" };
  }
}

function proxyUrl(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/* ─── Category Fallback Slot type ─── */
interface FallbackSlot {
  label: string;
  url: string | null;
}

/* ─── Component ─── */
export default function ImageMapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prospect, setProspect] = useState<any>(null);
  const [mapping, setMapping] = useState<ImageMapping | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allProspects, setAllProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [rightTab, setRightTab] = useState<"library" | "upload" | "fallbacks">("library");
  const [uploadedImages, setUploadedImages] = useState<{ url: string; name: string }[]>([]);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [categoryFallbacks, setCategoryFallbacks] = useState<FallbackSlot[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [activeFallbackSlot, setActiveFallbackSlot] = useState<number | null>(null);

  /* ─── Load Data ─── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prospects/${id}`, { credentials: "include" });
      if (!res.ok) {
        router.push("/image-mapper");
        return;
      }
      const data = await res.json();
      if (data.error) {
        router.push("/image-mapper");
        return;
      }
      setProspect(data);
      const imgMapping = data.imageMapping || data.scrapedData?.imageMapping;
      if (imgMapping) {
        setMapping(imgMapping as ImageMapping);
      }
    } catch {
      router.push("/image-mapper");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
    // Load all prospects for next/prev navigation
    fetch("/api/prospects?limit=500", { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (data.prospects) setAllProspects(data.prospects.filter((p: { status: string }) => p.status !== "dismissed")); })
      .catch(() => {});
  }, [loadData]);

  const currentIndex = allProspects.findIndex(p => p.id === id);
  const nextProspect = currentIndex >= 0 && currentIndex < allProspects.length - 1 ? allProspects[currentIndex + 1] : null;
  const prevProspect = currentIndex > 0 ? allProspects[currentIndex - 1] : null;

  /* ─── Initialize category fallback slots ─── */
  const category = mapping?.category || prospect?.category || "general";
  useEffect(() => {
    if (category) {
      setCategoryFallbacks(
        Array.from({ length: 8 }, (_, i) => ({
          label: `${category}-theme-pics-${i + 1}`,
          url: null,
        }))
      );
    }
  }, [category]);

  /* ─── Scan Website ─── */
  const scanWebsite = async () => {
    setScanning(true);
    try {
      const res = await fetch(`/api/image-mapper/scan/${id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.mapping) {
        setMapping(data.mapping);
      }
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setScanning(false);
    }
  };

  /* ─── Save Note (silent autosave) ─── */
  const saveNote = async (position: number, notes: string) => {
    try {
      await fetch(`/api/image-mapper/save/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ expectedVersion: mapping?.lastUpdated, imageUpdate: { position, notes } }),
      });
      setMapping((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          images: prev.images.map((img) =>
            img.position === position ? { ...img, notes } : img
          ),
        };
      });
    } catch { /* silent */ }
  };

  /* ─── Toggle Keep Original ─── */
  const toggleKeepOriginal = async (position: number) => {
    if (!mapping) return;
    const slot = mapping.images.find((img) => img.position === position);
    if (!slot) return;
    const newStatus = slot.status === "keep-original" ? "needs-replacement" : "keep-original";
    try {
      const res = await fetch(`/api/image-mapper/save/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          expectedVersion: mapping.lastUpdated,
          imageUpdate: {
            position,
            status: newStatus,
            replacementUrl: newStatus === "keep-original" ? null : slot.replacementUrl,
          },
        }),
      });
      if (res.status === 409) { alert("Conflict — mapping was modified by another session. Refreshing..."); window.location.reload(); return; }
      const data = await res.json();
      if (data.mapping) setMapping(data.mapping);
      setIframeKey((k) => k + 1);
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  /* ─── Undo: Revert a slot back to original ─── */
  const handleUndo = async (position: number) => {
    if (!mapping) return;
    try {
      const res = await fetch(`/api/image-mapper/save/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          expectedVersion: mapping.lastUpdated,
          imageUpdate: {
            position,
            replacementUrl: null,
            status: "needs-replacement",
          },
        }),
      });
      if (res.status === 409) { alert("Conflict — mapping was modified by another session. Refreshing..."); window.location.reload(); return; }
      const data = await res.json();
      if (data.mapping) setMapping(data.mapping);
      setIframeKey((k) => k + 1);
    } catch (err) {
      console.error("Undo failed:", err);
    }
  };

  /* ─── Drag & Drop: Save replacement on drop ─── */
  const handleDrop = async (position: number, replacementUrl: string) => {
    if (!mapping) return;
    setDragOverPosition(null);
    setIsDragging(false);
    try {
      const res = await fetch(`/api/image-mapper/save/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          expectedVersion: mapping.lastUpdated,
          imageUpdate: {
            position,
            replacementUrl,
            status: "replaced",
          },
        }),
      });
      if (res.status === 409) { alert("Conflict — mapping was modified by another session. Refreshing..."); window.location.reload(); return; }
      const data = await res.json();
      if (data.mapping) setMapping(data.mapping);
      // Refresh the preview iframe so it picks up the new image
      setIframeKey((k) => k + 1);
    } catch (err) {
      console.error("Drop assign failed:", err);
    }
  };

  /* ─── File Upload (for Upload tab) ─── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImages((prev) => [
          ...prev,
          { url: reader.result as string, name: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  /* ─── Load saved fallbacks from localStorage ─── */
  useEffect(() => {
    if (!category) return;
    try {
      const saved = localStorage.getItem(`bluejays-fallbacks-${category}`);
      if (saved) {
        const parsed = JSON.parse(saved) as FallbackSlot[];
        if (parsed.length > 0) {
          setCategoryFallbacks(parsed);
        }
      }
    } catch { /* ignore */ }
  }, [category]);

  /* ─── Save fallbacks to localStorage immediately ─── */
  const saveFallbacks = useCallback(
    (slots: FallbackSlot[]) => {
      if (!category) return;
      try {
        localStorage.setItem(`bluejays-fallbacks-${category}`, JSON.stringify(slots));
      } catch { /* ignore */ }
    },
    [category]
  );

  /* ─── Fallback Slot Upload ─── */
  const handleFallbackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || activeFallbackSlot === null) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setCategoryFallbacks((prev) => {
        const updated = prev.map((slot, i) =>
          i === activeFallbackSlot ? { ...slot, url: reader.result as string } : slot
        );
        saveFallbacks(updated);
        return updated;
      });
      setActiveFallbackSlot(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ─── Progress ─── */
  const mappedCount =
    mapping?.images.filter(
      (img) => img.status === "replaced" || img.status === "keep-original"
    ).length ?? 0;
  const totalCount = mapping?.images.length ?? 0;

  /* ─── Library images for category (normalize to lowercase, try variations) ─── */
  const normalizedCategory = (category || "").toLowerCase().trim();
  const libraryImages = THEME_LIBRARY[normalizedCategory]
    || THEME_LIBRARY[normalizedCategory.replace(/s$/, "")] // "plumbing" → try "plumbing" then strip trailing s
    || THEME_LIBRARY[normalizedCategory.replace(/ing$/, "er")] // "plumbing" → "plumber"
    || THEME_LIBRARY["dental"]
    || [];

  /* ─── Drag event helpers for source images ─── */
  const onDragStartHandler = (e: React.DragEvent, imageUrl: string) => {
    e.dataTransfer.setData("text/plain", imageUrl);
    e.dataTransfer.effectAllowed = "copy";
    setIsDragging(true);
  };

  const onDragEndHandler = () => {
    setIsDragging(false);
    setDragOverPosition(null);
  };

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
          <span className="text-white/50 text-sm">Loading image map...</span>
        </div>
      </div>
    );
  }

  /* ─── Main Render ─── */
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={fallbackInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFallbackUpload}
      />

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push("/image-mapper")}
              className="shrink-0 px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              &larr; Back
            </button>
            {prevProspect && (
              <button
                onClick={() => router.push(`/image-mapper/${prevProspect.id}`)}
                className="shrink-0 px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                ‹ Prev
              </button>
            )}
            {nextProspect && (
              <button
                onClick={() => router.push(`/image-mapper/${nextProspect.id}`)}
                className="shrink-0 px-3 py-1.5 text-sm rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors font-medium"
              >
                Next →
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold truncate">
                  {prospect?.businessName || "Unknown Business"}
                </h1>
                {allProspects.length > 0 && currentIndex >= 0 && (
                  <span className="text-xs text-white/30 shrink-0">{currentIndex + 1}/{allProspects.length}</span>
                )}
              </div>
              {mapping?.websiteUrl && (
                <a
                  href={mapping.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 truncate block"
                >
                  {mapping.websiteUrl}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {mapping && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {mappedCount}/{totalCount} mapped
                </span>
              </div>
            )}
            <button
              onClick={scanWebsite}
              disabled={scanning}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {scanning ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </span>
              ) : mapping ? (
                "Re-scan"
              ) : (
                "Scan Website"
              )}
            </button>
            {mapping && mapping.selectionStatus !== "completed" && (
              <button
                onClick={async () => {
                  if (!mapping) return;
                  const updated = mapping.images.map((img) => ({
                    ...img,
                    status: "keep-original" as const,
                  }));
                  setMapping({ ...mapping, images: updated, selectionStatus: "completed" });
                  // Save directly to prospect scrapedData via prospects API
                  const res = await fetch(`/api/prospects/${id}`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      scrapedData: {
                        imageMapping: {
                          ...mapping,
                          images: updated,
                          selectionStatus: "completed",
                          lastUpdated: new Date().toISOString(),
                        },
                      },
                    }),
                  });
                  if (res.ok) {
                    alert("Images marked as complete!");
                  } else {
                    alert("Save failed — try again");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
              >
                Force Complete ✓
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── No Mapping Yet ─── */}
      {!mapping && (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No images scanned yet</h2>
          <p className="text-white/50 mb-6 max-w-md">
            Click &ldquo;Scan Website&rdquo; to extract all images from this business&apos;s website and start mapping replacements.
          </p>
          <button
            onClick={scanWebsite}
            disabled={scanning}
            className="px-6 py-3 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {scanning ? "Scanning..." : "Scan Website"}
          </button>
        </div>
      )}

      {/* ─── Main Layout: Left (Image List) | Right (Library + Preview) ─── */}
      {mapping && (
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex gap-6" style={{ minHeight: "calc(100vh - 120px)" }}>

            {/* ════════════════════════════════════════════════ */}
            {/* LEFT PANEL: Numbered Image List with Drop Targets */}
            {/* ════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Image Mapping
                  </h2>
                  <span className="text-xs text-white/40">{totalCount} images found</span>
                </div>

                {/* Column headers */}
                <div className="px-5 py-2 border-b border-white/5 grid grid-cols-[40px_80px_1fr_32px_80px_120px] gap-3 items-center text-[10px] uppercase tracking-wider text-white/30 font-medium">
                  <span>#</span>
                  <span>Their Image</span>
                  <span>Location</span>
                  <span></span>
                  <span>Replacement</span>
                  <span>Status</span>
                </div>

                <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
                  {mapping.images.map((img) => {
                    const sc = statusColor(img.status);
                    const isDropTarget = dragOverPosition === img.position;

                    return (
                      <div
                        key={img.position}
                        className={`border-b border-white/5 last:border-b-0 transition-colors ${dragOverPosition === img.position ? "bg-blue-400/5" : ""}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "copy";
                          setDragOverPosition(img.position);
                        }}
                        onDragLeave={() => setDragOverPosition(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          const url = e.dataTransfer.getData("text/plain");
                          if (url) handleDrop(img.position, url);
                          setDragOverPosition(null);
                        }}
                      >
                        {/* Main row — single image that IS the drop target */}
                        <div className="px-4 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                          {/* Position number */}
                          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                            {img.position}
                          </div>

                          {/* THE image — drop here to replace it inline */}
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.dataTransfer.dropEffect = "copy";
                              setDragOverPosition(img.position);
                            }}
                            onDragLeave={(e) => {
                              e.stopPropagation();
                              setDragOverPosition(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const url = e.dataTransfer.getData("text/plain");
                              if (url) handleDrop(img.position, url);
                              setDragOverPosition(null);
                            }}
                            className={`relative w-28 h-20 rounded-lg overflow-hidden shrink-0 transition-all ${
                              isDropTarget
                                ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0a1520] scale-105"
                                : isDragging
                                  ? "ring-1 ring-dashed ring-white/30"
                                  : img.status === "replaced"
                                    ? "ring-2 ring-emerald-500/50"
                                    : "ring-1 ring-white/10"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={(() => {
                                const url = img.replacementUrl || img.originalUrl;
                                return url.startsWith("data:") ? url : proxyUrl(url);
                              })()}
                              alt={`${img.location}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {isDropTarget && (
                              <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                <span className="text-xs font-bold text-white drop-shadow-md">Drop here</span>
                              </div>
                            )}
                            {img.status === "replaced" && !isDropTarget && (
                              <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                          </div>

                          {/* Location label */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white/70 truncate">{img.location}</p>
                            <p className="text-[10px] text-white/30 truncate">
                              {img.status === "replaced" ? "Swapped ✓" : img.status === "keep-original" ? "Keeping original" : "Drag image here to replace"}
                            </p>
                          </div>

                          {/* Undo button — only when replaced */}
                          {img.status === "replaced" && (
                            <button
                              onClick={() => handleUndo(img.position)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors shrink-0 cursor-pointer"
                              title="Undo — revert to original image"
                            >
                              Undo
                            </button>
                          )}
                          {/* Keep button — only when not replaced */}
                          {img.status !== "replaced" && (
                            <button
                              onClick={() => toggleKeepOriginal(img.position)}
                              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                                img.status === "keep-original"
                                  ? "border-blue-500 text-blue-400 bg-blue-500/10"
                                  : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                              }`}
                            >
                              {img.status === "keep-original" ? "Kept ✓" : "Keep"}
                            </button>
                          )}
                        </div>

                        {/* Notes — always visible, autosaves silently */}
                        <div className="px-4 pb-3">
                          <input
                            type="text"
                            defaultValue={img.notes || ""}
                            onBlur={(e) => { if (e.target.value !== (img.notes || "")) saveNote(img.position, e.target.value); }}
                            placeholder="Notes..."
                            className="w-full bg-transparent border-0 border-b border-white/5 px-0 py-1 text-[11px] text-white/50 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:text-white/70"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════ */}
            {/* RIGHT PANEL: Library + Preview */}
            {/* ════════════════════════════════════════════════ */}
            <div className="w-[420px] shrink-0 flex flex-col gap-6">

              {/* ─── Replacement Library ─── */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="px-5 py-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Replacement Library
                    </h2>
                  </div>

                  {/* Tab switcher */}
                  <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5">
                    {(["library", "upload", "fallbacks"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setRightTab(tab)}
                        className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                          rightTab === tab
                            ? "bg-white/10 text-white font-medium"
                            : "text-white/40 hover:text-white/60"
                        }`}
                      >
                        {tab === "library" ? "Theme Library" : tab === "upload" ? "Upload" : "Fallbacks"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* ─── Theme Library Tab ─── */}
                  {rightTab === "library" && (
                    <div>
                      <p className="text-[11px] text-white/40 mb-3">
                        Drag any image below onto a slot on the left to assign it as a replacement.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {libraryImages.map((libImg) => (
                          <div
                            key={libImg.name}
                            draggable
                            onDragStart={(e) => onDragStartHandler(e, libImg.url)}
                            onDragEnd={onDragEndHandler}
                            className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 cursor-grab active:cursor-grabbing hover:border-white/30 transition-all hover:scale-[1.02]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={proxyUrl(libImg.url)}
                              alt={libImg.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                              <p className="text-[9px] text-white/80 truncate">{libImg.name}</p>
                            </div>
                            {/* Drag hint */}
                            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <span className="text-[10px] font-medium text-white bg-black/50 px-2 py-0.5 rounded">
                                Drag me
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ─── Upload Tab ─── */}
                  {rightTab === "upload" && (
                    <div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full mb-4 px-4 py-3 rounded-xl border-2 border-dashed border-white/20 hover:border-blue-400 hover:bg-blue-400/5 transition-colors text-sm text-white/50 hover:text-blue-400"
                      >
                        + Upload Images
                      </button>

                      <p className="text-[10px] text-white/30 mt-2">Images are saved permanently when you drag them to a slot on the left.</p>
                      {uploadedImages.length === 0 ? (
                        <p className="text-center text-xs text-white/30 py-8">
                          No custom images uploaded yet. Click above to add some.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedImages.map((uImg, i) => (
                            <div
                              key={`${uImg.name}-${i}`}
                              draggable
                              onDragStart={(e) => onDragStartHandler(e, uImg.url)}
                              onDragEnd={onDragEndHandler}
                              className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 cursor-grab active:cursor-grabbing hover:border-white/30 transition-all hover:scale-[1.02]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={uImg.url}
                                alt={uImg.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                                <p className="text-[9px] text-white/80 truncate">{uImg.name}</p>
                              </div>
                              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="text-[10px] font-medium text-white bg-black/50 px-2 py-0.5 rounded">
                                  Drag me
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Category Fallbacks Tab ─── */}
                  {rightTab === "fallbacks" && (
                    <div>
                      <p className="text-[11px] text-white/40 mb-3">
                        Upload category-specific fallback images. Each slot becomes draggable once filled.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {categoryFallbacks.map((slot, i) => (
                          <div key={slot.label} className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-white/40 font-mono truncate">{slot.label}</span>
                            {slot.url ? (
                              <div
                                draggable
                                onDragStart={(e) => onDragStartHandler(e, slot.url!)}
                                onDragEnd={onDragEndHandler}
                                className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 cursor-grab active:cursor-grabbing hover:border-white/30 transition-all"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={slot.url}
                                  alt={slot.label}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() =>
                                    setCategoryFallbacks((prev) =>
                                      prev.map((s, idx) => (idx === i ? { ...s, url: null } : s))
                                    )
                                  }
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[10px] hover:bg-red-500"
                                >
                                  x
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveFallbackSlot(i);
                                  fallbackInputRef.current?.click();
                                }}
                                className="aspect-[4/3] rounded-lg border-2 border-dashed border-white/15 hover:border-blue-400 hover:bg-blue-400/5 transition-colors flex items-center justify-center"
                              >
                                <span className="text-[10px] text-white/30">+ Upload</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Preview Iframe ─── */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white/70">Live Preview</h3>
                  <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5">
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${
                        previewMode === "desktop"
                          ? "bg-white/10 text-white"
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${
                        previewMode === "mobile"
                          ? "bg-white/10 text-white"
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>
                <div className="bg-black rounded-b-xl overflow-hidden relative" style={{ height: 350 }}>
                  <div
                    style={
                      previewMode === "mobile"
                        ? {
                            width: 375,
                            height: 700,
                            transform: "scale(0.45)",
                            transformOrigin: "top left",
                          }
                        : {
                            width: 1280,
                            height: 700,
                            transform: "scale(0.32)",
                            transformOrigin: "top left",
                          }
                    }
                  >
                    <iframe
                      key={iframeKey}
                      ref={iframeRef}
                      src={`/preview/${id}?_t=${iframeKey}`}
                      className="w-full h-full border-0"
                      title="Site Preview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom navigation bar */}
      {allProspects.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-md border-t border-white/10 px-6 py-3">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <button
              onClick={() => prevProspect && router.push(`/image-mapper/${prevProspect.id}`)}
              disabled={!prevProspect}
              className="px-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              ← Previous Lead
            </button>
            <span className="text-xs text-white/40">
              {currentIndex + 1} of {allProspects.length} leads
            </span>
            <button
              onClick={() => nextProspect && router.push(`/image-mapper/${nextProspect.id}`)}
              disabled={!nextProspect}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Next Lead →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
