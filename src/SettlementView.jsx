import { auth, db } from "./firebase";
import { ref, push } from "firebase/database";
import { calculateSettlement } from "./calculateSettlement";
import { useState, useEffect } from "react";


export default function SettlementView({
  splitId,
  expenses,
  members,
  settlements = {}
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const { settlement } = calculateSettlement(
    members,
    Object.values(expenses || {}),
    settlements
  );

  /* 🔹 COMPUTE DEBTORS & CREDITORS */
  const debtors = Object.entries(settlement)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, amount: Math.abs(v) }));

  const creditors = Object.entries(settlement)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, amount: v }));

  const upiLink = (upi, amount, name) =>
    `upi://pay?pa=${upi}&pn=${encodeURIComponent(
      name
    )}&am=${amount.toFixed(2)}&cu=INR`;
    
    const isAllSettled = Object.values(settlement).every(
  v => Math.abs(v) < 0.01);

  const userBalance = settlement[uid] ?? 0;
{/* ✅ ALL SETTLED */}
{isAllSettled && (
  <p className="text-muted mb-0 text-center">
    All settled 🎉
  </p>
)}

{/* ℹ️ USER IS CREDITOR */}
{!isAllSettled && userBalance > 0 && (
  <p className="text-muted mb-0 text-center">
    You will receive ₹{userBalance.toFixed(2)}
  </p>
)}

{/* 🔻 USER OWES MONEY */}
{!isAllSettled && userBalance < 0 &&
  debtors.map(debtor =>
    creditors.map(creditor => {
      if (debtor.id === creditor.id) return null;

      const maxPay = Math.min(debtor.amount, creditor.amount);
      if (maxPay <= 0) return null;

      return (
        <PartialPayRow
          key={`${debtor.id}_${creditor.id}`}
          splitId={splitId}
          fromId={debtor.id}
          toId={creditor.id}
          maxPay={maxPay}
          debtor={members[debtor.id]}
          creditor={members[creditor.id]}
          uid={uid}
          upiLink={upiLink}
        />
      );
    })
  )
}

}

/* ================= PARTIAL PAYMENT ROW ================= */
function PartialPayRow({
  splitId,
  fromId,
  toId,
  maxPay,
  debtor,
  creditor,
  uid,
  upiLink
}) {
  const [amt, setAmt] = useState(maxPay);

  // 🔑 Sync amount when maxPay changes
  useEffect(() => {
    setAmt(maxPay);
  }, [maxPay]);

  if (fromId !== uid) return null;

  return (
    <div className="border-bottom py-2">
      <div className="d-flex justify-content-between">
        <strong>
          {debtor.name} → {creditor.name}
        </strong>
        <strong>₹{maxPay.toFixed(2)}</strong>
      </div>

      <input
        type="number"
        className="form-control form-control-sm mt-2 py-2"
        value={amt}
        min={1}
        max={maxPay}
        onChange={e => setAmt(Number(e.target.value))}
      />

      <div className="d-flex gap-2 mt-2">
        <a
          href={upiLink(creditor.upi, amt, creditor.name)}
          className="btn btn-success btn-sm flex-fill py-2"
        >
          Pay via UPI
        </a>

        <button
          className="btn btn-outline-primary btn-sm flex-fill"
          onClick={async () => {
            if (amt <= 0 || amt > maxPay) return;

            await push(
              ref(db, `splits/${splitId}/settlements`),
              {
                from: fromId,
                to: toId,
                amount: amt,
                paidAt: Date.now()
              }
            );
          }}
        >
          Mark Paid
        </button>
      </div>
    </div>
  );
}