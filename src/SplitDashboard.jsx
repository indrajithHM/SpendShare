import { onValue, ref, update, remove } from "firebase/database";
import { db, auth } from "./firebase";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import JoinSplit from "./JoinSplit";
import AddSplitExpense from "./AddSplitExpense";
import SettlementView from "./SettlementView";
import SettlementHistory from "./SettlementHistory";
import EditSplitExpenseModal from "./EditSplitExpenseModal";
import UserBalanceCards from "./UserBalanceCard";
import BottomNav from "./BottomNav";

export default function SplitDashboard() {
  const { splitId } = useParams();
  const navigate = useNavigate();

  const [split, setSplit] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // UPI state
  const [upiInput, setUpiInput] = useState("");
  const [savingUpi, setSavingUpi] = useState(false);
  const [upiSaved, setUpiSaved] = useState(false);
  const [loadingSplit, setLoadingSplit] = useState(true);

  const uid = auth.currentUser?.uid;

  
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/split");
    }
  };
  /* ================= LOAD SPLIT ================= */
  useEffect(() => {
    const unsub = onValue(ref(db, `splits/${splitId}`), (snap) => {
      if (snap.exists()) {
        setSplit(snap.val());
      }
      setLoadingSplit(false);
    });

    return unsub;
  }, [splitId]);

  /* ================= INIT UPI ================= */
  useEffect(() => {
    if (split && uid && split.members?.[uid]) {
      setUpiInput(split.members[uid].upi || "");
      setUpiSaved(false);
    }
  }, [split, uid]);

  if (loadingSplit) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" />
          <div className="text-muted">Loading split…</div>
        </div>
      </div>
    );
  }

  if (!split) {
    return <p className="text-center mt-3 text-muted">Split not found</p>;
  }

  const members = split.members || {};
  const expenses = split.expenses || {};
  const settlements = split.settlements || {};
  const status = split.status || "OPEN";

  const isMember = uid && members[uid];
  const isCreator = uid === split.createdBy;

  const savedUpi = members[uid]?.upi || "";
  const isUnchanged = upiInput.trim() === savedUpi.trim();

  /* ================= SAVE / UPDATE UPI ================= */
  const submitUpi = async () => {
    if (!upiInput.trim() || isUnchanged) return;

    setSavingUpi(true);
    await update(ref(db, `splits/${splitId}/members/${uid}`), {
      upi: upiInput.trim(),
    });
    setSavingUpi(false);
    setUpiSaved(true);
  };

  /* ================= CLOSE SPLIT ================= */
  const closeSplit = async () => {
    if (!window.confirm("Close this split? No more expenses can be added."))
      return;
    await update(ref(db, `splits/${splitId}`), { status: "CLOSED" });
  };

  /* ================= DELETE SPLIT ================= */
  const deleteSplit = async () => {
    if (
      !window.confirm("This will permanently delete the split. Are you sure?")
    )
      return;
    await remove(ref(db, `splits/${splitId}`));
    navigate("/split");
  };

  const visibleExpenses = Object.entries(expenses)
    .filter(([_, e]) => e.paidBy === uid || e.participants?.[uid])
    .sort(([, a], [, b]) => {
      // newest first
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-10 col-lg-8 col-xl-6 p-3">
        <div>
          <div className="container py-3">
            {/* ================= STICKY HEADER ================= */}
            <div className="sticky-header bg-white">
              <div className="d-flex justify-content-between align-items-center py-2">
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={goBack}
                  >
                    <i className="bi bi-arrow-left"></i>
                  </button>

                  <h4 className="mb-0">{split.name}</h4>
                </div>

                {status === "OPEN" && isCreator && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={closeSplit}
                  >
                    Close Split
                  </button>
                )}
              </div>
            </div>

            {/* ================= NOT JOINED ================= */}
            {!isMember && status === "OPEN" && <JoinSplit splitId={splitId} />}

            {/* ================= JOINED ================= */}
            {isMember && (
              <>
                {/* ---------- UPI ---------- */}
                <div className="card p-3 mb-3">
                  <h6>Your UPI ID</h6>

                  <div className="d-flex gap-2 align-items-center">
                    <input
                      className="form-control"
                      value={upiInput}
                      placeholder="example@upi"
                      onChange={(e) => {
                        setUpiInput(e.target.value);
                        setUpiSaved(false);
                      }}
                    />
                    {upiSaved && (
                      <i className="bi bi-check-circle-fill text-success fs-4" />
                    )}
                  </div>

                  <button
                    className="btn btn-primary btn-sm mt-2"
                    disabled={savingUpi || !upiInput.trim() || isUnchanged}
                    onClick={submitUpi}
                  >
                    {savedUpi ? "Update UPI" : "Submit UPI"}
                  </button>
                </div>

                {/* ---------- ADD EXPENSE ---------- */}
                {status === "OPEN" && (
                  <AddSplitExpense splitId={splitId} members={members} />
                )}

                <UserBalanceCards
                  members={members}
                  expenses={expenses}
                  settlements={settlements}
                />

                {/* ================================================= */}
                {/* ================= EXPENSES ===================== */}
                {/* ================================================= */}
                <div className="card p-3 mt-3">
                  <h6>Expenses</h6>

                  {/* {Object.keys(expenses).length === 0 && (
              <p className="text-muted">No expenses assigned to you</p>
            )} */}
                  {visibleExpenses.length === 0 && (
                    <p className="text-muted">No expenses assigned to you</p>
                  )}

                  {visibleExpenses.map(([eid, e]) => (
                    <div
                      key={eid}
                      className="d-flex justify-content-between align-items-center border-bottom py-2"
                    >
                      <div>
                        <strong>{e.description}</strong>
                        <br />
                        <small className="text-muted">
                          ₹{e.amount} • Paid by {members[e.paidBy]?.name}
                          <br />
                          {e.createdAt && (
                            <span>
                              {new Date(e.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          )}
                        </small>
                      </div>

                      {uid === e.paidBy && status === "OPEN" && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            setEditingExpense({ id: eid, data: e })
                          }
                        >
                          View/Edit
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* ================================================= */}
                {/* ================= SETTLEMENT =================== */}
                {/* ================================================= */}
                <div className="py-3">
                  <SettlementView
                    splitId={splitId}
                    expenses={expenses}
                    members={members}
                    settlements={settlements}
                  />
                </div>

                {/* ================================================= */}
                {/* ================= PAYMENT HISTORY ============== */}
                {/* ================================================= */}
                {Object.keys(settlements).length > 0 && (
                  <SettlementHistory splitId={splitId} members={members} />
                )}

                {/* ---------- MEMBERS ---------- */}
                <div className="card p-3 mb-5">
                  <h6>Members</h6>
                  {Object.entries(members).map(([id, m]) => (
                    <div
                      key={id}
                      className="d-flex justify-content-between border-bottom py-1"
                    >
                      <span>{m.name}</span>
                      <small className="text-muted">{m.upi || "No UPI"}</small>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ================= DELETE ================= */}
            {status === "CLOSED" && isCreator && (
              <div className="text-center mt-4">
                <button className="btn btn-danger" onClick={deleteSplit}>
                  Delete Split
                </button>
              </div>
            )}

            {/* ================= EDIT MODAL ================= */}
            {editingExpense && (
              <EditSplitExpenseModal
                splitId={splitId}
                expenseId={editingExpense.id}
                expense={editingExpense.data}
                members={members}
                onClose={() => setEditingExpense(null)}
              />
            )}
          </div>
          <BottomNav mode="split" active="SPLIT" />
        </div>
      </div>
    </div>
  );
}
