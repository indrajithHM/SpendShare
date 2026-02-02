import { onValue, ref } from "firebase/database";
import { db, auth } from "./firebase";
import { useEffect, useState } from "react";

export default function SettlementHistory({ splitId, members }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const r = ref(db, `splits/${splitId}/settlements`);

    return onValue(r, (snap) => {
      if (!snap.exists()) {
        setHistory([]);
        return;
      }

      const uid = auth.currentUser?.uid;
      if (!uid) {
        setHistory([]);
        return;
      }

      const list = Object.values(snap.val())
        .filter(
          (s) => s.from === uid || s.to === uid
        )
        .sort((a, b) => b.paidAt - a.paidAt);

      setHistory(list);
    });
  }, [splitId]);

  if (history.length === 0) return null;

  return (
    <div className="card p-3 mt-3">
      <h6 className="mb-2">Settlement History</h6>

      {history.map((h, i) => (
        <div key={i} className="border-bottom py-2">
          <strong>
            {members[h.from]?.name} paid {members[h.to]?.name}
          </strong>
          <br />
          <small className="text-muted">
            ₹{h.amount} • {new Date(h.paidAt).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}