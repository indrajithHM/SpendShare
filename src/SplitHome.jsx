import { onValue, ref } from "firebase/database";
import { auth, db } from "./firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import CreateSplitModal from "./CreateSplitModal";
import SplitCard from "./SplitCard";
import BottomNav from "./BottomNav";

export default function SplitHome() {
  const [splits, setSplits] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let unsubscribeDb = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setSplits([]);
        return;
      }

      const r = ref(db, "splits");

      unsubscribeDb = onValue(r, (snap) => {
        if (!snap.exists()) {
          setSplits([]);
          return;
        }

        const list = Object.entries(snap.val())
          .map(([id, s]) => ({ id, ...s }))
          // ✅ FILTER RESTORED SAFELY
          .filter(s =>
            s.createdBy === user.uid ||
            s.members?.[user.uid]
          )
          .reverse();

        setSplits(list);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDb) unsubscribeDb();
    };
  }, []);

  return (
    <div>
    <div className="container py-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Your Splits</h5>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          + Create Split
        </button>
      </div>

      {/* SPLIT LIST */}
      {splits.length === 0 && (
        <p className="text-muted">No splits yet</p>
      )}

      {splits.map(s => (
        <SplitCard key={s.id} split={s} />
      ))}

      {showCreate && (
        <CreateSplitModal onClose={() => setShowCreate(false)} />
      )}


    </div>
     <div className="container pb-5" >
          <BottomNav
  mode="split"
  active="SPLIT"
/>

      </div>
      </div>
  );
}
