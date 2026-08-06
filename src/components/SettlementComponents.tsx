"use client";
import { useState, useEffect } from "react";
import { ref, push, onValue } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { calculateSettlement } from "@/lib/calculateSettlement";
import { calculatePayments } from "@/lib/calculatepayments";
import { openUPIPayment, UPI_APPS } from "@/lib/upiUtils";

const isTinyBalance = (value: number) => Math.abs(value) < 0.02;

export function UserBalanceCards({ members, expenses, settlements }: any) {
  const { settlement } = calculateSettlement(members, Object.values(expenses || {}), settlements);
  const normalizedSettlement = Object.fromEntries(
    Object.entries(settlement).map(([uid, value]) => [uid, isTinyBalance(value as number) ? 0 : value])
  );

  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      {Object.entries(members).map(([uid, m]: [string, any]) => {
        const balance = normalizedSettlement[uid] || 0;
        const isPos = balance > 0, isNeg = balance < 0;
        return (
          <div key={uid} className={`rounded-2xl border p-3 text-center ${isPos ? "border-green-200 bg-green-50" : isNeg ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
            <p className="font-semibold text-xs text-gray-700 truncate">{m.name}</p>
            <p className={`font-bold text-sm mt-1 ${isPos ? "text-green-600" : isNeg ? "text-red-500" : "text-gray-400"}`}>
              {isPos && `Gets ₹${balance.toFixed(2)}`}
              {isNeg && `Pays ₹${Math.abs(balance).toFixed(2)}`}
              {balance === 0 && "Settled ✓"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function PartialPayRow({ splitId, fromId, toId, maxPay, debtor, creditor, uid }: any) {
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const [amt, setAmt] = useState(round2(maxPay));
  useEffect(() => { setAmt(round2(maxPay)); }, [maxPay]);

  const isPayer = fromId === uid;
  const isReceiver = toId === uid;
  if (!isPayer && !isReceiver) return null;

  const markSettled = async () => {
    if (amt <= 0 || amt > maxPay) return;
    await push(ref(db, `splits/${splitId}/settlements`), { from: fromId, to: toId, amount: amt, paidAt: Date.now() });
  };

  return (
    <div className="border-b border-gray-50 py-3 last:border-0">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-sm font-semibold text-gray-700">
          {debtor.name} → {creditor.name}
        </span>
        <span className="text-sm font-bold text-red-500">₹{maxPay.toFixed(2)}</span>
      </div>

      <input
        type="number"
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        value={amt} step="0.01" min="0.01" max={maxPay}
        onChange={(e) => setAmt(round2(Number(e.target.value)))}
      />

      {isPayer && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => openUPIPayment(
              { payeeAddress: creditor.upi, payeeName: creditor.name, amount: String(amt), currency: 'INR' },
            )}
            className="w-full flex items-center justify-center gap-2 text-sm py-2 rounded-xl bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <span>🔗</span>
            PAY VIA UPI
          </button>
        </div>
      )}

      {isReceiver && (
        <button
          className="w-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          onClick={markSettled}
        >
          Mark as Received
        </button>
      )}
    </div>
  );
}

export function SettlementView({ splitId, expenses, members, settlements = {} }: any) {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const { settlement } = calculateSettlement(members, Object.values(expenses || {}), settlements);
  const normalizedSettlement = Object.fromEntries(
    Object.entries(settlement).map(([uid, value]) => [uid, isTinyBalance(value as number) ? 0 : value])
  );

  const payments = calculatePayments(normalizedSettlement);
  const userBalance = Math.round(((normalizedSettlement[uid] ?? 0) as number) * 100) / 100;
  const isAllSettled = payments.length === 0;

  const relevantPayments = payments.filter((p) => p.from === uid || p.to === uid);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Settlement</h3>
      {isAllSettled && <p className="text-center text-gray-400 text-sm py-2">All settled 🎉</p>}
      {!isAllSettled && userBalance > 0 && (
        <p className="text-center text-green-600 font-medium text-sm py-2">
          You will receive ₹{userBalance.toFixed(2)}
        </p>
      )}
      {!isAllSettled &&
        relevantPayments.map((p) => (
          <PartialPayRow
            key={`${p.from}_${p.to}`}
            splitId={splitId}
            fromId={p.from}
            toId={p.to}
            maxPay={p.amount}
            debtor={members[p.from]}
            creditor={members[p.to]}
            uid={uid}
          />
        ))}
    </div>
  );
}

export function SettlementHistory({ splitId, members }: any) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    return onValue(ref(db, `splits/${splitId}/settlements`), (snap) => {
      if (!snap.exists()) { setHistory([]); return; }
      const uid = auth.currentUser?.uid;
      if (!uid) { setHistory([]); return; }
      const list = Object.values(snap.val())
        .filter((s: any) => s.from === uid || s.to === uid)
        .sort((a: any, b: any) => b.paidAt - a.paidAt);
      setHistory(list);
    });
  }, [splitId]);

  if (!history.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Settlement History</h3>
      <div className="space-y-2">
        {history.map((h, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-700">{members[h.from]?.name} paid {members[h.to]?.name}</p>
              <p className="text-xs text-gray-400">{new Date(h.paidAt).toLocaleString("en-IN")}</p>
            </div>
            <span className="font-bold text-sm text-green-600">₹{h.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}