import { useState } from "react";
import type { Category } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";

interface ScoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function ScoutModal({
  isOpen,
  onClose,
  onComplete,
}: ScoutModalProps) {
  const [city, setCity] = useState("Austin, TX");
  const [category, setCategory] = useState<Category>("dental");
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScout = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, category, limit }),
      });
      const data = await res.json();
      setResult(
        `Found ${data.prospects.length} businesses! Generating previews...`
      );

      // Generate previews for each prospect
      for (const prospect of data.prospects) {
        await fetch(`/api/generate/${prospect.id}`, { method: "POST" });
      }

      setResult(
        `Done! ${data.prospects.length} preview sites ready.`
      );
      onComplete();
    } catch (err) {
      setResult(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-6">Scout for Businesses</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm"
              placeholder="Austin, TX"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm"
            >
              {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_CONFIG[cat].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">
              Max Results
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
              min={1}
              max={20}
              className="w-full h-10 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm"
            />
          </div>
        </div>

        {result && (
          <div className="mt-4 p-3 rounded-lg bg-blue-electric/10 text-blue-electric text-sm">
            {result}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-border text-muted text-sm hover:bg-surface-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleScout}
            disabled={loading || !city}
            className="flex-1 h-10 rounded-lg bg-blue-electric text-white text-sm font-medium disabled:opacity-50 hover:bg-blue-deep transition-colors"
          >
            {loading ? "Scouting..." : "Run Scout"}
          </button>
        </div>
      </div>
    </div>
  );
}
