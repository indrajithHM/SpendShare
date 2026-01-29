import { push, ref, set } from "firebase/database";
import { auth, db } from "./firebase";
import { useState } from "react";

export default function CreateSplitModal({ onClose }) {
  const [link, setLink] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const name = e.target.name.value.trim();
    if (!name) return;

    const splitRef = push(ref(db, "splits"));

    await set(splitRef, {
      name,
      createdAt: Date.now(),
      createdBy: auth.currentUser.uid,

      // ✅ PHASE 3: split lifecycle
      status: "OPEN",

      // ✅ MEMBERS (UPI READY)
      members: {
        [auth.currentUser.uid]: {
          name: auth.currentUser.displayName,
          email: auth.currentUser.email,
          upi: "", // can be updated later
        },
      },

      expenses: {},
    });

    setLink(`${window.location.origin}/split/${splitRef.key}`);
    e.target.reset();
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <h5 className="mb-3">Create Split</h5>

          {!link ? (
            <form onSubmit={submit}>
              <input
                name="name"
                className="form-control mb-3"
                placeholder="Split name (Trip, Dinner, etc.)"
                required
              />

              <button className="btn btn-primary w-100">Create Split</button>
            </form>
          ) : (
            <>
              <p className="mb-2 fw-semibold">Share this link</p>

              <div className="input-group mb-3">
                <input className="form-control" value={link} readOnly />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigator.clipboard.writeText(link)}
                >
                  Copy
                </button>
              </div>

              <button className="btn btn-success w-100" onClick={onClose}>
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
