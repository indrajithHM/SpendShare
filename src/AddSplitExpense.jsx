import { push, ref } from "firebase/database";
import { db, auth } from "./firebase";
import { useState, useEffect } from "react";

export default function AddSplitExpense({ splitId, members }) {
  const uid = auth.currentUser.uid;

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState("EQUAL_ALL");
  const [selected, setSelected] = useState({});
  const [shares, setShares] = useState({});

  const memberEntries = Object.entries(members || {});

  /* ===== AUTO-SELECT ALL FOR EQUAL_SELECTED ===== */
  useEffect(() => {
    if (splitType === "EQUAL_SELECTED") {
      const all = {};
      memberEntries.forEach(([id]) => {
        all[id] = true;
      });
      setSelected(all);
    }
  }, [splitType]);

  /* ===== TOGGLE MEMBER ===== */
  const toggleSelect = (id) => {
    setSelected(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  /* ===== SUBMIT ===== */
  const submit = async () => {
    const amt = Number(amount);
    if (!desc || amt <= 0) return;

    let participants = {};

    /* ===== EQUAL – ALL ===== */
    if (splitType === "EQUAL_ALL") {
      const perHead = amt / memberEntries.length;
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

      const perHead = amt / selectedIds.length;
      selectedIds.forEach(id => {
        participants[id] = { share: perHead };
      });
    }

    /* ===== UNEQUAL ===== */
    if (splitType === "UNEQUAL") {
      let total = 0;

      memberEntries.forEach(([id]) => {
        const value = Number(shares[id] || 0);
        
        // ✅ Only add members with non-zero shares
        if (value > 0) {
          participants[id] = { share: value };
          total += value;
        }
      });

      if (Object.keys(participants).length === 0) {
        alert("At least one member must have a share");
        return;
      }

      if (total !== amt) {
        alert("Unequal split total must equal expense amount");
        return;
      }
    }

    await push(ref(db, `splits/${splitId}/expenses`), {
      description: desc,
      amount: amt,
      paidBy: uid,
      splitType,
      participants,
      createdAt: Date.now()
    });

    /* ===== RESET ===== */
    setDesc("");
    setAmount("");
    setShares({});
    setSelected({});
    setSplitType("EQUAL_ALL");
  };

  return (
    <div className="card p-3 mb-3">
      <h6>Add Expense</h6>

      <input
        className="form-control mb-2"
        placeholder="Description"
        value={desc}
        onChange={e => setDesc(e.target.value)}
      />

      <input
        className="form-control mb-2"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      {/* ===== SPLIT TYPE ===== */}
      <div className="mb-2">
        {["EQUAL_ALL", "EQUAL_SELECTED", "UNEQUAL"].map(type => (
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

      {/* ===== EQUAL SELECTED ===== */}
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
              <label className="form-check-label">
                {m.name}
              </label>
            </div>
          ))}
        </div>
      )}

      {/* ===== UNEQUAL ===== */}
      {splitType === "UNEQUAL" && (
        <div className="border rounded p-2 mb-2">
          {memberEntries.map(([id, m]) => (
            <div key={id} className="d-flex justify-content-between mb-1">
              <span>{m.name}</span>
              <input
                type="number"
                className="form-control form-control-sm w-50"
                placeholder="₹"
                value={shares[id] ?? ""}
                onChange={e =>
                  setShares(prev => ({
                    ...prev,
                    [id]: e.target.value
                  }))
                }
              />
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-primary w-100" onClick={submit}>
        Add Expense
      </button>
    </div>
  );
}