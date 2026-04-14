"use client";
import { useRouter } from "next/navigation";
import { Share2, Users } from "lucide-react";

export default function SplitCard({ split }: { split: any }) {
  const router = useRouter();
  if (!split?.id) return null;

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/split?id=${split.id}`;
  const memberCount = Object.keys(split.members || {}).length;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try { await navigator.share({ title: "SpendShare Split", text: `Join: ${split.name}`, url: link }); }
      catch {}
    } else {
      await navigator.clipboard.writeText(link);
      alert("Link copied!");
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between cursor-pointer hover:border-indigo-200 hover:shadow-sm transition-all active:scale-[0.99]"
      onClick={() => router.push(`/split?id=${split.id}`)}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-800">{split.name}</p>
          <p className="text-xs text-gray-400">{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {split.status === "CLOSED" && (
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Closed</span>
        )}
        <button
          onClick={handleShare}
          className="p-2 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
        >
          <Share2 className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
