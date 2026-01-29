import { onValue, ref } from "firebase/database";
import { auth, db } from "./firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import CreateSplitModal from "./CreateSplitModal";
import SplitCard from "./SplitCard";
import BottomNav from "./BottomNav";
import JoinSplitViaLinkModal from "./JoinSplitViaLinkModal";

export default function SplitHome() {
  const [splits, setSplits] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loadingSplits, setLoadingSplits] = useState(true);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    let unsubscribeDb = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setSplits([]);
        setLoadingSplits(false); // auth resolved, no user
        return;
      }

      setLoadingSplits(true);

      const r = ref(db, "splits");

      unsubscribeDb = onValue(r, (snap) => {
        if (!snap.exists()) {
          setSplits([]);
          setLoadingSplits(false);
          return;
        }

        const list = Object.entries(snap.val())
          .map(([id, s]) => ({ id, ...s }))
          .filter((s) => s.createdBy === user.uid || s.members?.[user.uid])
          .reverse();

        setSplits(list);
        setLoadingSplits(false); // 🔑 first snapshot received
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
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => setShowJoin(true)}
            >
              Join via Link
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreate(true)}
            >
              + Create Split
            </button>
          </div>
        </div>

        {/* SPLIT LIST */}
        {loadingSplits ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-2" />
            <div className="text-muted">Loading splits…</div>
          </div>
        ) : splits.length === 0 ? (
          <p className="text-muted">No splits yet</p>
        ) : null}

        {splits.map((s) => (
          <SplitCard key={s.id} split={s} />
        ))}

        {showCreate && (
          <CreateSplitModal onClose={() => setShowCreate(false)} />
        )}
        {showJoin && (
          <JoinSplitViaLinkModal onClose={() => setShowJoin(false)} />
        )}
      </div>
      <div className="container pb-5">
        <BottomNav mode="split" active="SPLIT" />
      </div>
    </div>
  );
}
