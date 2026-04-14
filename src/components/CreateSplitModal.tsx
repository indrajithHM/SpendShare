"use client";
import { useState } from "react";
import { push, ref, set } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { X, Copy, Check } from "lucide-react";

export default function CreateSplitModal({ onClose }: { onClose: () => void }) {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const name = (new FormData(e.currentTarget).get("name") as string).trim();
    if (!name) return;
    const splitRef = push(ref(db, "splits"));
    await set(splitRef, {
      name,
      createdAt: Date.now(),
      createdBy: auth.currentUser!.uid,
      status: "OPEN",
      members: {
        [auth.currentUser!.uid]: {
          name: auth.currentUser!.displayName,
          email: auth.currentUser!.email,
          upi: "",
        },
      },
      expenses: {},
    });
   // setLink(`${window.location.origin}/split/${splitRef.key}`);
   setLink(`${window.location.origin}/split?id=${splitRef.key}`); 
   setLoading(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Create Split</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!link ? (
          <form onSubmit={submit} className="space-y-4">
            <input
              name="name"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Split name (Trip, Dinner, etc.)"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create Split"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Share this link with friends</p>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-gray-50 text-gray-600"
                value={link}
                readOnly
              />
              <button
                onClick={copy}
                className={`px-3.5 rounded-xl border transition-all flex items-center gap-1.5 ${copied ? "bg-green-50 border-green-200 text-green-600" : "border-gray-200 hover:border-indigo-300 text-gray-600"}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
