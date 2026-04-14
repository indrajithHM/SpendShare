"use client";
import { useEffect, useState } from "react";
import { onValue, ref, update, remove } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import AddSplitExpense from "./AddSplitExpense";
import { UserBalanceCards, SettlementView, SettlementHistory } from "./SettlementComponents";
import EditSplitExpenseModal from "./EditSplitExpenseModal";
import BottomNav from "./BottomNav";

export default function SplitDashboard({ splitId }: { splitId: string }) {
  const router = useRouter();
  const [split, setSplit] = useState<any>(null);
  const [loadingSplit, setLoadingSplit] = useState(true);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [upiInput, setUpiInput] = useState("");
  const [savingUpi, setSavingUpi] = useState(false);
  const [upiSaved, setUpiSaved] = useState(false);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    return onValue(ref(db, `splits/${splitId}`), (snap) => {
      if (snap.exists()) setSplit(snap.val());
      setLoadingSplit(false);
    });
  }, [splitId]);

  useEffect(() => {
    if (split && uid && split.members?.[uid]) {
      setUpiInput(split.members[uid].upi || "");
      setUpiSaved(false);
    }
  }, [split, uid]);

  if (loadingSplit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading split…</p>
        </div>
      </div>
    );
  }

  if (!split) {
    return <p className="text-center mt-10 text-gray-400">Split not found</p>;
  }

  const members = split.members || {};
  const expenses = split.expenses || {};
  const settlements = split.settlements || {};
  const status = split.status || "OPEN";
  const isMember = uid ? !!members[uid] : false;
  const isCreator = uid === split.createdBy;
  const savedUpi = uid ? (members[uid]?.upi || "") : "";
  const isUnchanged = upiInput.trim() === savedUpi.trim();

  const submitUpi = async () => {
    if (!upiInput.trim() || isUnchanged) return;
    setSavingUpi(true);
    await update(ref(db, `splits/${splitId}/members/${uid}`), { upi: upiInput.trim() });
    setSavingUpi(false); setUpiSaved(true);
  };

  const closeSplit = async () => {
    if (!confirm("Close this split? No more expenses can be added.")) return;
    await update(ref(db, `splits/${splitId}`), { status: "CLOSED" });
  };

  const deleteSplit = async () => {
    if (!confirm("This will permanently delete the split. Are you sure?")) return;
    await remove(ref(db, `splits/${splitId}`));
    router.push("/split");
  };

  const visibleExpenses = Object.entries(expenses)
    .filter(([, e]: any) => e.paidBy === uid || (uid && e.participants?.[uid]))
    .sort(([, a]: any, [, b]: any) => (b.createdAt || 0) - (a.createdAt || 0));

  const userSettlements = Object.entries(settlements).filter(([, s]: any) => s.from === uid || s.to === uid);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* Sticky header */}
      <div className="sticky top-[57px] z-20 bg-gray-50/95 backdrop-blur py-3 mb-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-gray-200 hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">{split.name}</h1>
            <p className="text-xs text-gray-400">{Object.keys(members).length} members · {status}</p>
          </div>
        </div>
        {status === "OPEN" && isCreator && (
          <button onClick={closeSplit} className="text-xs border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors font-medium">
            Close Split
          </button>
        )}
      </div>

      {/* Not joined */}
      {!isMember && status === "OPEN" && (
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl font-semibold mb-4 transition-colors"
          onClick={async () => {
            const { ref: fbRef, set } = await import("firebase/database");
            await set(fbRef(db, `splits/${splitId}/members/${uid}`), {
              name: auth.currentUser!.displayName,
              email: auth.currentUser!.email,
            });
          }}
        >
          Join Split
        </button>
      )}

      {isMember && (
        <div className="space-y-3">
          {/* UPI */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your UPI ID</h3>
            <div className="flex gap-2 items-center">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={upiInput} placeholder="example@upi"
                onChange={(e) => { setUpiInput(e.target.value); setUpiSaved(false); }}
              />
              {upiSaved && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
            </div>
            <button
              className="mt-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={savingUpi || !upiInput.trim() || isUnchanged}
              onClick={submitUpi}
            >
              {savingUpi && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {savedUpi ? "Update UPI" : "Submit UPI"}
            </button>
          </div>

          {status === "OPEN" && <AddSplitExpense splitId={splitId} members={members} />}

          <UserBalanceCards members={members} expenses={expenses} settlements={settlements} />
          <SettlementView splitId={splitId} expenses={expenses} members={members} settlements={settlements} />
          {userSettlements.length > 0 && <SettlementHistory splitId={splitId} members={members} settlements={userSettlements} />}

          {/* Expenses list */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Expenses</h3>
            {visibleExpenses.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No expenses assigned to you</p>
            ) : (
              <div className="space-y-0">
                {visibleExpenses.map(([eid, e]: any) => (
                  <div key={eid} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800">{e.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ₹{e.amount} · Paid by {members[e.paidBy]?.name}
                        {e.createdAt && ` · ${new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
                      </p>
                    </div>
                    {uid === e.paidBy && status === "OPEN" && (
                      <button
                        onClick={() => setEditingExpense({ id: eid, data: e })}
                        className="ml-3 text-xs border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Members</h3>
            <div className="space-y-2">
              {Object.entries(members).map(([id, m]: any) => (
                <div key={id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{m.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{m.upi || "No UPI"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === "CLOSED" && isCreator && (
        <div className="text-center mt-6">
          <button onClick={deleteSplit} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Delete Split
          </button>
        </div>
      )}

      {editingExpense && (
        <EditSplitExpenseModal
          splitId={splitId} expenseId={editingExpense.id} expense={editingExpense.data}
          members={members} onClose={() => setEditingExpense(null)}
        />
      )}

      <BottomNav mode="split" active="SPLIT" />
    </div>
  );
}
