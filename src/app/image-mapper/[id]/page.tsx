"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ImageSlot, ImageMapping } from "@/lib/image-mapper-store";

/* ─── Theme Library: 5-8 stock images per category ─── */
const THEME_LIBRARY: Record<string, { url: string; name: string }[]> = {
  dental: [
    { url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80", name: "dental-chair" },
    { url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80", name: "dentist-working" },
    { url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&q=80", name: "smile" },
    { url: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&q=80", name: "dental-tools" },
    { url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&q=80", name: "dental-office" },
    { url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80", name: "dental-team" },
  ],
  roofing: [
    { url: "https://images.unsplash.com/photo-1632178050091-c4c4a3834984?w=400&q=80", name: "roof-shingles" },
    { url: "https://images.unsplash.com/photo-1591588582259-e675bd2e6088?w=400&q=80", name: "roof-workers" },
    { url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80", name: "house-exterior" },
    { url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80", name: "new-roof" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", name: "modern-home" },
    { url: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400&q=80", name: "residential-roof" },
  ],
  veterinary: [
    { url: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&q=80", name: "vet-dog" },
    { url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80", name: "happy-dogs" },
    { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80", name: "golden-retriever" },
    { url: "https://images.unsplash.com/photo-1583337130417-13219ce250d3?w=400&q=80", name: "cat-face" },
    { url: "https://images.unsplash.com/photo-1559715541-d4fc97b8d6dd?w=400&q=80", name: "vet-exam" },
    { url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80", name: "puppy" },
  ],
  moving: [
    { url: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&q=80", name: "moving-boxes" },
    { url: "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=400&q=80", name: "moving-truck" },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80", name: "packing" },
    { url: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&q=80", name: "new-home" },
    { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80", name: "living-room" },
    { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80", name: "family-home" },
  ],
  "pest-control": [
    { url: "https://images.unsplash.com/photo-1609840112855-9b29c6928850?w=400&q=80", name: "pest-spray" },
    { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80", name: "clean-kitchen" },
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", name: "house-backyard" },
    { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80", name: "home-interior" },
    { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80", name: "suburban-home" },
  ],
  cleaning: [
    { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80", name: "cleaning-spray" },
    { url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80", name: "clean-room" },
    { url: "https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=400&q=80", name: "clean-living-room" },
    { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", name: "mop-floor" },
    { url: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=400&q=80", name: "tidy-bathroom" },
    { url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&q=80", name: "modern-kitchen" },
  ],
  electrician: [
    { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80", name: "electrician-work" },
    { url: "https://images.unsplash.com/photo-1558402529-d2638a7c3842?w=400&q=80", name: "electrical-panel" },
    { url: "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=400&q=80", name: "wiring" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", name: "home-exterior" },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80", name: "commercial-space" },
  ],
  plumber: [
    { url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80", name: "plumber-work" },
    { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80", name: "kitchen-sink" },
    { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80", name: "bathroom" },
    { url: "https://images.unsplash.com/photo-1600566753086-00f18c67ceec?w=400&q=80", name: "water-heater" },
    { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", name: "pipes" },
  ],
  hvac: [
    { url: "https://images.unsplash.com/photo-1631545806609-1dc29c33b1a7?w=400&q=80", name: "hvac-unit" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", name: "modern-home" },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80", name: "thermostat" },
    { url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80", name: "cozy-room" },
    { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80", name: "home-comfort" },
  ],
  salon: [
    { url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80", name: "salon-interior" },
    { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80", name: "hair-styling" },
    { url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80", name: "hair-color" },
    { url: "https://images.unsplash.com/photo-1521590832167-7228f5a3a921?w=400&q=80", name: "salon-tools" },
    { url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&q=80", name: "hair-wash" },
    { url: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&q=80", name: "style-result" },
  ],
  landscaping: [
    { url: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&q=80", name: "garden" },
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", name: "backyard" },
    { url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80", name: "flowers" },
    { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80", name: "lawn" },
    { url: "https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=400&q=80", name: "patio" },
    { url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&q=80", name: "landscape-design" },
  ],
  "law-firm": [
    { url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80", name: "courtroom" },
    { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", name: "attorney" },
    { url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80", name: "legal-docs" },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80", name: "office" },
    { url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80", name: "handshake" },
    { url: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&q=80", name: "conference-room" },
  ],
  insurance: [
    { url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80", name: "protection" },
    { url: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&q=80", name: "family" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", name: "home-safe" },
    { url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80", name: "car-insurance" },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80", name: "office-meeting" },
  ],
  accounting: [
    { url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80", name: "calculator" },
    { url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80", name: "paperwork" },
    { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80", name: "charts" },
    { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", name: "professional" },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80", name: "modern-office" },
  ],
  chiropractic: [
    { url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80", name: "spine-care" },
    { url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80", name: "treatment" },
    { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80", name: "wellness" },
    { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", name: "stretching" },
    { url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&q=80", name: "chiro-office" },
  ],
  "auto-repair": [
    { url: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400&q=80", name: "mechanic" },
    { url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80", name: "engine-work" },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80", name: "auto-shop" },
    { url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80", name: "car-front" },
    { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80", name: "sports-car" },
    { url: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&q=80", name: "tire-shop" },
  ],
  "general-contractor": [
    { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80", name: "construction" },
    { url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80", name: "building-site" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", name: "finished-home" },
    { url: "https://images.unsplash.com/photo-1600566753086-00f18c67ceec?w=400&q=80", name: "renovation" },
    { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80", name: "modern-build" },
  ],
  photography: [
    { url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80", name: "camera" },
    { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80", name: "wedding-couple" },
    { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80", name: "wedding-rings" },
    { url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80", name: "portrait" },
    { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", name: "landscape-photo" },
    { url: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=400&q=80", name: "studio" },
  ],
  "interior-design": [
    { url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80", name: "living-room" },
    { url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&q=80", name: "kitchen-design" },
    { url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&q=80", name: "bedroom" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", name: "home-exterior" },
    { url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80", name: "modern-interior" },
    { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80", name: "cozy-space" },
  ],
  "real-estate": [
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", name: "luxury-home" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", name: "modern-house" },
    { url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80", name: "keys-handover" },
    { url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80", name: "real-estate-agent" },
    { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80", name: "suburban-house" },
    { url: "https://images.unsplash.com/photo-1600566753086-00f18c67ceec?w=400&q=80", name: "interior-staged" },
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

/* ─── Component ─── */
export default function ImageMapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prospect, setProspect] = useState<any>(null);
  const [mapping, setMapping] = useState<ImageMapping | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [rightTab, setRightTab] = useState<"library" | "upload">("library");
  const [uploadedImages, setUploadedImages] = useState<{ url: string; name: string }[]>([]);
  const [savingNote, setSavingNote] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (data.imageMapping) {
        setMapping(data.imageMapping as ImageMapping);
      }
    } catch {
      router.push("/image-mapper");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  /* ─── Save Note ─── */
  const saveNote = async (position: number, notes: string) => {
    setSavingNote(position);
    try {
      await fetch(`/api/image-mapper/save/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageUpdate: { position, notes } }),
      });
      // update local state
      setMapping((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          images: prev.images.map((img) =>
            img.position === position ? { ...img, notes } : img
          ),
        };
      });
    } finally {
      setSavingNote(null);
    }
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
          imageUpdate: {
            position,
            status: newStatus,
            replacementUrl: newStatus === "keep-original" ? null : slot.replacementUrl,
          },
        }),
      });
      const data = await res.json();
      if (data.mapping) setMapping(data.mapping);
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  /* ─── Assign Replacement ─── */
  const assignReplacement = async (replacementUrl: string) => {
    if (!selectedPosition || !mapping) return;
    try {
      const res = await fetch(`/api/image-mapper/save/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          imageUpdate: {
            position: selectedPosition,
            replacementUrl,
            status: "replaced",
          },
        }),
      });
      const data = await res.json();
      if (data.mapping) setMapping(data.mapping);
    } catch (err) {
      console.error("Assign failed:", err);
    }
  };

  /* ─── File Upload ─── */
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

  /* ─── Progress ─── */
  const mappedCount = mapping?.images.filter(
    (img) => img.status === "replaced" || img.status === "keep-original"
  ).length ?? 0;
  const totalCount = mapping?.images.length ?? 0;

  /* ─── Library images for category ─── */
  const category = mapping?.category || prospect?.category || "general";
  const libraryImages = THEME_LIBRARY[category] || THEME_LIBRARY["dental"] || [];

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
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push("/image-mapper")}
              className="shrink-0 px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              &larr; Back to Leads
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">
                {prospect?.businessName || "Unknown Business"}
              </h1>
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
            {/* Progress */}
            {mapping && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {mappedCount} of {totalCount} mapped
                </span>
              </div>
            )}

            {/* Scan Button */}
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
                "Re-scan Website"
              ) : (
                "Scan Website"
              )}
            </button>
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

      {/* ─── Two-Panel Layout ─── */}
      {mapping && (
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ─── LEFT PANEL: Their Images ─── */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Their Images
                  <span className="text-xs text-white/40 font-normal ml-auto">
                    {totalCount} found
                  </span>
                </h2>
              </div>

              <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {mapping.images.map((img) => {
                  const sc = statusColor(img.status);
                  const isSelected = selectedPosition === img.position;

                  return (
                    <div
                      key={img.position}
                      onClick={() => setSelectedPosition(img.position)}
                      className={`
                        rounded-xl border p-3 cursor-pointer transition-all
                        ${isSelected
                          ? "border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/5"
                          : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                        }
                      `}
                    >
                      <div className="flex gap-3">
                        {/* Position # */}
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold">
                          {img.position}
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-24 h-18 shrink-0 rounded-lg overflow-hidden bg-white/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={proxyUrl(img.originalUrl)}
                            alt={`Position ${img.position}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {img.status === "replaced" && (
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs text-white/50">{img.location}</p>
                              <p className="text-xs text-white/30 truncate">{img.suggestedFilename}</p>
                            </div>
                            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>
                              {sc.label}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleKeepOriginal(img.position);
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                img.status === "keep-original"
                                  ? "border-blue-500 text-blue-400 bg-blue-500/10"
                                  : "border-white/10 text-white/40 hover:border-white/20"
                              }`}
                            >
                              {img.status === "keep-original" ? "Keeping" : "Keep Original"}
                            </button>
                            {img.replacementUrl && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-emerald-400">Mapped to:</span>
                                <div className="w-6 h-6 rounded overflow-hidden border border-emerald-500/30">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={img.replacementUrl.startsWith("data:") ? img.replacementUrl : proxyUrl(img.replacementUrl)}
                                    alt="Replacement"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <textarea
                            defaultValue={img.notes}
                            onBlur={(e) => saveNote(img.position, e.target.value)}
                            placeholder="Add notes about this image..."
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-blue-500/50"
                          />
                          {savingNote === img.position && (
                            <p className="text-[10px] text-blue-400 mt-1">Saving...</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── RIGHT PANEL: Our Replacements ─── */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Our Replacements
                  </h2>

                  {/* Tab Switcher */}
                  <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5">
                    <button
                      onClick={() => setRightTab("library")}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        rightTab === "library"
                          ? "bg-white/10 text-white"
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      Theme Library
                    </button>
                    <button
                      onClick={() => setRightTab("upload")}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        rightTab === "upload"
                          ? "bg-white/10 text-white"
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {/* Selection hint */}
                {!selectedPosition && (
                  <p className="text-xs text-amber-400/80 mt-2">
                    Select an image on the left panel first, then click a replacement here.
                  </p>
                )}
                {selectedPosition && (
                  <p className="text-xs text-blue-400 mt-2">
                    Replacing image #{selectedPosition}. Click any image below to assign it.
                  </p>
                )}
              </div>

              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Tab: Theme Library */}
                {rightTab === "library" && (
                  <div>
                    <p className="text-xs text-white/40 mb-3 capitalize">
                      Category: {category.replace("-", " ")}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {libraryImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => assignReplacement(img.url)}
                          disabled={!selectedPosition}
                          className={`
                            group relative rounded-xl overflow-hidden border transition-all aspect-[4/3]
                            ${selectedPosition
                              ? "border-white/10 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/30 cursor-pointer"
                              : "border-white/5 opacity-50 cursor-not-allowed"
                            }
                          `}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] text-white font-medium">{img.name}</span>
                          </div>
                          {selectedPosition && (
                            <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors flex items-center justify-center">
                              <svg className="w-8 h-8 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Upload */}
                {rightTab === "upload" && (
                  <div>
                    {/* Upload Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-colors mb-4"
                    >
                      <svg className="w-10 h-10 text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-white/40">Click to upload images</p>
                      <p className="text-xs text-white/20 mt-1">PNG, JPG, WebP</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Uploaded Images Grid */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {uploadedImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => assignReplacement(img.url)}
                            disabled={!selectedPosition}
                            className={`
                              group relative rounded-xl overflow-hidden border transition-all aspect-[4/3]
                              ${selectedPosition
                                ? "border-white/10 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/30 cursor-pointer"
                                : "border-white/5 opacity-50 cursor-not-allowed"
                              }
                            `}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                              <span className="text-[10px] text-white font-medium truncate">{img.name}</span>
                            </div>
                            {selectedPosition && (
                              <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {uploadedImages.length === 0 && (
                      <p className="text-xs text-white/30 text-center py-4">
                        No custom images uploaded yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
