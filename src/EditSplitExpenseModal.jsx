import { ref, update, remove } from "firebase/database";
import { db } from "./firebase";
import { useState } from "react";

export default function EditSplitExpenseModal({
  splitId,
  expenseId,
  expense,
  members,
  onClose
}) {
  const [desc, setDesc] = useState(expense.description || "");
  const [shares, setShares] = useState(expense.participants || {});

  /* ================= CALCULATE TOTAL ================= */
  const totalAmount = Object.values(shares)
    .reduce((sum, s) => sum + Number(s.share || 0), 0);

  /* ================= SAVE ================= */
  const save = async () => {
    if (!desc.trim()) return;

    await update(
      ref(db, `splits/${splitId}/expenses/${expenseId}`),
      {
        description: desc.trim(),
        participants: shares,
        amount: totalAmount // ✅ CRITICAL FIX
      }
    );

    onClose();
  };

  /* ================= DELETE ================= */
  const del = async () => {
    if (!window.confirm("Delete this expense?")) return;

    await remove(
      ref(db, `splits/${splitId}/expenses/${expenseId}`)
    );

    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">

          <h6 className="mb-3">Edit Expense</h6>

          {/* DESCRIPTION */}
          <input
            className="form-control mb-3"
            placeholder="Expense description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />

          {/* SHARES */}
          <div className="border rounded p-2 mb-3">
            {Object.entries(members).map(([uid, m]) => (
              <div
                key={uid}
                className="d-flex justify-content-between align-items-center mb-2"
              >
                <span>{m.name}</span>

                <input
                  type="number"
                  min="0"
                  className="form-control form-control-sm w-50"
                  value={shares[uid]?.share || 0}
                  onChange={e =>
                    setShares(prev => ({
                      ...prev,
                      [uid]: {
                        share: Math.max(0, Number(e.target.value))
                      }
                    }))
                  }
                />
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="text-end mb-2">
            <small className="text-muted">
              Total: ₹{totalAmount}
            </small>
          </div>

          {/* ACTIONS */}
          <button
            className="btn btn-primary w-100 mb-2"
            disabled={totalAmount <= 0}
            onClick={save}
          >
            Save Changes
          </button>

          <button
            className="btn btn-outline-danger w-100"
            onClick={del}
          >
            Delete Expense
          </button>
        </div>
      </div>
    </div>
  );
}
