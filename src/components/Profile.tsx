"use client";
import { useEffect, useState } from "react";
import { ref, get, update, runTransaction } from "firebase/database";
import { updateProfile } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { User } from "firebase/auth";

export default function Profile({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [initialName, setInitialName] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.displayName || "");
    setInitialName(user.displayName || "");
    get(ref(db, `users/${user.uid}`)).then((snap) => {
      const u = snap.exists() ? snap.val().username || "" : "";
      setUsername(u); setInitialUsername(u); setLoading(false);
    });
  }, [user]);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const isFirstTime = !initialUsername;
  const isDirty = name !== initialName || username !== initialUsername;

  const saveProfile = async () => {
    if (!username || username.length < 3) { setMessage({ text: "Username must be at least 3 characters", type: "error" }); return; }
    setSaving(true); setMessage(null);
    try {
      if (name !== initialName) await updateProfile(user, { displayName: name });
      if (!initialUsername) {
        const result = await runTransaction(ref(db, `usernames/${username}`), (current) => {
          if (current === null) return user.uid;
          return;
        });
        if (!result.committed) { setMessage({ text: "Username already taken", type: "error" }); setSaving(false); return; }
      }
      await update(ref(db, `users/${user.uid}`), { username });
      setInitialName(name); setInitialUsername(username);
      setMessage({ text: "Profile saved successfully", type: "success" });
    } catch { setMessage({ text: "Failed to save profile", type: "error" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-900">{isFirstTime ? "Complete your profile" : "Edit Profile"}</h1>
      </div>

      {isFirstTime && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700">
          Please complete your profile to continue using SpendShare.
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=6366f1&color=fff`}
          className="w-24 h-24 rounded-full border-4 border-white shadow-lg mb-3"
          alt="avatar"
        />
        <p className="text-xs text-gray-400 text-center">Profile picture synced from Google</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-500"
            value={username} onChange={(e) => setUsername(e.target.value)}
            disabled={!!initialUsername}
          />
          {initialUsername && <p className="text-xs text-gray-400 mt-1.5">Username cannot be changed once set.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={name} onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm bg-gray-50 text-gray-400"
            value={user.email || ""} readOnly
          />
        </div>

        <button
          onClick={saveProfile}
          disabled={saving || !isDirty}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${saving || !isDirty ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Profile"}
        </button>

        {message && (
          <p className={`text-center text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
