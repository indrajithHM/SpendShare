"use client";
import { useState, useEffect } from "react";
import { push, ref } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { PlusCircle } from "lucide-react";

const splitEvenShares = (amount: number, ids: string[]) => {
  const totalPaise = Math.round(amount * 100);
  const count = ids.length;
  const base = Math.floor(totalPaise / count);
  const remainder = totalPaise - base * count;
  return ids.map((_, index) => (base + (index < remainder ? 1 : 0)) / 100);
};

export default function AddSplitExpense({ splitId, members }: { splitId: string; members: Record<string, any> }) {
  const uid = auth.currentUser!.uid;
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(uid);
  const [splitType, setSplitType] = useState("EQUAL_ALL");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [shares, setShares] = useState<Record<string, string>>({});
  const memberEntries = Object.entries(members || {});

  useEffect(() => {
    if (splitType === "EQUAL_SELECTED") {
      const all: Record<string, boolean> = {};
      memberEntries.forEach(([id]) => { all[id] = true; });
      setSelected(all);
    }
  }, [splitType]);

  const submit = async () => {
    const amt = Number(amount);
    if (!desc || amt <= 0) return;
    let participants: Record<string, any> = {};

    if (splitType === "EQUAL_ALL") {
      const ids = memberEntries.map(([id]) => id);
      const splitShares = splitEvenShares(amt, ids);
      ids.forEach((id, index) => { participants[id] = { share: splitShares[index] }; });
    } else if (splitType === "EQUAL_SELECTED") {
      const ids = memberEntries.filter(([id]) => selected[id]).map(([id]) => id);
      if (!ids.length) { alert("Select at least one member"); return; }
      const splitShares = splitEvenShares(amt, ids);
      ids.forEach((id, index) => { participants[id] = { share: splitShares[index] }; });
    } else {
      let total = 0;
      memberEntries.forEach(([id]) => {
        const v = Number(shares[id] || 0);
        if (v > 0) { participants[id] = { share: v }; total += v; }
      });
      if (!Object.keys(participants).length) { alert("At least one member must have a share"); return; }
      if (total !== amt) { alert("Unequal split total must equal expense amount"); return; }
    }

    await push(ref(db, `splits/${splitId}/expenses`), {
      description: desc, amount: amt, paidBy: paidBy,
      splitType, participants, createdAt: Date.now(),
    });

    alert('Expense added successfully!');

    try {
      const participantIds = Object.keys(participants).filter((id) => id !== uid);
      if (participantIds.length > 0) {
        await fetch("https://spendshare-backend.onrender.com/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantIds, splitId,
            title: "New Expense Added",
            body: `${members[uid]?.name} added ₹${amt}`,
          }),
        });
      }
    } catch {}

    setDesc(""); setAmount(""); setShares({}); setSelected({}); setSplitType("EQUAL_ALL"); setPaidBy(uid);
  };

  const splitOptions = [
    { id: "EQUAL_ALL", label: "Equal – All" },
    { id: "EQUAL_SELECTED", label: "Equal – Selected" },
    { id: "UNEQUAL", label: "Unequal" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Expense</h3>
      <div className="space-y-2.5">
        <input
          className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Description"
          value={desc} onChange={(e) => setDesc(e.target.value)}
        />
        <input
          className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          type="number" placeholder="Amount (₹)"
          value={amount} onChange={(e) => setAmount(e.target.value)}
        />

        <select
          className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          {memberEntries.map(([id, m]) => (
            <option key={id} value={id}>
              Paid by: {m.name}
            </option>
          ))}
        </select>

        {/* Split type */}
        <div className="flex gap-2">
          {splitOptions.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSplitType(id)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${splitType === id ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {splitType === "EQUAL_SELECTED" && (
          <div className="border border-gray-100 rounded-xl p-3 space-y-2">
            {memberEntries.map(([id, m]) => (
              <label key={id} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="rounded" checked={!!selected[id]} onChange={() => setSelected((p) => ({ ...p, [id]: !p[id] }))} />
                <span className="text-sm text-gray-700">{m.name}</span>
              </label>
            ))}
          </div>
        )}

        {splitType === "UNEQUAL" && (
          <div className="border border-gray-100 rounded-xl p-3 space-y-2">
            {memberEntries.map(([id, m]) => (
              <div key={id} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-gray-700">{m.name}</span>
                <input
                  type="number"
                  className="w-24 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="₹"
                  value={shares[id] ?? ""}
                  onChange={(e) => setShares((p) => ({ ...p, [id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={submit}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Expense
        </button>
      </div>
    </div>
  );
}
