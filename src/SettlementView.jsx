import { auth, db } from "./firebase";
import { ref, push } from "firebase/database";
import { calculateSettlement } from "./calculateSettlement";
import { useState } from "react";

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

  return (
    <div className="card p-3 mb-3">
      <h6 className="mb-2">Settlement</h6>

      {/* ✅ ALL SETTLED MESSAGE */}
      {debtors.length === 0 && (
        <p className="text-muted mb-0 text-center">
          All settled 🎉
        </p>
      )}

      {/* 🔻 PARTIAL PAY ROWS */}
      {debtors.map(debtor =>
        creditors.map(creditor => {
          if (debtor.id === creditor.id) return null;

          const maxPay = Math.min(
            debtor.amount,
            creditor.amount
          );

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
      )}
    </div>
  );
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

  // 🔒 Only debtor sees Pay / Mark Paid
  if (fromId !== uid) return null;

  return (
    <div className="border-bottom py-2">
    <div className="d-flex justify-content-between">
      <strong>
        {debtor.name} → {creditor.name}
      </strong>
      <strong>₹{maxPay.toFixed(2)}</strong>
    </div>

    {/* Amount input */}
    <input
      type="number"
      className="form-control form-control-sm mt-2 py-2"
      value={amt}
      min={1}
      max={maxPay}
      onChange={e => setAmt(Number(e.target.value))}
    />

    {/* Action buttons */}
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
