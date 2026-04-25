"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ImageSlot, ImageMapping } from "@/lib/image-mapper-store";
import { getFontOptions } from "@/lib/typography";

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
    { url: "https://images.unsplash.com/photo-1760331840361-d751cfc1becf?w=800&q=80", name: "roof-repair" },
    { url: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80", name: "metal-roof" },
    { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", name: "new-construction" },
    { url: "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?w=800&q=80", name: "roofing-team" },

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
    { url: "https://images.unsplash.com/photo-1507494924047-60b8ee826ca9?w=800&q=80", name: "light-install" },
    { url: "https://images.unsplash.com/photo-1597502310092-31cdaa35b46d?w=800&q=80", name: "worker-helmet" },
    { url: "https://images.unsplash.com/photo-1581972327480-e3764d31e5e6?w=800&q=80", name: "components" },
    { url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80", name: "hard-hat-worker" },

  ],
  plumber: [
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", name: "plumber-tool" },
    { url: "https://images.unsplash.com/photo-1542013936693-884638332954?w=800&q=80", name: "faucet-fixture" },
    { url: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80", name: "plumbing-tools" },
    { url: "https://images.unsplash.com/photo-1521207418485-99c705420785?w=800&q=80", name: "kitchen-faucet" },
    { url: "https://images.unsplash.com/photo-1640682841767-cdfce3aea6e0?w=800&q=80", name: "wrench-set" },
    { url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&q=80", name: "bathroom-faucet" },
    { url: "https://images.unsplash.com/photo-1669920282730-ab422e592f97?w=800&q=80", name: "running-water" },
    { url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80", name: "plumber-work" },
    { url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80", name: "pipe-fitting" },

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
    { url: "https://images.unsplash.com/photo-1566917064245-1c6bff30dbf1?w=800&q=80", name: "outdoor-ac" },
    { url: "https://images.unsplash.com/photo-1558358235-a0a93f68a52c?w=800&q=80", name: "air-vent" },
    { url: "https://images.unsplash.com/photo-1698479603408-1a66a6d9e80f?w=800&q=80", name: "commercial-ac" },
    { url: "https://images.unsplash.com/photo-1615309662243-70f6df917b59?w=800&q=80", name: "ductwork" },
    { url: "https://images.unsplash.com/photo-1718203862467-c33159fdc504?w=800&q=80", name: "wall-ac" },
    { url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80", name: "smart-thermostat" },
    { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80", name: "ac-units" },
    { url: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=800&q=80", name: "thermostat-ctrl" },
    { url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80", name: "exhaust-fan" },

  ],
  cleaning: [
    { url: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&q=80", name: "cleaning-counter" },
    { url: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&q=80", name: "spray-bottles" },
    { url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80", name: "tidy-room" },
    { url: "https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?w=800&q=80", name: "clean-bathroom" },
    { url: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=800&q=80", name: "supplies" },
    { url: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=800&q=80", name: "mop-floor" },
    { url: "https://images.unsplash.com/photo-1583845112239-97ef1341b271?w=800&q=80", name: "vacuuming" },
    { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80", name: "clean-kitchen" },
  ],
  landscaping: [
    { url: "https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=800&q=80", name: "flower-bed" },
    { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80", name: "backyard-lawn" },
    { url: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80", name: "patio-design" },
    { url: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&q=80", name: "garden-path" },
    { url: "https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=800&q=80", name: "outdoor-lighting" },
    { url: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&q=80", name: "hedge-trimming" },
    { url: "https://images.unsplash.com/photo-1560749003-f4b1e17e2dff?w=800&q=80", name: "stone-pathway" },
    { url: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&q=80", name: "water-feature" },
    { url: "https://images.unsplash.com/photo-1598902108854-10e335adac99?w=800&q=80", name: "landscape-view" },

  ],
  "law-firm": [
    { url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80", name: "law-library" },
    { url: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&q=80", name: "courthouse" },
    { url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80", name: "legal-docs" },
    { url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80", name: "office-meeting" },
    { url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80", name: "conference-room" },
    { url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80", name: "professional" },
    { url: "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=800&q=80", name: "business-portrait" },
    { url: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80", name: "scales-justice" },
    { url: "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=800&q=80", name: "gavel" },

  ],
  insurance: [
    { url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80", name: "consultation" },
    { url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80", name: "home-protected" },
    { url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80", name: "agent" },
    { url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80", name: "happy-family" },
    { url: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?w=800&q=80", name: "family-protect" },
    { url: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80", name: "doc-signing" },
    { url: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&q=80", name: "property" },
    { url: "https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=800&q=80", name: "car-road" },
    { url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80", name: "health-coverage" },

  ],
  accounting: [
    { url: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=800&q=80", name: "calculator" },
    { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80", name: "team-meeting" },
    { url: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80", name: "charts" },
    { url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80", name: "tax-forms" },
    { url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80", name: "spreadsheet" },
    { url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80", name: "professional" },
    { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", name: "office-building" },
    { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", name: "laptop-work" },
    { url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80", name: "data-analysis" },
  ],
  chiropractic: [
    { url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80", name: "back-treatment" },
    { url: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80", name: "consultation" },
    { url: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&q=80", name: "massage" },
    { url: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&q=80", name: "clinic-interior" },
    { url: "https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=800&q=80", name: "stretching" },
    { url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80", name: "yoga-wellness" },
    { url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80", name: "meditation" },
    { url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80", name: "therapy-room" },
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
    { url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80", name: "car-lift" },
    { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&q=80", name: "oil-change" },
  ],
  "real-estate": [
    { url: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80", name: "luxury-home" },
    { url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80", name: "open-house" },
    { url: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&q=80", name: "kitchen-staged" },
    { url: "https://images.unsplash.com/photo-1560449752-8b6023e2ab5a?w=800&q=80", name: "living-staged" },
    { url: "https://images.unsplash.com/photo-1613849925352-96348d26bc51?w=800&q=80", name: "modern-bath" },
    { url: "https://images.unsplash.com/photo-1564343128896-3ffbcf9439e5?w=800&q=80", name: "showing-home" },
    { url: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80", name: "aerial-view" },
    { url: "https://images.unsplash.com/photo-1604882234072-d5741489e0c0?w=800&q=80", name: "front-porch" },
    { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", name: "for-sale-sign" },

  ],
  photography: [
    { url: "https://images.unsplash.com/photo-1504202654196-f6a71d98dc01?w=800&q=80", name: "camera-closeup" },
    { url: "https://images.unsplash.com/photo-1627913759066-2f62eb9bbaa4?w=800&q=80", name: "wedding" },
    { url: "https://images.unsplash.com/photo-1497881807663-38b9a95b7192?w=800&q=80", name: "portrait" },
    { url: "https://images.unsplash.com/photo-1553614186-a373dedbb390?w=800&q=80", name: "studio-light" },
    { url: "https://images.unsplash.com/photo-1642322430525-41043cf3e99b?w=800&q=80", name: "landscape" },
    { url: "https://images.unsplash.com/photo-1601228552459-f648744df0d4?w=800&q=80", name: "event-photo" },
    { url: "https://images.unsplash.com/photo-1610901144642-231342332fb4?w=800&q=80", name: "newborn" },
    { url: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80", name: "couple-shoot" },
    { url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80", name: "editing" },

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
    { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", name: "accent-wall" },

  ],
  "general-contractor": [
    { url: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=800&q=80", name: "construction" },
    { url: "https://images.unsplash.com/photo-1656956479776-637a2d453e7e?w=800&q=80", name: "framing" },
    { url: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=800&q=80", name: "blueprints" },
    { url: "https://images.unsplash.com/photo-1553946550-4b8f3eea5451?w=800&q=80", name: "hardhat-worker" },
    { url: "https://images.unsplash.com/photo-1575281923032-f40d94ef6160?w=800&q=80", name: "kitchen-build" },
    { url: "https://images.unsplash.com/photo-1503594384566-461fe158e797?w=800&q=80", name: "renovation" },
    { url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80", name: "finished-remodel" },
    { url: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80", name: "power-tools" },
    { url: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80", name: "bath-renovation" },

  ],
  moving: [
    { url: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=800&q=80", name: "cardboard-boxes" },
    { url: "https://images.unsplash.com/photo-1577702312572-5bb9328a9f15?w=800&q=80", name: "packing-tape" },
    { url: "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?w=800&q=80", name: "loading-dolly" },
    { url: "https://images.unsplash.com/photo-1581573796233-13d3d9cbefd7?w=800&q=80", name: "family-moving" },
    { url: "https://images.unsplash.com/photo-1581573950452-5a438c5f390f?w=800&q=80", name: "moving-truck" },
    { url: "https://images.unsplash.com/photo-1614359835514-92f8ba196357?w=800&q=80", name: "new-home-keys" },
    { url: "https://images.unsplash.com/photo-1624137527136-66e631bdaa0e?w=800&q=80", name: "bubble-wrap" },
    { url: "https://images.unsplash.com/photo-1601467995997-ac1ae9a8fff4?w=800&q=80", name: "empty-apartment" },
    { url: "https://images.unsplash.com/photo-1580709839515-54b8991e2813?w=800&q=80", name: "stacked-boxes" },

  ],
  "pest-control": [
    { url: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&q=80", name: "tech-spraying" },
    { url: "https://images.unsplash.com/photo-1558983925-ea9372bf2ba0?w=800&q=80", name: "ant-closeup" },
    { url: "https://images.unsplash.com/photo-1587829166062-cae2a11cb521?w=800&q=80", name: "termite-damage" },
    { url: "https://images.unsplash.com/photo-1540366244940-9dce0a570312?w=800&q=80", name: "clean-yard" },
    { url: "https://images.unsplash.com/photo-1572731561221-96d988d74dc9?w=800&q=80", name: "protective-gear" },
    { url: "https://images.unsplash.com/photo-1591735115730-4bf3a351cfe8?w=800&q=80", name: "crawl-space" },
    { url: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80", name: "home-inspection" },
    { url: "https://images.unsplash.com/photo-1632571401005-458e9d244591?w=800&q=80", name: "rodent-trap" },
    { url: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80", name: "pest-free-home" },

  ],
  "carpet-cleaning": [
    { url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80", name: "carpet-clean" },
    { url: "https://images.unsplash.com/photo-1558944351-3f79926e74ef?w=800&q=80", name: "steam-machine" },
    { url: "https://images.unsplash.com/photo-1534889156217-d643df14f14a?w=800&q=80", name: "before-after" },
    { url: "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=800&q=80", name: "stain-removal" },
    { url: "https://images.unsplash.com/photo-1527515673510-8aa78ce21f9b?w=800&q=80", name: "upholstery" },
    { url: "https://images.unsplash.com/photo-1546550879-3b71f2427ae0?w=800&q=80", name: "rug-cleaning" },
    { url: "https://images.unsplash.com/photo-1496093044462-e7ee398276c9?w=800&q=80", name: "clean-carpet" },
    { url: "https://images.unsplash.com/photo-1549637642-90187f64f420?w=800&q=80", name: "fresh-floor" },
    { url: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80", name: "pro-equipment" },

  ],
  "physical-therapy": [
    { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", name: "stretching" },
    { url: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&q=80", name: "exercise-ball" },
    { url: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&q=80", name: "pt-equipment" },
    { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80", name: "yoga-stretch" },
    { url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80", name: "recovery" },
    { url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80", name: "weights" },
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
    { url: "https://images.unsplash.com/photo-1542727313-4f3e99aa2568?w=800&q=80", name: "arm-tattoo" },

  ],
  church: [
    { url: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&q=80", name: "church-interior" },
    { url: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80", name: "worship-service" },
    { url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80", name: "community-gathering" },
    { url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80", name: "church-exterior" },
    { url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80", name: "stained-glass" },
    { url: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&q=80", name: "fellowship-hall" },
    { url: "https://images.unsplash.com/photo-1505455184862-554165e5f6ba?w=800&q=80", name: "bible-study" },
    { url: "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=800&q=80", name: "choir" },

  ],
  daycare: [
    { url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80", name: "children-playing" },
    { url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&q=80", name: "playground" },
    { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80", name: "classroom" },
    { url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80", name: "reading-time" },
    { url: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800&q=80", name: "outdoor-play" },
    { url: "https://images.unsplash.com/photo-1587616211892-f743fcca64f9?w=800&q=80", name: "art-activities" },
    { url: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80", name: "nap-room" },

  ],
  florist: [
    { url: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80", name: "flower-arrangement" },
    { url: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80", name: "bouquet" },
    { url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80", name: "flower-shop" },
    { url: "https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=800&q=80", name: "roses" },
    { url: "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800&q=80", name: "wedding-flowers" },
    { url: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80", name: "floral-display" },
    { url: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80", name: "wreath" },
    { url: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=800&q=80", name: "delivery" },
    { url: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80", name: "potted-plants" },

  ],
  "med-spa": [
    { url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80", name: "facial-treatment" },
    { url: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80", name: "spa-room" },
    { url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80", name: "skincare-products" },
    { url: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800&q=80", name: "laser-equipment" },
    { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80", name: "relaxation-area" },
    { url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80", name: "consultation" },
    { url: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800&q=80", name: "spa-interior" },
    { url: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80", name: "treatment-bed" },
    { url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80", name: "injectable-treatment" },

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
    { url: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&q=80", name: "belt-ceremony" },
    { url: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&q=80", name: "instructor-teaching" },

  ],
  "pool-spa": [
    { url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80", name: "swimming-pool" },
    { url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80", name: "pool-maintenance" },
    { url: "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800&q=80", name: "hot-tub" },
    { url: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800&q=80", name: "pool-cleaning" },
    { url: "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&q=80", name: "pool-equipment" },

  ],
  catering: [
    { url: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80", name: "buffet-setup" },
    { url: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800&q=80", name: "catering-team" },
    { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80", name: "food-display" },
    { url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80", name: "event-table" },
    { url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80", name: "chef-preparing" },
    { url: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800&q=80", name: "appetizer-tray" },
    { url: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80", name: "wedding-reception-food" },
    { url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", name: "dessert-table" },
    { url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80", name: "serving" },
  ],
  "event-planning": [
    { url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80", name: "decorated-venue" },
    { url: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&q=80", name: "corporate-event" },
    { url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80", name: "party-decorations" },
    { url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80", name: "lighting-design" },
    { url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80", name: "stage-setup" },
    { url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80", name: "wedding-setup" },
    { url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80", name: "table-centerpiece" },
    { url: "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80", name: "outdoor-tent" },
    { url: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80", name: "balloon-arch" },

  ],
  fencing: [
    { url: "https://images.unsplash.com/photo-1673967683504-d23d3ab5b011?w=800&q=80", name: "wooden-fence" },
    { url: "https://images.unsplash.com/photo-1722881445875-bdd5f4d9e6fa?w=800&q=80", name: "iron-gate" },
    { url: "https://images.unsplash.com/photo-1722881445331-0686d389c6b0?w=800&q=80", name: "chain-link-fence" },
    { url: "https://images.unsplash.com/photo-1760706827852-e15cdf3fe68e?w=800&q=80", name: "vinyl-fence" },
    { url: "https://images.unsplash.com/photo-1740482682683-309e6fb4898f?w=800&q=80", name: "fence-post" },
    { url: "https://images.unsplash.com/photo-1769831190663-95fe8454d8c9?w=800&q=80", name: "garden-gate" },
    { url: "https://images.unsplash.com/photo-1748908271592-d9d5690b288b?w=800&q=80", name: "fence-repair" },
    { url: "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&q=80", name: "fence-installation" },
    { url: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800&q=80", name: "privacy-fence" },

  ],
  "garage-door": [
    { url: "https://images.unsplash.com/photo-1647843097965-3686dadb7b84?w=800&q=80", name: "garage-door-exterior" },
    { url: "https://images.unsplash.com/photo-1605146768851-eda79da39897?w=800&q=80", name: "garage-opener" },
    { url: "https://images.unsplash.com/photo-1540476547779-348beb642680?w=800&q=80", name: "garage-interior" },
    { url: "https://images.unsplash.com/photo-1635108199445-ab9f516646e2?w=800&q=80", name: "door-repair" },
    { url: "https://images.unsplash.com/photo-1541737949652-27149c8e786d?w=800&q=80", name: "new-installation" },
    { url: "https://images.unsplash.com/photo-1696992812596-3c0d4d2d1299?w=800&q=80", name: "spring-mechanism" },
    { url: "https://images.unsplash.com/photo-1609915395444-e9632e899ad9?w=800&q=80", name: "carriage-style" },
    { url: "https://images.unsplash.com/photo-1628744448839-a475cc0e90c3?w=800&q=80", name: "modern-garage" },
    { url: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80", name: "insulated-door" },

  ],
  locksmith: [
    { url: "https://images.unsplash.com/photo-1654944932733-bca31b703dd7?w=800&q=80", name: "key-cutting" },
    { url: "https://images.unsplash.com/photo-1588568506947-a8bbc511bfb3?w=800&q=80", name: "door-lock" },
    { url: "https://images.unsplash.com/photo-1605858286629-4268180c482b?w=800&q=80", name: "car-lockout" },
    { url: "https://images.unsplash.com/photo-1600414428637-7ee47eb95dad?w=800&q=80", name: "key-set" },
    { url: "https://images.unsplash.com/photo-1681833375133-3cf8a514d6b3?w=800&q=80", name: "deadbolt" },
    { url: "https://images.unsplash.com/photo-1619659741578-3e98742f4ad9?w=800&q=80", name: "padlock" },
    { url: "https://images.unsplash.com/photo-1585914641050-fa9883c4e21c?w=800&q=80", name: "security-system" },
    { url: "https://images.unsplash.com/photo-1752346800862-252719b8315d?w=800&q=80", name: "lock-repair" },
    { url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80", name: "locksmith-tools" },

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
    { url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80", name: "clinic-exterior" },

  ],
  painting: [
    // Visually verified 2026-04-17 — these photos actually show their subject.
    // Removed 6 slots where the Unsplash photo didn't match its label
    // (paint-cans was a shoe, accent-wall was a motorcycle wheel, trim-work
    // was flowers, interior-painting was a building exterior, exterior-painting
    // was a chair, painter-on-ladder was a gray texture). Re-add from the
    // Upload tab with verified painting photos when needed.
    { url: "https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?w=800&q=80", name: "house-painting" },
    { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", name: "paint-roller" },
    { url: "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&q=80", name: "color-samples" },

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
    { url: "https://images.unsplash.com/photo-1720478664465-4dc6c66e4f6a?w=800&q=80", name: "driveway-cleaning" },
    { url: "https://images.unsplash.com/photo-1605146768851-eda79da39897?w=800&q=80", name: "deck-cleaning" },
    { url: "https://images.unsplash.com/photo-1586501599751-58c582c907d7?w=800&q=80", name: "concrete-cleaning" },
    { url: "https://images.unsplash.com/photo-1664840951038-caf513bcc639?w=800&q=80", name: "equipment" },
    { url: "https://images.unsplash.com/photo-1663832871970-ce04419ea2ee?w=800&q=80", name: "commercial-cleaning" },
    { url: "https://images.unsplash.com/photo-1588111817213-1a12f73fbf20?w=800&q=80", name: "fence-washing" },
    { url: "https://images.unsplash.com/photo-1523413555809-0fb1d4da238d?w=800&q=80", name: "pressure-washer-action" },
    { url: "https://images.unsplash.com/photo-1582559934353-2e47140e7501?w=800&q=80", name: "siding-wash" },
    { url: "https://images.unsplash.com/photo-1528238646472-f2366160b6c1?w=800&q=80", name: "before-after-surface" },

  ],
  towing: [
    { url: "https://images.unsplash.com/photo-1686966933735-305bd8fe0a77?w=800&q=80", name: "tow-truck" },
    { url: "https://images.unsplash.com/photo-1730514784243-f0e7f09c9f50?w=800&q=80", name: "flatbed" },
    { url: "https://images.unsplash.com/photo-1730514785075-b065c757b653?w=800&q=80", name: "roadside-assistance" },
    { url: "https://images.unsplash.com/photo-1601508836900-ee2aa7840a7b?w=800&q=80", name: "tire-change" },
    { url: "https://images.unsplash.com/photo-1644503584825-91dfe48edca6?w=800&q=80", name: "tow-driver" },
    { url: "https://images.unsplash.com/photo-1655220711988-430a51a5c254?w=800&q=80", name: "recovery" },
    { url: "https://images.unsplash.com/photo-1611083497391-971ad20e269a?w=800&q=80", name: "breakdown" },
    { url: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80", name: "car-being-towed" },
    { url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80", name: "jump-start" },

  ],
  "tree-service": [
    { url: "https://images.unsplash.com/photo-1754321895426-68b04ba453e3?w=800&q=80", name: "tree-trimming" },
    { url: "https://images.unsplash.com/photo-1754321902809-5c21cbc67228?w=800&q=80", name: "arborist-climbing" },
    { url: "https://images.unsplash.com/photo-1754321871548-61bdbc6f1506?w=800&q=80", name: "chainsaw-work" },
    { url: "https://images.unsplash.com/photo-1585952749437-d3bc7940958a?w=800&q=80", name: "tree-removal" },
    { url: "https://images.unsplash.com/photo-1701463917023-5cf7d9ebce19?w=800&q=80", name: "stump-grinding" },
    { url: "https://images.unsplash.com/photo-1631300313270-227604e71ea5?w=800&q=80", name: "pruning" },
    { url: "https://images.unsplash.com/photo-1626328996681-80608e0240a0?w=800&q=80", name: "bucket-truck" },
    { url: "https://images.unsplash.com/photo-1631243302248-6d36b56bdad8?w=800&q=80", name: "wood-chips" },
    { url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80", name: "fallen-tree" },

  ],
  tutoring: [
    { url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80", name: "student-studying" },
    { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", name: "tutor-with-student" },
    { url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80", name: "classroom" },
    { url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80", name: "books-and-laptop" },
    { url: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&q=80", name: "online-tutoring" },
    { url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80", name: "study-group" },
    { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80", name: "library" },
  ],
  "junk-removal": [
    { url: "https://images.unsplash.com/photo-1625339726184-015da09f775c?w=800&q=80", name: "dumpster" },
    { url: "https://images.unsplash.com/photo-1707050446211-05da5e5fedde?w=800&q=80", name: "hauling-truck" },
    { url: "https://images.unsplash.com/photo-1715541275956-4845a5cf74c1?w=800&q=80", name: "garage-cleanout" },
    { url: "https://images.unsplash.com/photo-1661554740230-6cb1749eaedb?w=800&q=80", name: "debris-removal" },
    { url: "https://images.unsplash.com/photo-1697993131332-dea7c4771d4a?w=800&q=80", name: "furniture-removal" },
    { url: "https://images.unsplash.com/photo-1653862756538-57197fd1c1b7?w=800&q=80", name: "cleanup-crew" },
    { url: "https://images.unsplash.com/photo-1608283833033-d16f4d83ac85?w=800&q=80", name: "before-after-space" },
    { url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80", name: "recycling" },
    { url: "https://images.unsplash.com/photo-1662826479300-6cc4ced8a1cc?w=800&q=80", name: "estate-cleanout" },
  ],
  "appliance-repair": [
    { url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80", name: "washing-machine" },
    { url: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80", name: "refrigerator-repair" },
    { url: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80", name: "oven-service" },
    { url: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80", name: "dishwasher" },
    { url: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&q=80", name: "dryer-repair" },
    { url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80", name: "kitchen-appliances" },
    { url: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80", name: "technician-working" },

  ],
  construction: [
    { url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80", name: "construction-site" },
    { url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80", name: "crane" },
    { url: "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=800&q=80", name: "framing" },
    { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", name: "concrete-pour" },
    { url: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=80", name: "hard-hats" },

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
  const [rightTab, setRightTab] = useState<"library" | "upload" | "fallbacks" | "typography" | "theme">("library");
  const [selectedFont, setSelectedFont] = useState(0);
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
    // Load all prospects for next/prev navigation. Sort the list so the
    // editor walks unfinished leads (oldest first) before any completed
    // ones — same ordering as the /image-mapper list page. Without this
    // the editor would step through prospects in the API's raw order,
    // dropping the operator into completed leads they've already done.
    fetch("/api/prospects?limit=500", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (!data.prospects) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const active = (data.prospects as any[]).filter((p) => p.status !== "dismissed");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getMapping = (p: any) =>
          p.imageMapping || p.scrapedData?.imageMapping;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isCompleted = (p: any) =>
          getMapping(p)?.selectionStatus === "completed";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ts = (p: any) =>
          new Date(p.createdAt || p.updatedAt || 0).getTime();
        active.sort((a, b) => {
          const aDone = isCompleted(a);
          const bDone = isCompleted(b);
          if (aDone !== bDone) return aDone ? 1 : -1;
          return aDone ? ts(b) - ts(a) : ts(a) - ts(b);
        });
        setAllProspects(active);
      })
      .catch(() => {});
  }, [loadData]);

  // The "Next Lead" button always points at the next UNCOMPLETED lead
  // in the sorted list, never a completed one. If currentIndex is in
  // the completed section (operator is reviewing a finished lead), or
  // every lead after currentIndex is completed, we wrap around and
  // jump to the FIRST unfinished lead in the whole sorted list — the
  // top of the list table the operator was looking at. If there are
  // no unfinished leads anywhere, the button is hidden (returns null).
  const currentIndex = allProspects.findIndex(p => p.id === id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isProspectCompleted = (p: any) => {
    const m = p?.imageMapping || p?.scrapedData?.imageMapping;
    return m?.selectionStatus === "completed";
  };
  const findNextUnfinished = (startIdx: number, dir: 1 | -1): typeof allProspects[number] | null => {
    if (allProspects.length === 0) return null;
    // Walk in `dir` from startIdx, skipping the current lead and any
    // completed lead. Wrap around to handle "I'm on a completed lead
    // at the bottom — jump back to the top".
    for (let step = 1; step <= allProspects.length; step++) {
      const i = (startIdx + step * dir + allProspects.length) % allProspects.length;
      if (i === currentIndex) continue;
      if (!isProspectCompleted(allProspects[i])) return allProspects[i];
    }
    return null;
  };
  const nextProspect = currentIndex < 0 ? null : findNextUnfinished(currentIndex, 1);
  const prevProspect = currentIndex < 0 ? null : findNextUnfinished(currentIndex, -1);

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

  /* ─── File Upload (for Upload tab) ───
   * Uploads the file to Supabase Storage via /api/image-mapper/upload/[id]
   * and adds the returned stable public URL to `uploadedImages`.
   *
   * Previously used FileReader.readAsDataURL to stash files as
   * base64 data: URIs in component state. That worked locally but
   * broke save: the data URIs were POSTed to scraped_data.photos,
   * hit Supabase JSONB row-size limits, and surfaced as generic
   * 409 "conflict" errors. Also violates QC rule 25 (no data: URIs).
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    e.target.value = "";

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/image-mapper/upload/${id}`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          alert(`Upload failed for "${file.name}": ${err.error || res.statusText}`);
          continue;
        }
        const data = (await res.json()) as { url: string };
        setUploadedImages((prev) => [
          ...prev,
          { url: data.url, name: file.name },
        ]);
      } catch (err) {
        console.error("Upload error for", file.name, err);
        alert(`Upload failed for "${file.name}". Check the console for details.`);
      }
    }
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

  /* ─── Preview iframe background color ───
     Maps the prospect's category to the actual BG the V2 template renders.
     Values pulled directly from the Beast Mode Showcase Registry in
     CLAUDE.md so the scaled preview frame matches what the full-screen
     `/preview/[id]` renders — no more "everything looks dark" illusion
     caused by the scaled iframe leaving uncolored gutter around the content.

     IMPORTANT: Several categories I first assumed were "light" turned out
     to be the showcase's DARK luxury / BOLD theme instead. The current
     mapping reflects each template's actual BG color as specified in
     CLAUDE.md, not a category-wide stereotype. When adding new categories,
     copy the exact `#` from that template's showcase spec. */
  const previewBg = (() => {
    // ── Warm light (cream) #faf9f6 ──
    // family-friendly + healthcare — dental, vet, daycare, church, tutoring, PT
    if (/^(dental|veterinary|daycare|church|tutoring|physical-therapy)$/.test(normalizedCategory)) {
      return "#faf9f6";
    }
    // ── Soft cream/light — lifestyle-adjacent ──
    // salon #faf8f5, interior-design #faf9f7, photography #faf9f7
    if (/^(salon|interior-design|photography|florist|pet-services)$/.test(normalizedCategory)) {
      return "#faf9f7";
    }
    // ── White ── pure clean (tutoring v2 uses white, restaurant light menu feel)
    if (/^(restaurant)$/.test(normalizedCategory)) {
      return "#ffffff";
    }
    // ── Dark luxury near-black #09090b / #0f172a ──
    // premium / authority categories
    if (/^(real-estate|law-firm|accounting|insurance)$/.test(normalizedCategory)) {
      return "#09090b";
    }
    // ── Dark elegant luxury #0a0a0a — med-spa + event-planning ──
    // showcase #18 med-spa + showcase #22 event-planning both use pure black
    // with gold/blush accents for the "luxury" vibe
    if (/^(med-spa|event-planning)$/.test(normalizedCategory)) {
      return "#0a0a0a";
    }
    // ── Warm dark charcoal #1c1917 — food/hospitality ──
    if (/^(catering)$/.test(normalizedCategory)) {
      return "#1c1917";
    }
    // ── Bold energy pure black ── fitness/martial-arts/tattoo
    if (/^(fitness|martial-arts|tattoo)$/.test(normalizedCategory)) {
      return "#0a0a0a";
    }
    // ── Dark forest green ── landscaping
    if (/^(landscaping|tree-service)$/.test(normalizedCategory)) {
      return "#0f1a0f";
    }
    // ── Default: dark professional (trades + unrecognized) ──
    // Covers roofing, HVAC, electrician, plumber, auto-repair, general-contractor,
    // moving, junk-removal, pest-control, cleaning, etc.
    return "#111827";
  })();

  /* ─── Prospect's OWN scraped photos (shown first, above generic library) ───
     These are the hi-res photos from the business's real website/Google Places
     that got promoted through QC. Showing them in the Images tab so Ben can
     drag real job photos onto slots without digging through scraped_data.
     The scrapedData.photos array is the single source of truth — it's what
     the generated-sites site_data copies from, and it's what ends up in the
     prospect's preview. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRealPhotos: string[] = ((prospect as any)?.scrapedData?.photos || []) as string[];
  const realPhotos = Array.from(new Set(rawRealPhotos.filter(Boolean))).map((url, i) => {
    // Derive a short friendly name from the URL filename (strip extension + query)
    const last = url.split("/").pop() || `photo-${i + 1}`;
    const clean = decodeURIComponent(last.split("?")[0]).replace(/\.[a-z]+$/i, "");
    const name = clean.length > 28 ? `real-${i + 1}` : clean;
    return { url, name };
  });

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
                    {(["library", "upload", "fallbacks", "typography", "theme"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setRightTab(tab)}
                        className={`flex-1 px-2 py-1.5 text-[10px] rounded-md transition-colors ${
                          rightTab === tab
                            ? "bg-white/10 text-white font-medium"
                            : "text-white/40 hover:text-white/60"
                        }`}
                      >
                        {tab === "library" ? "Images" : tab === "upload" ? "Upload" : tab === "fallbacks" ? "Fallbacks" : tab === "typography" ? "Fonts" : "Theme"}
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

                      {/* Prospect's real photos — top priority, shown above stock */}
                      {realPhotos.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] uppercase tracking-wider text-green-400 font-semibold">
                              Real Photos
                            </p>
                            <span className="text-[9px] text-white/40">
                              {realPhotos.length} from their website
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {realPhotos.map((p, i) => (
                              <div
                                key={`real-${i}`}
                                draggable
                                onDragStart={(e) => onDragStartHandler(e, p.url)}
                                onDragEnd={onDragEndHandler}
                                className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-green-500/5 border border-green-400/30 cursor-grab active:cursor-grabbing hover:border-green-400/60 transition-all hover:scale-[1.02]"
                                title={p.url}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={proxyUrl(p.url)}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                {/* Real-photo badge */}
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-green-500/90 text-[8px] font-bold text-white">
                                  REAL
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                                  <p className="text-[9px] text-white/80 truncate">{p.name}</p>
                                </div>
                                <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <span className="text-[10px] font-medium text-white bg-black/50 px-2 py-0.5 rounded">
                                    Drag me
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 mb-2 flex items-center gap-2">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">
                              Stock Library
                            </span>
                            <div className="h-px flex-1 bg-white/10" />
                          </div>
                        </div>
                      )}

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

                  {/* ─── Typography Tab ─── */}
                  {rightTab === "typography" && (
                    <div>
                      <p className="text-[11px] text-white/40 mb-4">
                        Choose a typography style for this site. Click to apply.
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {getFontOptions(category).map((opt, i) => (
                            <button
                              key={i}
                              onClick={async () => {
                                setSelectedFont(i);
                                // Save font override to prospect
                                try {
                                  await fetch(`/api/prospects/${id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({
                                      scrapedData: {
                                        ...(prospect?.scrapedData || {}),
                                        fontOverride: { heading: opt.heading, body: opt.body },
                                      },
                                    }),
                                  });
                                  // Refresh preview
                                  setIframeKey(k => k + 1);
                                } catch { /* silent */ }
                              }}
                              className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                                selectedFont === i
                                  ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
                              }`}
                            >
                              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white/5 flex items-center justify-center">
                                <span className="text-lg font-bold text-white/70" style={{ fontFamily: `'${opt.heading}', serif` }}>Aa</span>
                              </div>
                              <p className="text-xs font-medium text-white mb-0.5">{opt.label}</p>
                              <p className="text-[9px] text-white/30">{opt.heading}</p>
                              <p className="text-[9px] text-white/20">+ {opt.body}</p>
                            </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-white/20 mt-4 text-center">
                        Typography is applied automatically based on category. Override here if needed.
                      </p>
                    </div>
                  )}

                  {/* ─── Theme Tab ─── */}
                  {rightTab === "theme" && (() => {
                    // The `selectedTheme` value stored in the DB is scheme-B:
                    // "light" means "apply the global --light CSS invert filter",
                    // "dark" means "render the V2 template natively." Most V2
                    // templates are built in one theme per category, so the
                    // user-facing Light/Dark choice has to flip based on which
                    // theme the category is natively built in.
                    const LIGHT_NATIVE: string[] = [
                      "salon", "florist", "daycare", "photography", "interior-design",
                      "catering", "dental", "medical", "chiropractic", "physical-therapy",
                      "veterinary", "pet-services", "accounting", "insurance", "tutoring",
                      "church", "real-estate", "law-firm", "med-spa", "event-planning",
                      "carpet-cleaning",
                    ];
                    const nativeLabel: "light" | "dark" = LIGHT_NATIVE.includes(category) ? "light" : "dark";
                    const toRawValue = (userLabel: "light" | "dark"): "light" | "dark" =>
                      userLabel === nativeLabel ? "dark" : "light";
                    const toUserLabel = (raw: "light" | "dark"): "light" | "dark" =>
                      raw === "dark" ? nativeLabel : (nativeLabel === "light" ? "dark" : "light");

                    const rawCurrent = (prospect?.selectedTheme as "light" | "dark" | undefined)
                      || (prospect?.aiThemeRecommendation as "light" | "dark" | undefined)
                      || nativeLabel;
                    const currentUserLabel = toUserLabel(rawCurrent);
                    const aiRecommended = (prospect?.aiThemeRecommendation as "light" | "dark" | undefined) || nativeLabel;
                    const isOverridden = prospect?.selectedTheme && prospect.selectedTheme !== prospect.aiThemeRecommendation;

                    const handleThemeChange = async (userLabel: "light" | "dark") => {
                      const rawValue = toRawValue(userLabel);
                      setProspect({ ...prospect, selectedTheme: rawValue });
                      try {
                        await fetch(`/api/prospects/${id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ selectedTheme: rawValue }),
                        });
                        setIframeKey((k) => k + 1);
                      } catch { /* silent */ }
                    };

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] text-white/40">
                            Pick a theme for this preview. Saves + reloads the live preview.
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                            AI: {aiRecommended}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleThemeChange("light")}
                            className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                              currentUserLabel === "light"
                                ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                                : "border-white/10 bg-white/[0.03] hover:border-white/20"
                            }`}
                          >
                            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" className="w-5 h-5">
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                              </svg>
                            </div>
                            <p className="text-xs font-medium text-white mb-0.5">Light</p>
                            <p className="text-[9px] text-white/30">Cream, white</p>
                          </button>
                          <button
                            onClick={() => handleThemeChange("dark")}
                            className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                              currentUserLabel === "dark"
                                ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                                : "border-white/10 bg-white/[0.03] hover:border-white/20"
                            }`}
                          >
                            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gray-900 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" className="w-5 h-5">
                                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                              </svg>
                            </div>
                            <p className="text-xs font-medium text-white mb-0.5">Dark</p>
                            <p className="text-[9px] text-white/30">Charcoal, navy</p>
                          </button>
                        </div>
                        {isOverridden && (
                          <p className="mt-3 text-[10px] text-amber-400/80 text-center">
                            Overriding AI recommendation ({aiRecommended})
                          </p>
                        )}
                      </div>
                    );
                  })()}
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
                <div
                  className="rounded-b-xl overflow-hidden relative"
                  style={{ height: 350, background: previewBg }}
                >
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
                      src={`/preview/${id}?_t=${iframeKey}&theme=${prospect?.selectedTheme || prospect?.aiThemeRecommendation || "dark"}`}
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
