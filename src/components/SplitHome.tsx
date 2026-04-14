"use client";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import SplitCard from "./SplitCard";
import CreateSplitModal from "./CreateSplitModal";
import JoinSplitViaLinkModal from "./JoinSplitViaLinkModal";
import BottomNav from "./BottomNav";
import { Plus, Link2 } from "lucide-react";

export default function SplitHome() {
  const [splits, setSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    let unsubDb: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) { setSplits([]); setLoading(false); return; }
      setLoading(true);
      unsubDb = onValue(ref(db, "splits"), (snap) => {
        if (!snap.exists()) { setSplits([]); setLoading(false); return; }
        const list = Object.entries(snap.val())
          .map(([id, s]: [string, any]) => ({ id, ...s }))
          .filter((s) => s.createdBy === user.uid || s.members?.[user.uid])
          .reverse();
        setSplits(list); setLoading(false);
      });
    });
    return () => { unsubAuth(); unsubDb?.(); };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <div className="py-5">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-bold text-gray-900">Your Splits</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Join via Link</span>
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Split
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading splits…</p>
          </div>
        ) : splits.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700 mb-1">No splits yet</p>
            <p className="text-sm text-gray-400">Create one to start sharing expenses with friends</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {splits.map((s) => <SplitCard key={s.id} split={s} />)}
          </div>
        )}
      </div>

      {showCreate && <CreateSplitModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinSplitViaLinkModal onClose={() => setShowJoin(false)} />}

      <BottomNav mode="split" active="SPLIT" />
    </div>
  );
}
