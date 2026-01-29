import { ref, update, remove } from "firebase/database";
import { db, auth } from "./firebase";
import { useState, useEffect } from "react";

export default function EditSplitExpenseModal({
  splitId,
  expenseId,
  expense,
  members,
  onClose,
}) {
  const uid = auth.currentUser.uid;
  const memberEntries = Object.entries(members || {});

  /* ================= STATE ================= */
  const [desc, setDesc] = useState(expense.description || "");
  const [splitType, setSplitType] = useState(expense.splitType || "EQUAL_ALL");
  const [amount, setAmount] = useState(expense.amount || 0);
  const [selected, setSelected] = useState({});
  const [shares, setShares] = useState({});

  /* ================= INIT FROM EXPENSE ================= */
  useEffect(() => {
    if (expense.participants) {
      const s = {};
      Object.entries(expense.participants).forEach(([id, p]) => {
        s[id] = p.share;
      });
      setShares(s);

      const sel = {};
      Object.keys(expense.participants).forEach((id) => {
        sel[id] = true;
      });
      setSelected(sel);
    }
  }, [expense]);

  /* ================= AUTO-SELECT FOR EQUAL_SELECTED ================= */
  useEffect(() => {
    if (splitType === "EQUAL_SELECTED") {
      const all = {};
      memberEntries.forEach(([id]) => {
        all[id] = true;
      });
      setSelected(all);
    }
  }, [splitType]);

  /* ================= TOGGLE MEMBER ================= */
  const toggleSelect = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ================= CALCULATE TOTAL ================= */
  const totalAmount =
    splitType === "UNEQUAL"
      ? Object.values(shares).reduce((s, v) => s + Number(v || 0), 0)
      : Number(amount || 0);

  /* ================= SAVE ================= */
  const save = async () => {
    if (!desc.trim() || totalAmount <= 0) return;

    let participants = {};

    /* ===== EQUAL – ALL ===== */
    if (splitType === "EQUAL_ALL") {
      const perHead = totalAmount / memberEntries.length;
      memberEntries.forEach(([id]) => {
        participants[id] = { share: perHead };
      });
    }

    /* ===== EQUAL – SELECTED ===== */
    if (splitType === "EQUAL_SELECTED") {
      const selectedIds = memberEntries
        .filter(([id]) => selected[id])
        .map(([id]) => id);

      if (selectedIds.length === 0) {
        alert("Select at least one member");
        return;
      }

      const perHead = totalAmount / selectedIds.length;
      selectedIds.forEach((id) => {
        participants[id] = { share: perHead };
      });
    }

    /* ===== UNEQUAL ===== */
    if (splitType === "UNEQUAL") {
      let total = 0;

      memberEntries.forEach(([id]) => {
        const value = Number(shares[id] || 0);
        if (value > 0) {
          participants[id] = { share: value };
          total += value;
        }
      });

      if (Object.keys(participants).length === 0) {
        alert("At least one member must have a share");
        return;
      }

      if (total !== Number(amount)) {
        alert("Unequal split total must equal amount");
        return;
      }
    }

    await update(ref(db, `splits/${splitId}/expenses/${expenseId}`), {
      description: desc.trim(),
      amount: totalAmount,
      splitType,
      participants,
    });

    onClose();
  };

  /* ================= DELETE ================= */
  const del = async () => {
    if (!window.confirm("Delete this expense?")) return;
    await remove(ref(db, `splits/${splitId}/expenses/${expenseId}`));
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h6 className="modal-title">Edit Expense</h6>
            <button className="btn-close" onClick={onClose} />
          </div>

          {/* BODY */}
          <div className="modal-body">
            <input
              className="form-control mb-2"
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            {splitType !== "UNEQUAL" && (
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            )}

            {/* SPLIT TYPE */}
            <div className="mb-2">
              {["EQUAL_ALL", "EQUAL_SELECTED", "UNEQUAL"].map((type) => (
                <div className="form-check" key={type}>
                  <input
                    type="radio"
                    className="form-check-input"
                    checked={splitType === type}
                    onChange={() => setSplitType(type)}
                  />
                  <label className="form-check-label">
                    {type === "EQUAL_ALL" && "Equal – All"}
                    {type === "EQUAL_SELECTED" && "Equal – Selected"}
                    {type === "UNEQUAL" && "Unequal"}
                  </label>
                </div>
              ))}
            </div>

            {/* EQUAL SELECTED */}
            {splitType === "EQUAL_SELECTED" && (
              <div className="border rounded p-2 mb-2">
                {memberEntries.map(([id, m]) => (
                  <div key={id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={!!selected[id]}
                      onChange={() => toggleSelect(id)}
                    />
                    <label className="form-check-label">{m.name}</label>
                  </div>
                ))}
              </div>
            )}

            {/* UNEQUAL */}
            {splitType === "UNEQUAL" && (
              <div className="border rounded p-2 mb-2">
                {memberEntries.map(([id, m]) => (
                  <div key={id} className="d-flex justify-content-between mb-1">
                    <span>{m.name}</span>
                    <input
                      type="number"
                      className="form-control form-control-sm w-50"
                      value={shares[id] ?? ""}
                      onChange={(e) =>
                        setShares((prev) => ({
                          ...prev,
                          [id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* TOTAL */}
            <div className="text-end mb-2">
              <small className="text-muted">Total: ₹{totalAmount}</small>
            </div>

            <button className="btn btn-primary w-100 mb-2" onClick={save}>
              Save Changes
            </button>

            <button className="btn btn-outline-danger w-100" onClick={del}>
              Delete Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
