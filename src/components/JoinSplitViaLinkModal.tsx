"use client";
import { useState } from "react";
import { ref, set, get } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JoinSplitViaLinkModal({ onClose }: { onClose: () => void }) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const extractSplitId = (input: string) => {
    const pathMatch = input.match(/split\/([^/?]+)/);
    if (pathMatch) return pathMatch[1];

    const queryMatch = input.match(/[?&]id=([^&]+)/);
    if (queryMatch) return queryMatch[1];

    return input.trim();
  };

  const joinSplit = async () => {
    setError("");
    setLoading(true);
    try {
      const splitId = extractSplitId(link);

      // ✅ Added return after each early exit so execution stops
      if (!splitId) {
        setError("Invalid split link");
        return;
      }

      const snap = await get(ref(db, `splits/${splitId}`));

      if (!snap.exists()) {
        setError("Split not found");
        return;
      }

      // ✅ Guard against unauthenticated user before writing
      if (!auth.currentUser) {
        setError("You must be logged in to join a split");
        return;
      }

      await set(ref(db, `splits/${splitId}/members/${auth.currentUser.uid}`), {
        name: auth.currentUser.displayName,
        email: auth.currentUser.email,
      });

      onClose();

      // ✅ Force a hard navigation refresh so the splits list re-fetches data
      router.refresh();

      // ✅ Optionally navigate directly into the split
      // router.push(`/split/${splitId}`);

    } catch (err) {
      console.error("Join split error:", err); // ✅ Log the actual error for debugging
      setError("Failed to join split");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Join via Link</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <input
          className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-2"
          placeholder="Paste split link or ID"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && joinSplit()} // ✅ Enter key support
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-2 mt-3">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={joinSplit}
            disabled={loading || !link.trim()} // ✅ Disable if input is empty
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Joining..." : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}