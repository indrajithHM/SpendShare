"use client";
import { useState, useEffect } from "react";
import { ref, update, remove } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { X, Trash2, Save } from "lucide-react";

export default function EditSplitExpenseModal({ splitId, expenseId, expense, members, onClose }: any) {
  const uid = auth.currentUser!.uid;
  const memberEntries = Object.entries(members || {});
  const [desc, setDesc] = useState(expense.description || "");
  const [splitType, setSplitType] = useState(expense.splitType || "EQUAL_ALL");
  const [amount, setAmount] = useState(String(expense.amount || 0));
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [shares, setShares] = useState<Record<string, string>>({});

  useEffect(() => {
    if (expense.participants) {
      const s: Record<string, string> = {}, sel: Record<string, boolean> = {};
      Object.entries(expense.participants).forEach(([id, p]: any) => { s[id] = String(p.share); sel[id] = true; });
      setShares(s); setSelected(sel);
    }
  }, [expense]);

  useEffect(() => {
    if (splitType === "EQUAL_SELECTED") {
      const all: Record<string, boolean> = {};
      memberEntries.forEach(([id]) => { all[id] = true; });
      setSelected(all);
    }
  }, [splitType]);

  const totalAmount = splitType === "UNEQUAL"
    ? Object.values(shares).reduce((s, v) => s + Number(v || 0), 0)
    : Number(amount || 0);

  const save = async () => {
    if (!desc.trim() || totalAmount <= 0) return;
    let participants: Record<string, any> = {};
    if (splitType === "EQUAL_ALL") {
      const perHead = totalAmount / memberEntries.length;
      memberEntries.forEach(([id]) => { participants[id] = { share: perHead }; });
    } else if (splitType === "EQUAL_SELECTED") {
      const ids = memberEntries.filter(([id]) => selected[id]).map(([id]) => id);
      if (!ids.length) { alert("Select at least one member"); return; }
      const perHead = totalAmount / ids.length;
      ids.forEach((id) => { participants[id] = { share: perHead }; });
    } else {
      let total = 0;
      memberEntries.forEach(([id]) => {
        const v = Number(shares[id] || 0);
        if (v > 0) { participants[id] = { share: v }; total += v; }
      });
      if (!Object.keys(participants).length) { alert("At least one member must have a share"); return; }
      if (total !== Number(amount)) { alert("Unequal split total must equal amount"); return; }
    }
    await update(ref(db, `splits/${splitId}/expenses/${expenseId}`), { description: desc.trim(), amount: totalAmount, splitType, participants });
    onClose();
  };

  const del = async () => {
    if (!confirm("Delete this expense?")) return;
    await remove(ref(db, `splits/${splitId}/expenses/${expenseId}`));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Edit Expense</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <input className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
          {splitType !== "UNEQUAL" && (
            <input type="number" className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          )}
          <div className="flex gap-2">
            {["EQUAL_ALL", "EQUAL_SELECTED", "UNEQUAL"].map((type) => (
              <button key={type} onClick={() => setSplitType(type)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${splitType === type ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                {type === "EQUAL_ALL" ? "All" : type === "EQUAL_SELECTED" ? "Selected" : "Unequal"}
              </button>
            ))}
          </div>
          {splitType === "EQUAL_SELECTED" && (
            <div className="border border-gray-100 rounded-xl p-3 space-y-2">
              {memberEntries.map(([id, m]: any) => (
                <label key={id} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" className="rounded" checked={!!selected[id]} onChange={() => setSelected((p) => ({ ...p, [id]: !p[id] }))} />
                  <span className="text-sm text-gray-700">{m.name}</span>
                </label>
              ))}
            </div>
          )}
          {splitType === "UNEQUAL" && (
            <div className="border border-gray-100 rounded-xl p-3 space-y-2">
              {memberEntries.map(([id, m]: any) => (
                <div key={id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-gray-700">{m.name}</span>
                  <input type="number" className="w-24 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={shares[id] ?? ""} onChange={(e) => setShares((p) => ({ ...p, [id]: e.target.value }))} />
                </div>
              ))}
            </div>
          )}
          <p className="text-right text-xs text-gray-400">Total: ₹{totalAmount}</p>
          <button onClick={save} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
            <Save className="w-4 h-4" /> Save Changes
          </button>
          <button onClick={del} className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-xl font-semibold text-sm transition-colors">
            <Trash2 className="w-4 h-4" /> Delete Expense
          </button>
        </div>
      </div>
    </div>
  );
}
